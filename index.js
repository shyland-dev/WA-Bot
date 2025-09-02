const TITLE = "WA-Bot";
debugLog('init');

function debugLog(message, ...args) {
  console.log(`[${TITLE}] ${message}`, ...args);
}

const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
  authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
  debugLog('qr', qr);
  qrcode.generate(qr, { small: true });
});

client.on('loading_screen', (percent, message) => {
  debugLog('loading_screen', percent, message);
});

client.on('authenticated', (session) => {
  debugLog('authenticated', session);
});

client.on('auth_failure', (message) => {
  debugLog('auth_failure', message);
});

client.on('ready', () => {
  debugLog('ready');
});

client.on('message', message => {
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

function startTrackingChat(chatId) {
  debugLog('startTrackingChat', chatId);
  // Implement tracking logic here
}

client.initialize();
