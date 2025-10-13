import { Message } from 'whatsapp-web.js';
import { debugLog } from '../utils/debug';

export async function handlePingCommand(message: Message) {
  await message.reply('pong');
}
