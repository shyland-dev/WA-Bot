import { Message } from 'whatsapp-web.js';
import { debugLog } from '../utils/debug';
import { apiService } from '../utils/apiService';

export async function handleApiUpdateCommand(message: Message) {
  const params = message.body.substring(12).trim();

  if (!params) {
    await message.reply(
      'Please provide data to update. Usage: /api-update <ID> | <phrase> | <number> | <date>\nExample: /api-update 2 | Hello Updated | 99 | 2024-01-15 10:30:00',
    );
    return;
  }

  const parts = params.split('|').map((part) => part.trim());

  if (parts.length !== 4) {
    await message.reply(
      'Invalid format. Usage: /api-update <ID> | <phrase> | <number> | <date>\nExample: /api-update 2 | Hello Updated | 99 | 2024-01-15 10:30:00',
    );
    return;
  }

  const [id, phrase, numberStr, date] = parts;
  const number = parseInt(numberStr, 10);

  if (isNaN(number)) {
    await message.reply(
      'Invalid number format. Please provide a valid number.',
    );
    return;
  }

  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(date)) {
    await message.reply(
      'Invalid date format. Please use: YYYY-MM-DD HH:MM:SS\nExample: 2024-01-15 10:30:00',
    );
    return;
  }

  await message.reply(`🔄 Updating record ID: ${id}...`);

  const updateData = {
    phrase,
    number,
    date,
  };

  const response = await apiService.updateTestData(id, updateData);

  let responseText = `✅ ${response.message}\n\n`;
  responseText += '📋 *Updated Record:*\n\n';
  responseText += `*ID:* ${id}\n`;
  responseText += `*Phrase:* ${phrase}\n`;
  responseText += `*Number:* ${number}\n`;
  responseText += `*Date:* ${date}\n`;

  await message.reply(responseText);

  debugLog('API update command completed successfully for ID:', id);
}
