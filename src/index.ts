import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { handleCommand } from './commands/_index';
import { saveReadyTimestamp } from './commands/uptime';
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
  debugLog('QR Code received. Please scan with your phone. |', qr);
  qrcode.generate(qr, { small: true });
});

client.on('loading_screen', (percent: number, message: string) => {
  debugLog(`Loading: ${percent}% - ${message}`);
});

client.on('authenticated', (session: any) => {
  debugLog('Authentication successful |', session);
});

client.on('auth_failure', (message: string) => {
  debugLog('Authentication failed:', message);
});

client.on('ready', async () => {
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
  const clientInfo = client.info;
  if (clientInfo) {
    debugLog(
      `Connected as: ${clientInfo.pushname} (${clientInfo.wid.user})`,
    );
  }

  // On every X minutes, send a message to self to keep the session alive
  const minutesTimeout = 5;
  const imAlive = async (msg = '🤖 Bot is still alive!') => {
    await client.sendMessage("120363403106512185@g.us", msg);
    debugLog('Sent keep-alive message to self');
  };

  await imAlive('🤖 Bot initiated!'); // Initial call
  setInterval(async () => {
    await imAlive();
  }, minutesTimeout * 60 * 1000);
  debugLog(`Keep-alive messages set every ${minutesTimeout} minutes`);
});

client.on('message', async (message: Message) => {
  // Only process messages that aren't from the bot itself
  if (message.fromMe) {
    return;
  }

  debugLog(`Message received from ${message.from}: ${message.body}`);
  await handleCommand(message);
});

client.on('disconnected', (reason: string) => {
  debugLog('Client disconnected:', reason);
});

debugLog('Initializing WhatsApp bot...');
client.initialize();
