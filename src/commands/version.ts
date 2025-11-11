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
  const packageJsonPath = path.join(process.cwd(), 'package.json');

  const packageData = fs.readFileSync(packageJsonPath, 'utf8');
  const packageJson: PackageJson = JSON.parse(packageData);

  const versionMessage = `${packageJson.name} v${packageJson.version}`;
  await message.reply(versionMessage);
  debugLog('Sent version info:', versionMessage);
}
