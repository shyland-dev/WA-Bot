import { Message } from 'whatsapp-web.js';
import { debugLog } from '../utils/debug';
import { apiService } from '../utils/apiService';

export async function handleApiDeleteCommand(message: Message) {
  const id = message.body.substring(12).trim();

  if (!id) {
    await message.reply(
      'Please provide an ID to delete. Usage: /api-delete <ID>',
    );
    return;
  }

  await message.reply(`🔄 Deleting record ID: ${id}...`);

  const response = await apiService.deleteTestData(id);

  let responseText = `✅ ${response.message}\n\n`;
  responseText += `🗑️ *Deleted Record ID:* ${id}\n`;

  await message.reply(responseText);

  debugLog('API delete command completed successfully for ID:', id);
}
