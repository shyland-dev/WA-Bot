import { Message } from 'whatsapp-web.js';
import { debugLog } from '../utils/debug';
import * as fs from 'fs';
import * as path from 'path';

interface ExpenseItem {
  amount: number;
  description: string;
  timestamp: Date;
}

interface ChatExpenses {
  items: ExpenseItem[];
  total: number;
}

// File paths for persistence - use process.cwd() instead of __dirname
const DATA_DIR = path.join(process.cwd(), 'data');
const ACTIVE_TRACKING_FILE = path.join(DATA_DIR, 'active-tracking.json');
const EXPENSES_DATA_FILE = path.join(DATA_DIR, 'expenses-data.json');

export const activeExpensesTracking = new Set<string>();
const expensesData = new Map<string, ChatExpenses>();

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Load active tracking from JSON
function loadActiveTracking() {
  if (fs.existsSync(ACTIVE_TRACKING_FILE)) {
    const data = fs.readFileSync(ACTIVE_TRACKING_FILE, 'utf8');
    const activeChats: string[] = JSON.parse(data);
    activeChats.forEach((chatId) => activeExpensesTracking.add(chatId));
    debugLog('Loaded active tracking for', activeChats.length, 'chats');
  }
}

// Save active tracking to JSON
function saveActiveTracking() {
  ensureDataDir();
  const activeChats = Array.from(activeExpensesTracking);
  fs.writeFileSync(ACTIVE_TRACKING_FILE, JSON.stringify(activeChats, null, 2));
  debugLog('Saved active tracking for', activeChats.length, 'chats');
}

// Load expenses data from JSON
function loadExpensesData() {
  if (fs.existsSync(EXPENSES_DATA_FILE)) {
    const data = fs.readFileSync(EXPENSES_DATA_FILE, 'utf8');
    const expensesObj: Record<string, ChatExpenses> = JSON.parse(data);

    // Convert timestamp strings back to Date objects
    Object.entries(expensesObj).forEach(([chatId, expenses]) => {
      expenses.items = expenses.items.map((item) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));
      expensesData.set(chatId, expenses);
    });

    debugLog(
      'Loaded expenses data for',
      Object.keys(expensesObj).length,
      'chats',
    );
  }
}

// Save expenses data to JSON
function saveExpensesData() {
  ensureDataDir();
  const expensesObj: Record<string, ChatExpenses> = {};
  expensesData.forEach((expenses, chatId) => {
    expensesObj[chatId] = expenses;
  });
  fs.writeFileSync(EXPENSES_DATA_FILE, JSON.stringify(expensesObj, null, 2));
  debugLog('Saved expenses data for', Object.keys(expensesObj).length, 'chats');
}

// Initialize data on module load
loadActiveTracking();
loadExpensesData();

export async function handleExpensesCommand(message: Message) {
  const chatId = message.from;

  if (activeExpensesTracking.has(chatId)) {
    // Stop tracking
    activeExpensesTracking.delete(chatId);
    saveActiveTracking();
    await message.reply('Stopped tracking expenses');
    debugLog('Stopped tracking expenses for chat:', chatId);
  } else {
    // Start tracking
    activeExpensesTracking.add(chatId);
    if (!expensesData.has(chatId)) {
      expensesData.set(chatId, { items: [], total: 0 });
    }
    saveActiveTracking();
    saveExpensesData();
    await message.reply('Now tracking the expenses in this chat/group');
    debugLog('Started tracking expenses for chat:', chatId);
  }
}

export async function handleExpensesTotalCommand(message: Message) {
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
}

export async function handleExpensesResetCommand(message: Message) {
  const chatId = message.from;

  expensesData.set(chatId, { items: [], total: 0 });
  saveExpensesData();
  await message.reply('The expenses list are now reseted Total = 0');
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

  // Save to persistent storage
  saveExpensesData();

  message.reply(`Copied! Total = ${expenses.total}`);
  debugLog(
    'Added expense for chat:',
    chatId,
    'Amount:',
    amount,
    'Description:',
    description,
  );
}
