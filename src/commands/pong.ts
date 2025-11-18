import { Message } from 'whatsapp-web.js';
import { debugLog } from '../utils/debug';

const PONG_PHRASES = [
  'vc eh lindo',
  'te amo',
  'otimo',
  'ta safe aqui <3',
  'eu sei eu sei',
  'vamo pra cima',
  'Sempre penso nisso',
  'Vc é demais',
  'To bem e vc?',
  'Obrigado por perguntar!',
];

export async function handlePongCommand(message: Message) {
  // Get a random phrase from the list
  const randomIndex = Math.floor(Math.random() * PONG_PHRASES.length);
  const randomPhrase = PONG_PHRASES[randomIndex];

  // Send the message (not as a reply)
  const chat = await message.getChat();
  await chat.sendMessage(randomPhrase);

  debugLog('Sent pong phrase:', randomPhrase);
}
