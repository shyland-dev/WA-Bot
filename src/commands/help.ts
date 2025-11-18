import { Message } from 'whatsapp-web.js';

const HELP_MESSAGE = `Here are the available commands:
\`/ping\` - Check if the bot is responsive
\`/info\` - Get information about the bot and current chat
\`/source\` - Get the source code repository link
\`/uptime\` - Get the bot's uptime since last ready state
\`/version\` - Get the bot's current version
\`/qr <text>\` - Generate a QR code image from text

*Event Commands:*
\`/event-create TITLE | DATETIME | LOCATION | DESCRIPTION\` - Create a new event (admins only)
\`/event\` - View current event details and attendance
\`/event-confirm\` - Confirm your attendance
\`/event-dismiss\` - Decline attendance
\`/event-delete\` - Delete the current active event (admins only)

*Keep-Alive Commands:*
\`/keep-alive\` - Toggle keep-alive messages on/off
\`/keep-alive-interval <minutes>\` - Set keep-alive interval
\`/keep-alive-status\` - Show current keep-alive settings

*API Commands:*
\`/api-read-all\` - Get all records from the API
\`/api-read <ID>\` - Get a specific record by ID
\`/api-create <phrase> | <number> | <date>\` - Create a new record
\`/api-update <ID> | <phrase> | <number> | <date>\` - Update a record
\`/api-delete <ID>\` - Delete a record by ID

*Expense Commands:*
\`/expenses\` - Start or stop tracking expenses in this chat/group
\`/expenses-total\` - Get the total expenses tracked in this chat/group
\`/expenses-reset\` - Reset all tracked expenses in this chat/group
`;

export async function handleHelpCommand(message: Message) {
  await message.reply(HELP_MESSAGE);
}
