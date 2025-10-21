import { Message } from 'whatsapp-web.js';
import { debugLog } from '../utils/debug';
import { apiService } from '../utils/apiService';

export async function handleApiReadAllCommand(message: Message) {
  await message.reply('🔄 Fetching all data from API...');
  
  const response = await apiService.getAllTestData();
  
  // Format the response for WhatsApp
  let responseText = `✅ ${response.message}\n\n`;
  responseText += `📊 Count: ${response.count}\n\n`;
  
  if (response.data && response.data.length > 0) {
    responseText += '📋 *Data:*\n';
    response.data.forEach((record, index) => {
      responseText += `\n${index + 1}. *ID:* ${record.id}\n`;
      responseText += `   *Phrase:* ${record.phrase}\n`;
      responseText += `   *Number:* ${record.number}\n`;
      responseText += `   *Date:* ${record.date}\n`;
    });
  } else {
    responseText += '📋 No data available\n';
  }
  
  await message.reply(responseText);
  
  debugLog('API read all command completed successfully');
}
