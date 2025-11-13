import express, { Request, Response } from 'express';
import { debugLog } from '../utils/debug';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.API_PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Token management
const DATA_DIR = path.join(process.cwd(), 'data');
const API_TOKEN_FILE = path.join(DATA_DIR, 'api-token.json');

interface ApiTokenData {
  token: string;
  createdAt: string;
}

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Load or generate API token
function loadOrGenerateToken(): string {
  try {
    ensureDataDir();
    
    if (fs.existsSync(API_TOKEN_FILE)) {
      const data = fs.readFileSync(API_TOKEN_FILE, 'utf8');
      const tokenData: ApiTokenData = JSON.parse(data);
      debugLog('API Token loaded from file');
      return tokenData.token;
    } else {
      // Generate new token
      const newToken = uuidv4();
      const tokenData: ApiTokenData = {
        token: newToken,
        createdAt: new Date().toISOString()
      };
      fs.writeFileSync(API_TOKEN_FILE, JSON.stringify(tokenData, null, 2));
      debugLog('New API Token generated and saved:', newToken);
      return newToken;
    }
  } catch (error) {
    debugLog('Error loading/generating API token:', error);
    // Fallback to generating a new token
    return uuidv4();
  }
}

const API_TOKEN = loadOrGenerateToken();

// Store client instance (will be set from main index.ts)
let whatsappClient: any = null;

export function setWhatsAppClient(client: any) {
  whatsappClient = client;
  debugLog('WhatsApp client set for API server');
}

// Authentication middleware
function authenticateToken(req: Request, res: Response, next: any) {
  const token = req.headers['authorization']?.replace('Bearer ', '') || req.body.token || req.query.token;
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'No token provided. Please include token in Authorization header, request body, or query parameter.'
    });
  }
  
  if (token !== API_TOKEN) {
    debugLog('Invalid API token attempt:', token);
    return res.status(403).json({
      success: false,
      error: 'Invalid token'
    });
  }
  
  next();
}

// Health check endpoint (no auth required)
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'online',
    timestamp: new Date().toISOString()
  });
});

// Get API token info endpoint (no auth required, but doesn't show the token)
app.get('/api/token/info', (req: Request, res: Response) => {
  try {
    if (fs.existsSync(API_TOKEN_FILE)) {
      const data = fs.readFileSync(API_TOKEN_FILE, 'utf8');
      const tokenData: ApiTokenData = JSON.parse(data);
      res.json({
        success: true,
        exists: true,
        createdAt: tokenData.createdAt,
        message: 'Token exists. Check your data/api-token.json file or server logs for the actual token.'
      });
    } else {
      res.json({
        success: true,
        exists: false,
        message: 'No token file found. Token will be generated on first API server start.'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Error reading token info'
    });
  }
});

// Send message endpoint
app.post('/api/send', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { message, number, chatId } = req.body;
    
    // Validate required fields
    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'Message is required'
      });
    }
    
    if (!number && !chatId) {
      return res.status(400).json({
        success: false,
        error: 'Either number or chatId is required'
      });
    }
    
    // Check if WhatsApp client is ready
    if (!whatsappClient) {
      return res.status(503).json({
        success: false,
        error: 'WhatsApp client not initialized'
      });
    }
    
    // Determine the chat ID to use
    let targetChatId: string;
    
    if (chatId) {
      targetChatId = chatId;
    } else {
      // Format number to WhatsApp ID format (e.g., 5516997517838@c.us)
      const formattedNumber = number.replace(/[^\d]/g, ''); // Remove non-digits
      targetChatId = `${formattedNumber}@c.us`;
    }
    
    debugLog('API: Sending message to', targetChatId, 'Message:', message);
    
    // Send the message
    await whatsappClient.sendMessage(targetChatId, message);
    
    res.json({
      success: true,
      message: 'Message sent successfully',
      targetChatId,
      timestamp: new Date().toISOString()
    });
    
    debugLog('API: Message sent successfully to', targetChatId);
    
  } catch (error: any) {
    debugLog('API: Error sending message:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send message',
      details: error.message
    });
  }
});

// Get client info endpoint
app.get('/api/info', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!whatsappClient) {
      return res.status(503).json({
        success: false,
        error: 'WhatsApp client not initialized'
      });
    }
    
    const info = whatsappClient.info;
    const state = await whatsappClient.getState();
    
    res.json({
      success: true,
      client: {
        name: info?.pushname || 'N/A',
        number: info?.wid?.user || 'N/A',
        platform: info?.platform || 'N/A',
        state: state
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    debugLog('API: Error getting client info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get client info',
      details: error.message
    });
  }
});

// Start the API server
export function startApiServer() {
  app.listen(PORT, () => {
    debugLog(`🚀 API Server started on port ${PORT}`);
    debugLog(`📝 API Token: ${API_TOKEN}`);
    debugLog(`💾 Token saved to: ${API_TOKEN_FILE}`);
    debugLog(`📍 Available endpoints:`);
    debugLog(`\tGET  /health              - Health check (no auth)`);
    debugLog(`\tGET  /api/token/info      - Token info (no auth)`);
    debugLog(`\tPOST /api/send            - Send message (auth required)`);
    debugLog(`\tGET  /api/info            - Get client info (auth required)`);
    debugLog(`🔒 Use token in Authorization header: Bearer ${API_TOKEN}`);
  });
  
  return app;
}

export default app;
