import { Message } from 'whatsapp-web.js';

import { debugLog } from '../utils/debug';
import { handleHelpCommand } from './help';
import { handlePingCommand } from './ping';
import { handleInfoCommand } from './info';
import {
  handleExpensesCommand,
  activeExpensesTracking,
  handleExpensesMessage,
  handleExpensesTotalCommand,
  handleExpensesResetCommand,
} from './expenses';

export async function handleCommand(message: Message) {
  try {
    switch (message.body) {
      case '/help':
        await handleHelpCommand(message);
        break;
      case '/ping':
        await handlePingCommand(message);
        break;
      case '/info':
        await handleInfoCommand(message);
        break;
      case '/expenses':
        await handleExpensesCommand(message);
        break;
      case '/expenses-total':
        await handleExpensesTotalCommand(message);
        break;
      case '/expenses-reset':
        await handleExpensesResetCommand(message);
        break;
      default:
        if (activeExpensesTracking.has(message.from)) {
          handleExpensesMessage(message);
        }
        break;
    }
  } catch (error) {
    debugLog('Error handling command:', error);
    try {
      await message.reply(
        'Sorry, an error occurred while processing your command.',
      );
    } catch (replyError) {
      debugLog('Error sending error reply:', replyError);
    }
  }
}
