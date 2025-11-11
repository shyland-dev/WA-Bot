import { Message, MessageMedia } from 'whatsapp-web.js';
import { debugLog } from '../utils/debug';
import * as QRCode from 'qrcode';

export async function handleQrCommand(message: Message) {
  // Extract the text after /qr command
  const text = message.body.substring(3).trim(); // Remove '/qr' and trim whitespace

  if (!text) {
    await message.reply(
      'Please provide text to generate QR code. Usage: /qr <your text>',
    );
    return;
  }

  if (text.length > 500) {
    await message.reply(
      'Text is too long. Please keep it under 500 characters.',
    );
    return;
  }

  const qrOptions = {
    type: 'png' as const,
    quality: 0.92,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    width: 512,
    errorCorrectionLevel: 'M' as const,
  };

  // Generate QR code as buffer
  const qrBuffer = await QRCode.toBuffer(text, qrOptions);

  // Create MessageMedia from buffer
  const media = new MessageMedia(
    'image/png',
    qrBuffer.toString('base64'),
    'qrcode.png',
  );

  // Send the QR code image
  await message.reply(media, undefined, { caption: `QR Code for: ${text}` });

  debugLog('Generated QR code for text:', text);
}
