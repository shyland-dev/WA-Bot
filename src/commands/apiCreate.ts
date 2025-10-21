import { Message } from 'whatsapp-web.js';
import { debugLog } from '../utils/debug';
import { apiService } from '../utils/apiService';

export async function handleApiCreateCommand(message: Message) {
  const params = message.body.substring(12).trim();
  
  if (!params) {
    await message.reply('Please provide data to create. Usage: /api-create <phrase> | <number> | <date>\nExample: /api-create Hello World | 42 | 2024-01-15 10:30:00');
    return;
  }

  const parts = params.split('|').map(part => part.trim());
  
  if (parts.length !== 3) {
    await message.reply('Invalid format. Usage: /api-create <phrase> | <number> | <date>\nExample: /api-create Hello World | 42 | 2024-01-15 10:30:00');
    return;
  }

  const [phrase, numberStr, date] = parts;
  const number = parseInt(numberStr, 10);

  if (isNaN(number)) {
    await message.reply('Invalid number format. Please provide a valid number.');
    return;
  }

  if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(date)) {
    await message.reply('Invalid date format. Please use: YYYY-MM-DD HH:MM:SS\nExample: 2024-01-15 10:30:00');
    return;
  }

  await message.reply('🔄 Creating new record...');
  
  const createData = {
    phrase,
    number,
    date
  };

  const response = await apiService.createTestData(createData);
  
  let responseText = `✅ ${response.message}\n\n`;
  responseText += '📋 *Created Record:*\n\n';
  responseText += `*Phrase:* ${phrase}\n`;
  responseText += `*Number:* ${number}\n`;
  responseText += `*Date:* ${date}\n`;
  
  await message.reply(responseText);
  
  debugLog('API create command completed successfully');
}
