import { Message } from 'whatsapp-web.js';

import { handlePingCommand } from './ping';
import { handleInfoCommand } from './info';
import {
  handleExpensesCommand,
  activeExpensesTracking,
  handleExpensesMessage,
  handleExpensesTotalCommand,
  handleExpensesResetCommand,
} from './expenses';
import { debugLog } from '../utils/debug';

export async function handleCommand(message: Message) {
  try {
    switch (message.body) {
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
