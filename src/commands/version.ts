import { Message, Client } from 'whatsapp-web.js';
import { debugLog } from '../utils/debug';
import * as fs from 'fs';
import * as path from 'path';

interface PackageJson {
  name: string;
  version: string;
  description?: string;
}

export async function handleVersionCommand(message: Message, client: Client) {
  const packageJsonPath = path.join(process.cwd(), 'package.json');

  const packageData = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJson: PackageJson = JSON.parse(packageData);

  let wwebVersion = 'Unknown';

  try {
    wwebVersion = await client.getWWebVersion();
  } catch (error) {
    debugLog('Error getting WhatsApp Web version:', error);
  }

  const versionMessage =
    `📱 *Bot Version Information*\n\n` +
    `*Bot:* ${packageJson.name} v${packageJson.version}\n` +
    `*WhatsApp Web:* ${wwebVersion}`;

  await message.reply(versionMessage);
  debugLog(
    'Sent version info - Bot:',
    packageJson.version,
    'WWeb:',
    wwebVersion,
  );
}
