import { Message } from 'whatsapp-web.js';

import { debugLog } from '../utils/debug';
import { handleHelpCommand } from './help';
import { handlePingCommand } from './ping';
import { handleInfoCommand } from './info';
import { handleSourceCommand } from './source';
import { handleUptimeCommand } from './uptime';
import { handleVersionCommand } from './version';
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
        debugLog('Help command invoked');
        await handleHelpCommand(message);
        break;
      case '/ping':
        debugLog('Ping command invoked');
        await handlePingCommand(message);
        break;
      case '/info':
        debugLog('Info command invoked');
        await handleInfoCommand(message);
        break;
      case '/source':
        debugLog('Source command invoked');
        await handleSourceCommand(message);
        break;
      case '/uptime':
        debugLog('Uptime command invoked');
        await handleUptimeCommand(message);
        break;
      case '/version':
        debugLog('Version command invoked');
        await handleVersionCommand(message);
        break;
      case '/expenses':
        debugLog('Expenses command invoked');
        await handleExpensesCommand(message);
        break;
      case '/expenses-total':
        debugLog('Expenses total command invoked');
        await handleExpensesTotalCommand(message);
        break;
      case '/expenses-reset':
        debugLog('Expenses reset command invoked');
        await handleExpensesResetCommand(message);
        break;
      default:
        if (activeExpensesTracking.has(message.from)) {
          debugLog('Handling expenses message for', message.from);
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
