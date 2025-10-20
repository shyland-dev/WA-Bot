import { Message } from 'whatsapp-web.js';

import { debugLog } from '../utils/debug';
import { handleHelpCommand } from './help';
import { handlePingCommand } from './ping';
import { handleInfoCommand } from './info';
import { handleSourceCommand } from './source';
import { handleUptimeCommand } from './uptime';
import { handleVersionCommand } from './version';
import { handleQrCommand } from './qr';
import { handleApiTestCommand } from './apiTest';
import {
  handleExpensesCommand,
  activeExpensesTracking,
  handleExpensesMessage,
  handleExpensesTotalCommand,
  handleExpensesResetCommand,
} from './expenses';

export async function handleCommand(message: Message) {
  // Handle commands that start with specific prefixes
  if (message.body.startsWith('/qr ')) {
    debugLog('QR command invoked');
    await handleQrCommand(message);
    return;
  }

  // Handle exact match commands
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
    case '/api-test':
      debugLog('API test command invoked');
      await handleApiTestCommand(message);
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
    case '/qr':
      debugLog('QR command invoked without text');
      await handleQrCommand(message);
      break;
    default:
      if (activeExpensesTracking.has(message.from)) {
        debugLog('Handling expenses message for', message.from);
        handleExpensesMessage(message);
      }
      break;
  }
}
