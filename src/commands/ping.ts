import { Message } from 'whatsapp-web.js';
import { debugLog } from '../utils/debug';

export async function handlePingCommand(message: Message) {
  try {
    await message.reply('pong');
  } catch (error) {
    debugLog('Error in ping command:', error);
  }
}
