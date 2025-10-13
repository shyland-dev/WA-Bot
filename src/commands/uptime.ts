import { Message } from 'whatsapp-web.js';
import { debugLog } from '../utils/debug';
import * as fs from 'fs';
import * as path from 'path';

interface UptimeData {
  readyTimestamp: string;
}

// File path for uptime persistence
const DATA_DIR = path.join(process.cwd(), 'data');
const UPTIME_FILE = path.join(DATA_DIR, 'uptime.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Save ready timestamp to JSON
export function saveReadyTimestamp() {
  ensureDataDir();
  const uptimeData: UptimeData = {
    readyTimestamp: new Date().toISOString()
  };
  fs.writeFileSync(UPTIME_FILE, JSON.stringify(uptimeData, null, 2));
  debugLog('Saved ready timestamp:', uptimeData.readyTimestamp);
}

// Load ready timestamp from JSON
function loadReadyTimestamp(): Date | null {
  if (fs.existsSync(UPTIME_FILE)) {
    const data = fs.readFileSync(UPTIME_FILE, 'utf8');
    const uptimeData: UptimeData = JSON.parse(data);
    return new Date(uptimeData.readyTimestamp);
  }
  return null;
}

// Format uptime duration
function formatUptime(startTime: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - startTime.getTime();
  
  // Convert milliseconds to various units
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30.44); // Average days per month
  const years = Math.floor(months / 12);
  
  // Calculate remainders
  const remainingMonths = months % 12;
  const remainingDays = Math.floor((days % 30.44));
  const remainingHours = hours % 24;
  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;
  
  // Build the uptime string
  const parts: string[] = [];
  
  if (years > 0) parts.push(`${years}year${years > 1 ? 's' : ''}`);
  if (remainingMonths > 0) parts.push(`${remainingMonths}month${remainingMonths > 1 ? 's' : ''}`);
  if (remainingDays > 0) parts.push(`${remainingDays}day${remainingDays > 1 ? 's' : ''}`);
  if (remainingHours > 0) parts.push(`${remainingHours}hour${remainingHours > 1 ? 's' : ''}`);
  if (remainingMinutes > 0) parts.push(`${remainingMinutes}minute${remainingMinutes > 1 ? 's' : ''}`);
  if (remainingSeconds > 0) parts.push(`${remainingSeconds}second${remainingSeconds > 1 ? 's' : ''}`);
  
  // Return formatted string or fallback
  return parts.length > 0 ? parts.join(' ') : '0seconds';
}

export async function handleUptimeCommand(message: Message) {
  const readyTimestamp = loadReadyTimestamp();
  
  if (!readyTimestamp) {
    await message.reply('No uptime data available. The bot may need to restart to track uptime.');
    return;
  }
  
  const uptimeString = formatUptime(readyTimestamp);
  await message.reply(`Bot uptime: ${uptimeString}`);
  debugLog('Sent uptime response:', uptimeString);
}
