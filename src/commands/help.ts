import { Message } from 'whatsapp-web.js';
import { debugLog } from '../utils/debug';

const HELP_MESSAGE = `Here are the available commands:
\`/ping\` - Check if the bot is responsive
\`/info\` - Get information about the bot and current chat
\`/expenses\` - Start or stop tracking expenses in this chat/group
\`/expenses-total\` - Get the total expenses tracked in this chat/group
\`/expenses-reset\` - Reset all tracked expenses in this chat/group
`;

export async function handleHelpCommand(message: Message) {
  try {
    await message.reply(HELP_MESSAGE);
  } catch (error) {
    debugLog('Error in help command:', error);
  }
}
