import { Message } from 'whatsapp-web.js';
import { debugLog } from '../utils/debug';

interface ExpenseItem {
  amount: number;
  description: string;
  timestamp: Date;
}

interface ChatExpenses {
  items: ExpenseItem[];
  total: number;
}

export const activeExpensesTracking = new Set<string>();
const expensesData = new Map<string, ChatExpenses>();

export async function handleExpensesCommand(message: Message) {
  try {
    const chatId = message.from;

    if (activeExpensesTracking.has(chatId)) {
      // Stop tracking
      activeExpensesTracking.delete(chatId);
      await message.reply('Stopped tracking expenses');
      debugLog('Stopped tracking expenses for chat:', chatId);
    } else {
      // Start tracking
      activeExpensesTracking.add(chatId);
      if (!expensesData.has(chatId)) {
        expensesData.set(chatId, { items: [], total: 0 });
      }
      await message.reply('Now tracking the expenses in this chat/group');
      debugLog('Started tracking expenses for chat:', chatId);
    }
  } catch (error) {
    debugLog('Error in expenses command:', error);
    try {
      await message.reply(
        'Sorry, there was an error with the expenses command.',
      );
    } catch (replyError) {
      debugLog('Error sending error reply in expenses command:', replyError);
    }
  }
}

export async function handleExpensesTotalCommand(message: Message) {
  try {
    const chatId = message.from;
    const expenses = expensesData.get(chatId);

    if (!expenses || expenses.items.length === 0) {
      await message.reply('No expenses recorded yet');
      return;
    }

    let response = `You spent a total of ${expenses.total}\n\n`;
    expenses.items.forEach((item) => {
      response += `${item.amount} ${item.description}\n`;
    });

    await message.reply(response.trim());
    debugLog('Sent expenses total for chat:', chatId);
  } catch (error) {
    debugLog('Error in expenses total command:', error);
    try {
      await message.reply(
        'Sorry, there was an error getting your expenses total.',
      );
    } catch (replyError) {
      debugLog(
        'Error sending error reply in expenses total command:',
        replyError,
      );
    }
  }
}

export async function handleExpensesResetCommand(message: Message) {
  try {
    const chatId = message.from;

    expensesData.set(chatId, { items: [], total: 0 });
    await message.reply('The expenses list are now reseted Total = 0');
    debugLog('Reset expenses for chat:', chatId);
  } catch (error) {
    debugLog('Error in expenses reset command:', error);
    try {
      await message.reply('Sorry, there was an error resetting your expenses.');
    } catch (replyError) {
      debugLog(
        'Error sending error reply in expenses reset command:',
        replyError,
      );
    }
  }
}

export function handleExpensesMessage(message: Message) {
  try {
    const chatId = message.from;
    const text = message.body.trim();

    // Parse expense message (format: "amount description")
    const match = text.match(/^(\d+(?:\.\d{2})?)\s+(.+)$/);

    if (!match) {
      // Invalid format, ignore silently or send help message
      return;
    }

    const amount = parseFloat(match[1]);
    const description = match[2];

    if (isNaN(amount) || amount <= 0) {
      debugLog('Invalid amount in expense message:', amount);
      return;
    }

    let expenses = expensesData.get(chatId);
    if (!expenses) {
      expenses = { items: [], total: 0 };
      expensesData.set(chatId, expenses);
    }

    // Add new expense
    expenses.items.push({
      amount,
      description,
      timestamp: new Date(),
    });
    expenses.total += amount;

    message.reply(`Copied! Total = ${expenses.total}`).catch((error) => {
      debugLog('Error sending expense confirmation reply:', error);
    });
    debugLog(
      'Added expense for chat:',
      chatId,
      'Amount:',
      amount,
      'Description:',
      description,
    );
  } catch (error) {
    debugLog('Error handling expense message:', error);
  }
}
