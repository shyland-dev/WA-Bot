const TITLE = "WA-Bot";
debugLog('init');

function debugLog(message, ...args) {
  console.log(`[${TITLE}] ${message}`, ...args);
}

const { Client, LocalAuth} = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
  authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  debugLog('ready');
});

client.on('message', msg => {
  debugLog('message', msg);

  if (msg.body == '/ping') {
    msg.reply('pong');
  }

  if (msg.body == '/track') {
    msg.reply('Now tracking this chat');

    // startTrackingChat();
  }
});

function startTrackingChat(chatId) {
  debugLog('startTrackingChat', chatId);
  // Implement tracking logic here
}

client.initialize();
