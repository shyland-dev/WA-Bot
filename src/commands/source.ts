import { Message } from 'whatsapp-web.js';
import { debugLog } from '../utils/debug';

export async function handleSourceCommand(message: Message) {
  await message.reply('https://github.com/shyland-dev/WA-Bot');
}
