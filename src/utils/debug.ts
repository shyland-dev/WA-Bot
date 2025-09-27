const TITLE = 'WA-Bot';

export function debugLog(message: string, ...args: any[]) {
  try {
    console.log(`[${TITLE}] ${message}`, ...args);
  } catch (error) {
    // Fallback logging if console.log fails
    try {
      console.error('Debug log error:', error);
    } catch {
      // Silent fail if even console.error fails
    }
  }
}
