import { Message } from 'whatsapp-web.js';

export async function handleInfoCommand(message: Message) {
  const chat = await message.getChat();
  message.reply('Chat info:\n```\n' + JSON.stringify(chat, null, 2) + '\n```');
}
