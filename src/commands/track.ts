import { Message } from 'whatsapp-web.js';
import { debugLog } from '../utils/debug';

export async function handleTrackCommand(message: Message) {
  const chat = await message.getChat();
  message.reply('Now tracking this chat');
  startTrackingChat(chat.id._serialized);
}

function startTrackingChat(chatId: any) {
  debugLog('startTrackingChat', chatId);
}
