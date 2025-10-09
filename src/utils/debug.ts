import * as fs from 'fs';
import * as path from 'path';

const TITLE = 'WA-Bot';
const LOGS_DIR = path.join(process.cwd(), 'logs');
const DEBUG_LOG_FILE = path.join(LOGS_DIR, 'debug.log');

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
function writeToFile(message: string) {
  try {
    ensureLogsDir();
    const timestamp = getTimestamp();
    const logEntry = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(DEBUG_LOG_FILE, logEntry, 'utf8');
  } catch (error) {
    // If file writing fails, at least try console.error
    console.error('Failed to write to debug log file:', error);
  }
}

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

    // Write to console
    console.log(fullMessage);
    
    // Write to file
    writeToFile(fullMessage);
    
  } catch (error) {
    // Fallback logging if main logic fails
    try {
      const fallbackMessage = `[${TITLE}] Debug log error: ${error}`;
      console.error(fallbackMessage);
      writeToFile(fallbackMessage);
    } catch {
      // Silent fail if even fallback fails
    }
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
        
        debugLog(`Debug log rotated. Backup created: ${backupFile}`);
        
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
