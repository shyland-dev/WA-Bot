import * as dotenv from 'dotenv';
import { debugLog } from './debug';

// Load environment variables from .env file
dotenv.config();

export interface AppConfig {
  keepAlive: {
    enabled: boolean;
    chatId: string;
    intervalMinutes: number;
  };
  webservice: {
    url: string;
    user: string;
    password: string;
  };
}

function parseBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

function parseNumber(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

export const config: AppConfig = {
  keepAlive: {
    enabled: parseBoolean(process.env.KEEP_ALIVE, false),
    chatId: process.env.KEEP_ALIVE_CHAT_ID || '120363403106512185@g.us',
    intervalMinutes: parseNumber(process.env.KEEP_ALIVE_INTERVAL_MINUTES, 30),
  },
  webservice: {
    url: process.env.WEBSERVICE_URL || 'https://api.example.com',
    user: process.env.WEBSERVICE_USER || 'user',
    password: process.env.WEBSERVICE_PASSWORD || 'password',
  },
};

debugLog('Configuration loaded:', {
  keepAlive: {
    enabled: config.keepAlive.enabled,
    chatId: config.keepAlive.chatId,
    intervalMinutes: config.keepAlive.intervalMinutes,
  },
  webservice: {
    url: config.webservice.url,
    user: config.webservice.user,
    password: config.webservice.password
  },
});
