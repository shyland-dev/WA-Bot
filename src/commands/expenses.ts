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
  const chatId = message.from;

  if (activeExpensesTracking.has(chatId)) {
    // Stop tracking
    activeExpensesTracking.delete(chatId);
    message.reply('Stopped tracking expenses');
    debugLog('Stopped tracking expenses for chat:', chatId);
  } else {
    // Start tracking
    activeExpensesTracking.add(chatId);
    if (!expensesData.has(chatId)) {
      expensesData.set(chatId, { items: [], total: 0 });
    }
    message.reply('Now tracking the expenses in this chat/group');
    debugLog('Started tracking expenses for chat:', chatId);
  }
}

export async function handleExpensesTotalCommand(message: Message) {
  const chatId = message.from;
  const expenses = expensesData.get(chatId);

  if (!expenses || expenses.items.length === 0) {
    message.reply('No expenses recorded yet');
    return;
  }

  let response = `You spent a total of ${expenses.total}\n\n`;
  expenses.items.forEach(item => {
    response += `${item.amount} ${item.description}\n`;
  });

  message.reply(response.trim());
  debugLog('Sent expenses total for chat:', chatId);
}

export async function handleExpensesResetCommand(message: Message) {
  const chatId = message.from;

  expensesData.set(chatId, { items: [], total: 0 });
  message.reply('The expenses list are now reseted Total = 0');
  debugLog('Reset expenses for chat:', chatId);
}

export function handleExpensesMessage(message: Message) {
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

  let expenses = expensesData.get(chatId);
  if (!expenses) {
    expenses = { items: [], total: 0 };
    expensesData.set(chatId, expenses);
  }

  // Add new expense
  expenses.items.push({
    amount,
    description,
    timestamp: new Date()
  });
  expenses.total += amount;

  message.reply(`Copied! Total = ${expenses.total}`);
  debugLog('Added expense for chat:', chatId, 'Amount:', amount, 'Description:', description);
}
