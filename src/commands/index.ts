import { Message } from 'whatsapp-web.js';

import { handlePingCommand } from './ping';
import { handleInfoCommand } from './info';
import {
  handleExpensesCommand,
  activeExpensesTracking,
  handleExpensesMessage,
  handleExpensesTotalCommand,
  handleExpensesResetCommand
} from './expenses';

export async function handleCommand(message: Message) {
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
}
