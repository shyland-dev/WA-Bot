import * as fs from 'fs';
import * as path from 'path';

const TITLE = 'WA-Bot';
const LOGS_DIR = path.join(process.cwd(), 'logs');
const DEBUG_LOG_FILE = path.join(LOGS_DIR, 'debug.log');

// Store original console methods
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug
};

// Ensure logs directory exists
function ensureLogsDir() {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

// Format timestamp for logs
function getTimestamp(): string {
  return new Date().toISOString();
}

// Write to log file
function writeToFile(message: string, level: string = 'INFO') {
  try {
    ensureLogsDir();
    const timestamp = getTimestamp();
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;
    fs.appendFileSync(DEBUG_LOG_FILE, logEntry, 'utf8');
  } catch (error) {
    // If file writing fails, use original console.error
    originalConsole.error('Failed to write to debug log file:', error);
  }
}

// Override console methods to capture all output
function overrideConsole() {
  console.log = (...args: any[]) => {
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    writeToFile(message, 'LOG');
    originalConsole.log(...args);
  };

  console.error = (...args: any[]) => {
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    writeToFile(message, 'ERROR');
    originalConsole.error(...args);
  };

  console.warn = (...args: any[]) => {
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    writeToFile(message, 'WARN');
    originalConsole.warn(...args);
  };

  console.info = (...args: any[]) => {
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    writeToFile(message, 'INFO');
    originalConsole.info(...args);
  };

  console.debug = (...args: any[]) => {
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    writeToFile(message, 'DEBUG');
    originalConsole.debug(...args);
  };
}

// Initialize console overrides
overrideConsole();

export function debugLog(message: string, ...args: any[]) {
  try {
    let fullMessage = `[${TITLE}] ${message}`;

    // Format additional arguments
    if (args.length > 0) {
      const formattedArgs = args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      }).join(' ');
      fullMessage += ` ${formattedArgs}`;
    }

    // Write to console (which will be captured by our override)
    console.log(fullMessage);

  } catch (error) {
    // Fallback logging if main logic fails
    originalConsole.error('Debug log error:', error);
  }
}

// Optional: Add a function to clear old logs
export function clearDebugLogs() {
  try {
    if (fs.existsSync(DEBUG_LOG_FILE)) {
      fs.unlinkSync(DEBUG_LOG_FILE);
      console.log(`[${TITLE}] Debug log file cleared`);
    }
  } catch (error) {
    console.error(`[${TITLE}] Failed to clear debug log file:`, error);
  }
}

// Optional: Add a function to rotate logs (keep only recent logs)
export function rotateDebugLogs(maxSizeInMB: number = 10) {
  try {
    if (fs.existsSync(DEBUG_LOG_FILE)) {
      const stats = fs.statSync(DEBUG_LOG_FILE);
      const fileSizeInMB = stats.size / (1024 * 1024);

      if (fileSizeInMB > maxSizeInMB) {
        // Create backup and start fresh
        const backupFile = path.join(LOGS_DIR, `debug.log.backup.${Date.now()}`);
        fs.renameSync(DEBUG_LOG_FILE, backupFile);

        console.log(`[${TITLE}] Debug log rotated. Backup created: ${backupFile}`);

        // Keep only the last 3 backup files
        const backupFiles = fs.readdirSync(LOGS_DIR)
          .filter(file => file.startsWith('debug.log.backup.'))
          .sort()
          .reverse();

        if (backupFiles.length > 3) {
          backupFiles.slice(3).forEach(file => {
            fs.unlinkSync(path.join(LOGS_DIR, file));
          });
        }
      }
    }
  } catch (error) {
    console.error(`[${TITLE}] Failed to rotate debug log:`, error);
  }
}

// Export original console methods in case they're needed
export { originalConsole };
