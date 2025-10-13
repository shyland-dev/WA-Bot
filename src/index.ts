import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { handleCommand } from './commands/_index';
import { saveReadyTimestamp } from './commands/uptime';
import { debugLog, rotateDebugLogs } from './utils/debug';
import { debug } from 'console';

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
    // executablePath: '/usr/bin/chromium-browser',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--no-zygote',
    ],
  },
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

    // Save ready timestamp for uptime tracking
    saveReadyTimestamp();

    // Set presence to online
    await client.sendPresenceAvailable();
    debugLog('Presence set to online');

    // Set status message
    const currentTime = new Date().toLocaleString();
    const statusMessage =
      '🤖 Bot is online! Type /help for commands. | Last active: ' +
      currentTime;
    debugLog('Setting status message to:', statusMessage);
    await client.setStatus(statusMessage);
    debugLog('Status message updated successfully');

    // Get client info
    try {
      const clientInfo = client.info;
      if (clientInfo) {
        debugLog(
          `Connected as: ${clientInfo.pushname} (${clientInfo.wid.user})`,
        );
      }
    } catch (infoError) {
      debugLog('Could not get client info:', infoError);
    }

    // On every X minutes, send a message to self to keep the session alive
    const minutesTimeout = 5;
    const imAlive = async (msg = '🤖 Bot is still alive!') => {
      try {
        const chat = await client.getChatById("120363403106512185@g.us");
        if (chat) {
          await client.sendMessage(chat.id._serialized, msg);
          debugLog('Sent keep-alive message to self');
        }
      } catch (keepAliveError) {
        debugLog('Error sending keep-alive message:', keepAliveError);
      }
    }

    await imAlive('🤖 Bot initiated!'); // Initial call
    setInterval(async () => {
      await imAlive();
    }, minutesTimeout * 60 * 1000);
    debugLog(`Keep-alive messages set every ${minutesTimeout} minutes`);
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
