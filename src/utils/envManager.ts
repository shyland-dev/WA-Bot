import * as fs from 'fs';
import * as path from 'path';
import { debugLog } from './debug';

const ENV_FILE = path.join(process.cwd(), '.env');

interface EnvConfig {
  [key: string]: string;
}

// Parse .env file into key-value pairs
function parseEnvFile(content: string): EnvConfig {
  const config: EnvConfig = {};
  const lines = content.split('\n');

  lines.forEach((line) => {
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) {
      return;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex !== -1) {
      const key = line.substring(0, separatorIndex).trim();
      const value = line.substring(separatorIndex + 1).trim();
      config[key] = value;
    }
  });

  return config;
}

// Convert config object back to .env format
function stringifyEnvConfig(config: EnvConfig): string {
  return Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
}

// Read current .env file
export function readEnvFile(): EnvConfig {
  try {
    if (!fs.existsSync(ENV_FILE)) {
      debugLog('Warning: .env file not found');
      return {};
    }

    const content = fs.readFileSync(ENV_FILE, 'utf8');
    return parseEnvFile(content);
  } catch (error) {
    debugLog('Error reading .env file:', error);
    return {};
  }
}

// Write updated config to .env file
export function writeEnvFile(config: EnvConfig): boolean {
  try {
    const content = stringifyEnvConfig(config);
    fs.writeFileSync(ENV_FILE, content, 'utf8');
    debugLog('Successfully updated .env file');
    return true;
  } catch (error) {
    debugLog('Error writing .env file:', error);
    return false;
  }
}

// Update a specific environment variable
export function updateEnvVariable(key: string, value: string): boolean {
  try {
    const config = readEnvFile();
    config[key] = value;

    if (writeEnvFile(config)) {
      // Update process.env
      process.env[key] = value;
      debugLog(`Updated ${key} to ${value}`);
      return true;
    }

    return false;
  } catch (error) {
    debugLog('Error updating environment variable:', error);
    return false;
  }
}

// Toggle boolean environment variable
export function toggleEnvBoolean(key: string): boolean | null {
  try {
    const config = readEnvFile();
    const currentValue = config[key]?.toLowerCase();

    let newValue: string;
    if (currentValue === 'true') {
      newValue = 'false';
    } else if (currentValue === 'false') {
      newValue = 'true';
    } else {
      debugLog(`Variable ${key} is not a boolean or doesn't exist`);
      return null;
    }

    config[key] = newValue;

    if (writeEnvFile(config)) {
      // Update process.env
      process.env[key] = newValue;
      debugLog(`Toggled ${key} to ${newValue}`);
      return newValue === 'true';
    }

    return null;
  } catch (error) {
    debugLog('Error toggling environment variable:', error);
    return null;
  }
}

// Get current value of environment variable
export function getEnvVariable(key: string): string | undefined {
  const config = readEnvFile();
  return config[key];
}
