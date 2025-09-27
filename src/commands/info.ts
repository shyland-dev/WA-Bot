import { Message } from 'whatsapp-web.js';
import { debugLog } from '../utils/debug';

export async function handleInfoCommand(message: Message) {
  try {
    const chat = await message.getChat();
    await message.reply(
      'Chat info:\n```\n' + JSON.stringify(chat, null, 2) + '\n```',
    );
  } catch (error) {
    debugLog('Error in info command:', error);
    try {
      await message.reply("Sorry, I couldn't get the chat information.");
    } catch (replyError) {
      debugLog('Error sending error reply in info command:', replyError);
    }
  }
}
