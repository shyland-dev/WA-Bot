import { Message } from 'whatsapp-web.js';
import { debugLog } from '../utils/debug';
import * as fs from 'fs';
import * as path from 'path';

interface PackageJson {
  name: string;
  version: string;
  description?: string;
}

export async function handleVersionCommand(message: Message) {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      await message.reply('Error: package.json not found');
      debugLog('package.json not found at:', packageJsonPath);
      return;
    }

    const packageData = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson: PackageJson = JSON.parse(packageData);
    
    const versionMessage = `${packageJson.name} v${packageJson.version}`;
    await message.reply(versionMessage);
    debugLog('Sent version info:', versionMessage);
    
  } catch (error) {
    debugLog('Error in version command:', error);
    try {
      await message.reply('Sorry, there was an error getting the version information.');
    } catch (replyError) {
      debugLog('Error sending error reply in version command:', replyError);
    }
  }
}
