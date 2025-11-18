import { Message } from 'whatsapp-web.js';
import { debugLog } from '../utils/debug';
import {
  toggleEnvBoolean,
  updateEnvVariable,
  getEnvVariable,
} from '../utils/envManager';

export async function handleKeepAliveCommand(message: Message) {
  try {
    const newValue = toggleEnvBoolean('KEEP_ALIVE');

    if (newValue === null) {
      await message.reply(
        '❌ Error toggling keep-alive setting. Please check the logs.',
      );
      return;
    }

    const status = newValue ? '✅ Enabled' : '❌ Disabled';
    const emoji = newValue ? '🟢' : '🔴';

    await message.reply(
      `${emoji} *Keep-Alive Setting Updated*\n\n` +
        `Status: ${status}\n\n` +
        `⚠️ *Note:* The bot needs to be restarted for this change to take full effect.\n` +
        `Current interval: ${getEnvVariable('KEEP_ALIVE_INTERVAL_MINUTES')} minutes`,
    );

    debugLog('Keep-alive toggled to:', newValue);
  } catch (error) {
    debugLog('Error in keep-alive command:', error);
    await message.reply(
      '❌ An error occurred while toggling keep-alive. Please try again.',
    );
  }
}

export async function handleKeepAliveIntervalCommand(message: Message) {
  try {
    const minutes = message.body.substring(21).trim(); // Remove '/keep-alive-interval '

    if (!minutes) {
      const currentInterval = getEnvVariable('KEEP_ALIVE_INTERVAL_MINUTES');
      await message.reply(
        '⏰ *Keep-Alive Interval*\n\n' +
          `Current interval: *${currentInterval} minutes*\n\n` +
          '*Usage:* /keep-alive-interval <minutes>\n' +
          '*Example:* /keep-alive-interval 30',
      );
      return;
    }

    const minutesNum = parseInt(minutes, 10);

    if (isNaN(minutesNum) || minutesNum < 1) {
      await message.reply(
        '❌ Invalid interval. Please provide a positive number of minutes.\n\n' +
          '*Example:* /keep-alive-interval 30',
      );
      return;
    }

    if (minutesNum > 1440) {
      // More than 24 hours
      await message.reply(
        '⚠️ Warning: Interval is very large (more than 24 hours).\n' +
          'Are you sure you want to set it to *' +
          minutesNum +
          ' minutes*?\n\n' +
          'This is approximately *' +
          Math.round(minutesNum / 60) +
          ' hours*.',
      );
    }

    const success = updateEnvVariable('KEEP_ALIVE_INTERVAL_MINUTES', minutes);

    if (!success) {
      await message.reply(
        '❌ Error updating keep-alive interval. Please check the logs.',
      );
      return;
    }

    const hours = Math.floor(minutesNum / 60);
    const remainingMinutes = minutesNum % 60;
    let timeDescription = '';

    if (hours > 0) {
      timeDescription += `${hours} hour${hours > 1 ? 's' : ''}`;
      if (remainingMinutes > 0) {
        timeDescription += ` and ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
      }
    } else {
      timeDescription = `${minutesNum} minute${minutesNum > 1 ? 's' : ''}`;
    }

    await message.reply(
      `✅ *Keep-Alive Interval Updated*\n\n` +
        `New interval: *${minutesNum} minutes* (${timeDescription})\n\n` +
        `⚠️ *Note:* The bot needs to be restarted for this change to take full effect.`,
    );

    debugLog('Keep-alive interval updated to:', minutes, 'minutes');
  } catch (error) {
    debugLog('Error in keep-alive-interval command:', error);
    await message.reply(
      '❌ An error occurred while updating the interval. Please try again.',
    );
  }
}

export async function handleKeepAliveStatusCommand(message: Message) {
  try {
    const enabled = getEnvVariable('KEEP_ALIVE');
    const interval = getEnvVariable('KEEP_ALIVE_INTERVAL_MINUTES');
    const chatId = getEnvVariable('KEEP_ALIVE_CHAT_ID');

    const status = enabled === 'true' ? '✅ Enabled' : '❌ Disabled';
    const emoji = enabled === 'true' ? '🟢' : '🔴';

    const intervalNum = parseInt(interval || '0', 10);
    const hours = Math.floor(intervalNum / 60);
    const remainingMinutes = intervalNum % 60;
    let timeDescription = '';

    if (hours > 0) {
      timeDescription += `${hours} hour${hours > 1 ? 's' : ''}`;
      if (remainingMinutes > 0) {
        timeDescription += ` and ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
      }
    } else {
      timeDescription = `${intervalNum} minute${intervalNum > 1 ? 's' : ''}`;
    }

    await message.reply(
      `${emoji} *Keep-Alive Status*\n\n` +
        `*Status:* ${status}\n` +
        `*Interval:* ${interval} minutes (${timeDescription})\n` +
        `*Target Chat:* ${chatId}\n\n` +
        `*Commands:*\n` +
        `• /keep-alive - Toggle on/off\n` +
        `• /keep-alive-interval <minutes> - Set interval\n` +
        `• /keep-alive-status - Show this status`,
    );

    debugLog('Keep-alive status requested');
  } catch (error) {
    debugLog('Error in keep-alive-status command:', error);
    await message.reply(
      '❌ An error occurred while fetching status. Please try again.',
    );
  }
}
