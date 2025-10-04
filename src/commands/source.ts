import { Message } from 'whatsapp-web.js';
import { debugLog } from '../utils/debug';

export async function handleSourceCommand(message: Message) {
  try {
    await message.reply('https://github.com/shyland-dev/WA-Bot');
  } catch (error) {
    debugLog('Error in source command:', error);
  }
}
