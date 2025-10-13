import { Message } from 'whatsapp-web.js';
import { debugLog } from '../utils/debug';

export async function handleInfoCommand(message: Message) {
  const chat = await message.getChat();
  await message.reply(
    'Chat info:\n```\n' + JSON.stringify(chat, null, 2) + '\n```',
  );
}
