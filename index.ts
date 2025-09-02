import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

const TITLE = "WA-Bot";
debugLog('init');

function debugLog(message: string, ...args: any[]) {
  console.log(`[${TITLE}] ${message}`, ...args);
}

const client = new Client({
  authStrategy: new LocalAuth()
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

client.on('message', (message: Message) => {
  debugLog('message', message);

  const chat = message.getChat();
  debugLog('chat', chat);

  if (message.body == '/ping') {
    message.reply('pong');
  }

  if (message.body == '/track') {
    message.reply('Now tracking this chat');

    // startTrackingChat();
  }
});

function startTrackingChat(chatId: any) {
  debugLog('startTrackingChat', chatId);
  // Implement tracking logic here
}

client.initialize();
