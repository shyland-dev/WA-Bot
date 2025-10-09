import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { handleCommand } from './commands/_index';
import { debugLog, rotateDebugLogs } from './utils/debug';

// Rotate logs on startup if they're too large
rotateDebugLogs(10); // Rotate if debug.log is larger than 10MB

const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'wa-bot',
  }),
  webVersionCache: {
    type: 'local',
  },
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-extensions',
      '--disable-gpu',
      '--no-zygote',
    ],
    executablePath: '/usr/bin/chromium-browser'
  },
  takeoverOnConflict: true
});

client.on('qr', (qr: string) => {
  try {
    debugLog('QR Code received. Please scan with your phone. |', qr);
    qrcode.generate(qr, { small: true });
  } catch (error) {
    debugLog('Error generating QR code:', error);
  }
});

client.on('loading_screen', (percent: number, message: string) => {
  try {
    debugLog(`Loading: ${percent}% - ${message}`);
  } catch (error) {
    debugLog('Error in loading screen:', error);
  }
});

client.on('authenticated', (session: any) => {
  try {
    debugLog('Authentication successful |', session);
  } catch (error) {
    debugLog('Error in authenticated event:', error);
  }
});

client.on('auth_failure', (message: string) => {
  try {
    debugLog('Authentication failed:', message);
  } catch (error) {
    debugLog('Error in auth failure event:', error);
  }
});

client.on('ready', async () => {
  try {
    debugLog('Bot is ready and connected to WhatsApp!');
    
    // Set presence to online
    await client.sendPresenceAvailable();
    debugLog('Presence set to online');

    // Set status message
    const currentTime = new Date().toLocaleString();
    const statusMessage = '🤖 Bot is online! Type /help for commands. | Last active: ' + currentTime;
    debugLog('Setting status message to:', statusMessage);
    await client.setStatus(statusMessage);
    debugLog('Status message updated successfully');

    // Get client info
    try {
      const clientInfo = client.info;
      if (clientInfo) {
        debugLog(`Connected as: ${clientInfo.pushname} (${clientInfo.wid.user})`);
      }
    } catch (infoError) {
      debugLog('Could not get client info:', infoError);
    }
  } catch (error) {
    debugLog('Error in ready event:', error);
  }
});

client.on('message', async (message: Message) => {
  try {
    // Only process messages that aren't from the bot itself
    if (message.fromMe) {
      return;
    }
    
    debugLog(`Message received from ${message.from}: ${message.body}`);
    await handleCommand(message);
  } catch (error) {
    debugLog('Error handling message:', error);
  }
});

client.on('disconnected', (reason: string) => {
  try {
    debugLog('Client disconnected:', reason);
  } catch (error) {
    debugLog('Error in disconnected event:', error);
  }
});

try {
  debugLog('Initializing WhatsApp bot...');
  client.initialize();
} catch (error) {
  debugLog('Error initializing client:', error);
}
