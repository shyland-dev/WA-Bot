import { Message } from 'whatsapp-web.js';

import { debugLog } from '../utils/debug';
import { handleHelpCommand } from './help';
import { handlePingCommand } from './ping';
import { handleInfoCommand } from './info';
import { handleSourceCommand } from './source';
import { handleUptimeCommand } from './uptime';
import { handleVersionCommand } from './version';
import { handleQrCommand } from './qr';
import { handleApiReadAllCommand } from './apiReadAll';
import { handleApiReadCommand } from './apiRead';
import { handleApiCreateCommand } from './apiCreate';
import { handleApiUpdateCommand } from './apiUpdate';
import { handleApiDeleteCommand } from './apiDelete';
import {
  handleEventCreateCommand,
  handleEventCommand,
  handleEventConfirmCommand,
  handleEventDismissCommand,
  handleEventDeleteCommand,
} from './events';
import {
  handleExpensesCommand,
  activeExpensesTracking,
  handleExpensesMessage,
  handleExpensesTotalCommand,
  handleExpensesResetCommand,
} from './expenses';

// Helper function to handle API errors
async function handleApiError(message: Message, error: any, operation: string) {
  debugLog(`Error in ${operation}:`, error);

  let errorMessage = '❌ An error occurred while processing your request.\n\n';

  if (error.response) {
    // API responded with an error status
    const status = error.response.status;
    const data = error.response.data;

    switch (status) {
      case 400:
        errorMessage += '🔍 *Bad Request:* Invalid data provided';
        if (data && data.message) {
          errorMessage += `\n📝 Details: ${data.message}`;
        }
        break;
      case 401:
        errorMessage += '🔐 *Authentication Failed:* Invalid credentials';
        break;
      case 403:
        errorMessage += '⛔ *Access Denied:* Insufficient permissions';
        break;
      case 404:
        errorMessage += '🔍 *Not Found:* Record does not exist';
        break;
      case 422:
        errorMessage += '📝 *Validation Error:* Invalid data format';
        if (data && data.message) {
          errorMessage += `\n📝 Details: ${data.message}`;
        }
        break;
      case 500:
        errorMessage += '🔧 *Server Error:* Internal server error';
        break;
      default:
        errorMessage += `🔧 *HTTP Error ${status}:* ${error.response.statusText}`;
        if (data && data.message) {
          errorMessage += `\n📝 Details: ${data.message}`;
        }
    }
  } else if (error.request) {
    // Request was made but no response received
    errorMessage += '🌐 *Network Error:* Unable to connect to API server';
  } else if (error.code === 'ECONNABORTED') {
    // Timeout error
    errorMessage += '⏱️ *Timeout Error:* Request took too long to complete';
  } else {
    // Something else happened
    errorMessage += `⚠️ *Error:* ${error.message || 'Unknown error occurred'}`;
  }

  await message.reply(errorMessage);
}

export async function handleCommand(message: Message) {
  // Handle commands that start with specific prefixes
  if (message.body.startsWith('/qr ')) {
    debugLog('QR command invoked');
    try {
      await handleQrCommand(message);
    } catch (error) {
      debugLog('Error in QR command:', error);
      await message.reply('❌ An error occurred while generating the QR code. Please try again.');
    }
    return;
  }

  if (message.body.startsWith('/event-create ')) {
    debugLog('Event create command invoked');
    try {
      await handleEventCreateCommand(message);
    } catch (error) {
      debugLog('Error in event create command:', error);
      await message.reply('❌ An error occurred while creating the event. Please try again.');
    }
    return;
  }

  if (message.body.startsWith('/api-read ')) {
    debugLog('API read command invoked');
    try {
      await handleApiReadCommand(message);
    } catch (error) {
      await handleApiError(message, error, 'API read');
    }
    return;
  }

  if (message.body.startsWith('/api-create ')) {
    debugLog('API create command invoked');
    try {
      await handleApiCreateCommand(message);
    } catch (error) {
      await handleApiError(message, error, 'API create');
    }
    return;
  }

  if (message.body.startsWith('/api-update ')) {
    debugLog('API update command invoked');
    try {
      await handleApiUpdateCommand(message);
    } catch (error) {
      await handleApiError(message, error, 'API update');
    }
    return;
  }

  if (message.body.startsWith('/api-delete ')) {
    debugLog('API delete command invoked');
    try {
      await handleApiDeleteCommand(message);
    } catch (error) {
      await handleApiError(message, error, 'API delete');
    }
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
    case '/event':
      debugLog('Event command invoked');
      await handleEventCommand(message);
      break;
    case '/event-confirm':
      debugLog('Event confirm command invoked');
      await handleEventConfirmCommand(message);
      break;
    case '/event-dismiss':
      debugLog('Event dismiss command invoked');
      await handleEventDismissCommand(message);
      break;
    case '/event-delete':
      debugLog('Event delete command invoked');
      await handleEventDeleteCommand(message);
      break;
    case '/api-read-all':
      debugLog('API read all command invoked');
      try {
        await handleApiReadAllCommand(message);
      } catch (error) {
        await handleApiError(message, error, 'API read all');
      }
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
      try {
        await handleQrCommand(message);
      } catch (error) {
        debugLog('Error in QR command:', error);
        await message.reply('❌ An error occurred while generating the QR code. Please try again.');
      }
      break;
    default:
      if (activeExpensesTracking.has(message.from)) {
        debugLog('Handling expenses message for', message.from);
        handleExpensesMessage(message);
      }
      break;
  }
}
