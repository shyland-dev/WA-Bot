import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { handleCommand } from './commands/_index';
import { saveReadyTimestamp } from './commands/uptime';
import { checkEventReminders } from './commands/events';
import { debugLog, rotateDebugLogs } from './utils/debug';
import { config } from './utils/config';

// Rotate logs on startup if they're too large
rotateDebugLogs(10);

// Track client state
let isClientReady = false;
let keepAliveInterval: NodeJS.Timeout | null = null;
let eventReminderInterval: NodeJS.Timeout | null = null;

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
      '--disable-gpu',
      '--no-zygote',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
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
  isClientReady = false;
});

client.on('ready', async () => {
  debugLog('Bot is ready and connected to WhatsApp!');
  isClientReady = true;

  const lastActivation = new Date().toLocaleString();

  // Set the bot's status message
  await client.setStatus('Last activation: ' + lastActivation);

  // Set bot as ONLINE
  // await client.sendPresenceAvailable(); // Temporarily disabled due to issues with WhatsApp

  // Save ready timestamp for uptime tracking
  saveReadyTimestamp();

  // Get client info
  const clientInfo = client.info;
  if (clientInfo) {
    debugLog(`Connected as: ${clientInfo.pushname} (${clientInfo.wid.user})`);
  }

  // Clear any existing intervals
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
  if (eventReminderInterval) {
    clearInterval(eventReminderInterval);
  }

  // Set up event reminder checking (every 30 seconds)
  eventReminderInterval = setInterval(() => {
    if (isClientReady) {
      checkEventReminders(client);
    }
  }, 30 * 1000); // Check every 30 seconds
  debugLog('Event reminder checker started (30 second intervals)');

  // Only set up keep-alive if enabled in configuration
  if (config.keepAlive.enabled) {
    debugLog('Keep-alive is enabled, setting up interval...');

    // Keep-alive function with proper error handling
    const imAlive = async (msg = '🤖 Bot is still alive!') => {
      // Check if client is ready before attempting to send
      if (!isClientReady) {
        debugLog('Client not ready, skipping keep-alive message');
        return;
      }

      const state = await client.getState();
      if (state !== 'CONNECTED') {
        debugLog(`Client state is ${state}, skipping keep-alive message`);
        return;
      }

      await client.sendMessage(config.keepAlive.chatId, msg);
      debugLog('Sent keep-alive message to:', config.keepAlive.chatId);
    };

    // Send initial keep-alive message
    await imAlive('🤖 Bot initiated!');

    // Set up keep-alive interval
    keepAliveInterval = setInterval(
      async () => {
        await imAlive();
      },
      config.keepAlive.intervalMinutes * 60 * 1000,
    );

    debugLog(
      `Keep-alive messages set every ${config.keepAlive.intervalMinutes} minutes`,
    );
  } else {
    debugLog('Keep-alive is disabled in configuration');
  }

  debugLog('Bot is online and ready to receive messages!');
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
  isClientReady = false;

  // Clear intervals when disconnected
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
  if (eventReminderInterval) {
    clearInterval(eventReminderInterval);
    eventReminderInterval = null;
  }

  // If logged out, exit the process
  if (reason === 'LOGOUT') {
    debugLog('Bot was logged out. Exiting process.');
    process.exit(1);
  }
});

// Handle process termination gracefully
process.on('SIGINT', async () => {
  debugLog('Received SIGINT. Shutting down gracefully...');
  isClientReady = false;

  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
  if (eventReminderInterval) {
    clearInterval(eventReminderInterval);
  }

  await client.destroy();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  debugLog('Received SIGTERM. Shutting down gracefully...');
  isClientReady = false;

  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
  if (eventReminderInterval) {
    clearInterval(eventReminderInterval);
  }

  await client.destroy();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  debugLog('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  debugLog('Uncaught Exception:', error);
  isClientReady = false;
  process.exit(1);
});

debugLog('Initializing WhatsApp bot...');
client.initialize();
