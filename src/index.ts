import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { handleCommand } from './commands/_index';
import { debugLog } from './utils/debug';

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on('qr', (qr: string) => {
  try {
    debugLog('qr', qr);
    qrcode.generate(qr, { small: true });
  } catch (error) {
    debugLog('Error generating QR code:', error);
  }
});

client.on('loading_screen', (percent: number, message: string) => {
  try {
    debugLog('loading_screen', percent, message);
  } catch (error) {
    debugLog('Error in loading screen:', error);
  }
});

client.on('authenticated', (session: any) => {
  try {
    debugLog('authenticated', session);
  } catch (error) {
    debugLog('Error in authenticated event:', error);
  }
});

client.on('auth_failure', (message: string) => {
  try {
    debugLog('auth_failure', message);
  } catch (error) {
    debugLog('Error in auth failure event:', error);
  }
});

client.on('ready', () => {
  try {
    debugLog('ready');

    const lastActivation = new Date().toLocaleString();
    // Set the bot's status message
    client.setStatus('Last activation: ' + lastActivation)
    .then(() => {
      debugLog('Status set successfully: ' + lastActivation);
    })
    .catch((error) => {
      debugLog('Error setting status:', error);
    });

    // Set bot as ONLINE
    client.sendPresenceAvailable()
    .then(() => {
      debugLog('Presence set to available');
    })
    .catch((error) => {
      debugLog('Error setting presence:', error);
    });
  } catch (error) {
    debugLog('Error in ready event:', error);
  }
});

client.on('message', async (message: Message) => {
  try {
    debugLog('message', message);
    await handleCommand(message);
  } catch (error) {
    debugLog('Error handling message:', error);
  }
});

client.on('disconnected', (reason: string) => {
  try {
    debugLog('Client was disconnected:', reason);
  } catch (error) {
    debugLog('Error in disconnected event:', error);
  }
});

try {
  client.initialize();
} catch (error) {
  debugLog('Error initializing client:', error);
}
