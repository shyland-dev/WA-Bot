import { Message } from 'whatsapp-web.js';

export async function handlePingCommand(message: Message) {
  message.reply('pong');
}
