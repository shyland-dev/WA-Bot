import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { handleCommand } from './commands';
import { debugLog } from './utils/debug';

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on('qr', (qr: string) => {
  debugLog('qr', qr);
  qrcode.generate(qr, { small: true });
});

client.on('loading_screen', (percent: number, message: string) => {
  debugLog('loading_screen', percent, message);
});

client.on('authenticated', (session: any) => {
  debugLog('authenticated', session);
});

client.on('auth_failure', (message: string) => {
  debugLog('auth_failure', message);
});

client.on('ready', () => {
  debugLog('ready');
});

client.on('message', async (message: Message) => {
  debugLog('message', message);
  await handleCommand(message);
});

client.initialize();
