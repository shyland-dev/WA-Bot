const TITLE = 'WA-Bot';

export function debugLog(message: string, ...args: any[]) {
  console.log(`[${TITLE}] ${message}`, ...args);
}