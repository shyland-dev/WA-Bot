import { Message } from 'whatsapp-web.js';
import { debugLog } from '../utils/debug';
import { apiService } from '../utils/apiService';

export async function handleApiTestCommand(message: Message) {
  const loadingMessage = await message.reply('🔄 Fetching data from API...');
  
  const response = await apiService.getTestData();
  
  // Format the response for WhatsApp
  let responseText = `✅ ${response.message}\n\n`;
  responseText += `📊 Count: ${response.count}\n\n`;
  
  if (response.data && response.data.length > 0) {
    responseText += '📋 *Data:*\n';
    response.data.forEach((record, index) => {
      responseText += `\n${index + 1}. *Record ID:* ${record.id}\n`;
      responseText += `   *Phrase:* ${record.phrase}\n`;
      responseText += `   *Number:* ${record.number}\n`;
      responseText += `   *Date:* ${record.date}\n`;
    });
  } else {
    responseText += '📋 No data available\n';
  }
  
  // Edit the loading message with the actual response
  // Since WhatsApp Web.js doesn't support editing messages directly,
  // we'll send a new message and mention that we're updating
  await message.reply(responseText);
  
  debugLog('API test command completed successfully');
}
