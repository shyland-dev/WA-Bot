import { Message } from 'whatsapp-web.js';
import { debugLog } from '../utils/debug';
import { apiService } from '../utils/apiService';

export async function handleApiReadCommand(message: Message) {
  const id = message.body.substring(10).trim();
  
  if (!id) {
    await message.reply('Please provide an ID. Usage: /api-read <ID>');
    return;
  }

  await message.reply(`🔄 Fetching data for ID: ${id}...`);
  
  const response = await apiService.getTestDataById(id);
  
  let responseText = `✅ ${response.message}\n\n`;
  responseText += '📋 *Record Details:*\n\n';
  responseText += `*ID:* ${response.data.id}\n`;
  responseText += `*Phrase:* ${response.data.phrase}\n`;
  responseText += `*Number:* ${response.data.number}\n`;
  responseText += `*Date:* ${response.data.date}\n`;
  
  await message.reply(responseText);
  
  debugLog('API read command completed successfully for ID:', id);
}
