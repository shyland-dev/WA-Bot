import { Message } from 'whatsapp-web.js';

import { handlePingCommand } from './ping';
import { handleInfoCommand } from './info';
import { handleTrackCommand } from './track';

export async function handleCommand(message: Message) {
  switch (message.body) {
    case '/ping':
      await handlePingCommand(message);
      break;
    case '/info':
      await handleInfoCommand(message);
      break;
    case '/track':
      await handleTrackCommand(message);
      break;
    default:
      break;
  }
}
