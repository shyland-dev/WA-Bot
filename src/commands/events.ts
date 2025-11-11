import { Message } from 'whatsapp-web.js';
import { debugLog } from '../utils/debug';
import * as fs from 'fs';
import * as path from 'path';

interface EventAttendee {
  phoneNumber: string;
  name: string;
  status: 'confirmed' | 'dismissed';
  timestamp: Date;
}

interface Event {
  id: string;
  title: string;
  datetime: Date;
  location: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  chatId: string;
  attendees: EventAttendee[];
  reminders: {
    '1week': boolean;
    '3days': boolean;
    '1day': boolean;
    '3hours': boolean;
    '1hour': boolean;
    '30min': boolean;
    start: boolean;
  };
}

interface ChatEvents {
  activeEvent: Event | null;
  pastEvents: Event[];
}

// File paths for persistence
const DATA_DIR = path.join(process.cwd(), 'data');
const EVENTS_DATA_FILE = path.join(DATA_DIR, 'events-data.json');

const eventsData = new Map<string, ChatEvents>();

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Load events data from JSON
function loadEventsData() {
  try {
    if (fs.existsSync(EVENTS_DATA_FILE)) {
      const data = fs.readFileSync(EVENTS_DATA_FILE, 'utf8');
      const eventsObj: Record<string, ChatEvents> = JSON.parse(data);

      // Convert timestamp strings back to Date objects
      Object.entries(eventsObj).forEach(([chatId, chatEvents]) => {
        if (chatEvents.activeEvent) {
          chatEvents.activeEvent.datetime = new Date(
            chatEvents.activeEvent.datetime,
          );
          chatEvents.activeEvent.createdAt = new Date(
            chatEvents.activeEvent.createdAt,
          );
          chatEvents.activeEvent.attendees =
            chatEvents.activeEvent.attendees.map((attendee) => ({
              ...attendee,
              timestamp: new Date(attendee.timestamp),
            }));
        }

        chatEvents.pastEvents = chatEvents.pastEvents.map((event) => ({
          ...event,
          datetime: new Date(event.datetime),
          createdAt: new Date(event.createdAt),
          attendees: event.attendees.map((attendee) => ({
            ...attendee,
            timestamp: new Date(attendee.timestamp),
          })),
        }));

        eventsData.set(chatId, chatEvents);
      });

      debugLog(
        'Loaded events data for',
        Object.keys(eventsObj).length,
        'chats',
      );
    }
  } catch (error) {
    debugLog('Error loading events data:', error);
  }
}

// Save events data to JSON
function saveEventsData() {
  try {
    ensureDataDir();
    const eventsObj: Record<string, ChatEvents> = {};
    eventsData.forEach((chatEvents, chatId) => {
      eventsObj[chatId] = chatEvents;
    });
    fs.writeFileSync(EVENTS_DATA_FILE, JSON.stringify(eventsObj, null, 2));
    debugLog('Saved events data for', Object.keys(eventsObj).length, 'chats');
  } catch (error) {
    debugLog('Error saving events data:', error);
  }
}

// Generate unique event ID
function generateEventId(): string {
  return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Parse datetime string (YYYY-MM-DD HH:MM)
function parseDateTime(dateTimeStr: string): Date | null {
  const regex = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/;
  const match = dateTimeStr.match(regex);

  if (!match) return null;

  const [, year, month, day, hour, minute] = match;
  const date = new Date(
    parseInt(year),
    parseInt(month) - 1, // Month is 0-indexed
    parseInt(day),
    parseInt(hour),
    parseInt(minute),
  );

  // Check if the date is valid and in the future
  if (isNaN(date.getTime()) || date <= new Date()) {
    return null;
  }

  return date;
}

// Format date for display
function formatDateTime(date: Date): string {
  return date.toLocaleString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  });
}

// Check if user is admin
async function isUserAdmin(message: Message): Promise<boolean> {
  try {
    const chat = await message.getChat();

    if (!chat.isGroup) {
      return true; // In private chats, anyone can create events
    }

    // For groups, get the actual user ID from the message
    const contact = await message.getContact();
    const userId = contact.id._serialized;
    debugLog('Checking admin status for user:', userId);

    // Get chat participants
    const participants = (chat as any).participants;
    if (!participants) {
      debugLog('No participants found in chat');
      return false;
    }

    // Find the user in participants and check admin status
    for (const participant of participants) {
      debugLog(
        'Checking participant:',
        participant.id._serialized,
        'isAdmin:',
        participant.isAdmin,
      );

      if (participant.id._serialized === userId && participant.isAdmin) {
        debugLog('User is admin:', userId);
        return true;
      }
    }

    debugLog('User is not admin:', userId);
    return false;
  } catch (error) {
    debugLog('Error checking admin status:', error);
    return false;
  }
}

// Initialize data on module load
loadEventsData();

export async function handleEventCreateCommand(message: Message) {
  try {
    const chatId = message.from;

    // Check if user is admin
    const isAdmin = await isUserAdmin(message);
    if (!isAdmin) {
      await message.reply('❌ Only group admins can create events.');
      return;
    }

    // Parse command parameters
    const params = message.body.substring(14).trim(); // Remove '/event-create '

    if (!params) {
      await message.reply(
        '❌ Please provide event details.\n\n' +
          '*Usage:* /event-create TITLE | DATETIME | LOCATION | DESCRIPTION\n' +
          '*Example:* /event-create Churrasco | 2025-10-30 18:22 | Casa do Belot | Churras na casa do Belot',
      );
      return;
    }

    const parts = params.split('|').map((part) => part.trim());

    if (parts.length !== 4) {
      await message.reply(
        '❌ Invalid format. Please use:\n' +
          '/event-create TITLE | DATETIME | LOCATION | DESCRIPTION\n\n' +
          '*Example:* /event-create Churrasco | 2025-10-30 18:22 | Casa do Belot | Churras na casa do Belot',
      );
      return;
    }

    const [title, dateTimeStr, location, description] = parts;

    // Validate datetime
    const eventDateTime = parseDateTime(dateTimeStr);
    if (!eventDateTime) {
      await message.reply(
        '❌ Invalid date/time format. Please use: YYYY-MM-DD HH:MM\n' +
          'Example: 2025-10-30 18:22\n\n' +
          '⚠️ Date must be in the future.',
      );
      return;
    }

    // Check if there's already an active event
    let chatEvents = eventsData.get(chatId);
    if (!chatEvents) {
      chatEvents = { activeEvent: null, pastEvents: [] };
      eventsData.set(chatId, chatEvents);
    }

    if (chatEvents.activeEvent) {
      await message.reply(
        '❌ There is already an active event in this chat.\n' +
          'Use /event to see details or wait for it to finish.',
      );
      return;
    }

    // Create new event
    const newEvent: Event = {
      id: generateEventId(),
      title,
      datetime: eventDateTime,
      location,
      description,
      createdBy: message.author || message.from,
      createdAt: new Date(),
      chatId,
      attendees: [],
      reminders: {
        '1week': false,
        '3days': false,
        '1day': false,
        '3hours': false,
        '1hour': false,
        '30min': false,
        start: false,
      },
    };

    chatEvents.activeEvent = newEvent;
    saveEventsData();

    // Send confirmation message
    const eventMessage =
      '🎉 *Event Created Successfully!*\n\n' +
      `📅 *${title}*\n` +
      `📍 *Location:* ${location}\n` +
      `🕐 *Date & Time:* ${formatDateTime(eventDateTime)}\n` +
      `📝 *Description:* ${description}\n\n` +
      '✅ Use /event-confirm to confirm attendance\n' +
      '❌ Use /event-dismiss to decline\n' +
      '📋 Use /event to see event details';

    await message.reply(eventMessage);
    debugLog('Created event for chat:', chatId, 'Title:', title);
  } catch (error) {
    debugLog('Error in event create command:', error);
    try {
      await message.reply('Sorry, there was an error creating the event.');
    } catch (replyError) {
      debugLog(
        'Error sending error reply in event create command:',
        replyError,
      );
    }
  }
}

export async function handleEventCommand(message: Message) {
  try {
    const chatId = message.from;
    const chatEvents = eventsData.get(chatId);

    if (!chatEvents || !chatEvents.activeEvent) {
      await message.reply('📅 No active event in this chat.');
      return;
    }

    const event = chatEvents.activeEvent;
    const confirmedCount = event.attendees.filter(
      (a) => a.status === 'confirmed',
    ).length;
    const dismissedCount = event.attendees.filter(
      (a) => a.status === 'dismissed',
    ).length;

    let eventMessage =
      '📅 *Current Event*\n\n' +
      `📌 *${event.title}*\n` +
      `📍 *Location:* ${event.location}\n` +
      `🕐 *Date & Time:* ${formatDateTime(event.datetime)}\n` +
      `📝 *Description:* ${event.description}\n\n` +
      `✅ *Confirmed:* ${confirmedCount}\n` +
      `❌ *Declined:* ${dismissedCount}\n\n`;

    if (event.attendees.length > 0) {
      eventMessage += '*👥 Attendance List:*\n';
      event.attendees.forEach((attendee) => {
        const status = attendee.status === 'confirmed' ? '✅' : '❌';
        eventMessage += `${status} ${attendee.name}\n`;
      });
    } else {
      eventMessage += '*👥 No responses yet*\n';
    }

    eventMessage += '\n📝 Use /event-confirm or /event-dismiss to respond';

    await message.reply(eventMessage);
    debugLog('Sent event details for chat:', chatId);
  } catch (error) {
    debugLog('Error in event command:', error);
    try {
      await message.reply(
        'Sorry, there was an error getting the event details.',
      );
    } catch (replyError) {
      debugLog('Error sending error reply in event command:', replyError);
    }
  }
}

export async function handleEventConfirmCommand(message: Message) {
  try {
    const chatId = message.from;
    const chatEvents = eventsData.get(chatId);

    if (!chatEvents || !chatEvents.activeEvent) {
      await message.reply('❌ No active event to confirm attendance for.');
      return;
    }

    const event = chatEvents.activeEvent;

    // Check if event has already started
    const now = new Date();
    if (event.datetime <= now) {
      await message.reply(
        '❌ Cannot confirm attendance. The event has already started.',
      );
      return;
    }

    const contact = await message.getContact();
    const phoneNumber = contact.number;
    const name = contact.pushname || contact.name || phoneNumber;

    // Check if user already responded
    const existingAttendeeIndex = event.attendees.findIndex(
      (a) => a.phoneNumber === phoneNumber,
    );

    if (existingAttendeeIndex >= 0) {
      // Update existing response
      event.attendees[existingAttendeeIndex] = {
        phoneNumber,
        name,
        status: 'confirmed',
        timestamp: new Date(),
      };
      await message.reply(
        '✅ Your attendance has been updated to *confirmed*!',
      );
    } else {
      // Add new attendee
      event.attendees.push({
        phoneNumber,
        name,
        status: 'confirmed',
        timestamp: new Date(),
      });
      await message.reply(
        '✅ Thank you! Your attendance has been *confirmed*!',
      );
    }

    saveEventsData();
    debugLog(
      'User confirmed attendance for event:',
      event.title,
      'User:',
      name,
    );
  } catch (error) {
    debugLog('Error in event confirm command:', error);
    try {
      await message.reply(
        'Sorry, there was an error confirming your attendance.',
      );
    } catch (replyError) {
      debugLog(
        'Error sending error reply in event confirm command:',
        replyError,
      );
    }
  }
}

export async function handleEventDismissCommand(message: Message) {
  try {
    const chatId = message.from;
    const chatEvents = eventsData.get(chatId);

    if (!chatEvents || !chatEvents.activeEvent) {
      await message.reply('❌ No active event to dismiss attendance for.');
      return;
    }

    const event = chatEvents.activeEvent;

    // Check if event has already started
    const now = new Date();
    if (event.datetime <= now) {
      await message.reply(
        '❌ Cannot change attendance. The event has already started.',
      );
      return;
    }

    const contact = await message.getContact();
    const phoneNumber = contact.number;
    const name = contact.pushname || contact.name || phoneNumber;

    // Check if user already responded
    const existingAttendeeIndex = event.attendees.findIndex(
      (a) => a.phoneNumber === phoneNumber,
    );

    if (existingAttendeeIndex >= 0) {
      // Update existing response
      event.attendees[existingAttendeeIndex] = {
        phoneNumber,
        name,
        status: 'dismissed',
        timestamp: new Date(),
      };
      await message.reply('❌ Your attendance has been updated to *declined*.');
    } else {
      // Add new attendee
      event.attendees.push({
        phoneNumber,
        name,
        status: 'dismissed',
        timestamp: new Date(),
      });
      await message.reply('❌ Your attendance has been marked as *declined*.');
    }

    saveEventsData();
    debugLog(
      'User dismissed attendance for event:',
      event.title,
      'User:',
      name,
    );
  } catch (error) {
    debugLog('Error in event dismiss command:', error);
    try {
      await message.reply(
        'Sorry, there was an error declining your attendance.',
      );
    } catch (replyError) {
      debugLog(
        'Error sending error reply in event dismiss command:',
        replyError,
      );
    }
  }
}

// Function to check and send reminders (call this periodically)
export function checkEventReminders(client: any) {
  try {
    const now = new Date();

    eventsData.forEach(async (chatEvents, chatId) => {
      if (!chatEvents.activeEvent) return;

      const event = chatEvents.activeEvent;
      const timeDiff = event.datetime.getTime() - now.getTime();
      const timeDiffSeconds = Math.floor(timeDiff / 1000); // Convert to seconds
      const timeDiffMinutes = Math.floor(timeDiffSeconds / 60); // Convert to minutes

      debugLog(
        `Event "${event.title}" time difference: ${timeDiffSeconds} seconds (${timeDiffMinutes} minutes)`,
      );

      // Check for specific reminder intervals with exact minute checks
      const reminders = [
        {
          key: '1week',
          targetMinutes: 7 * 24 * 60, // 10080 minutes (exactly 1 week)
          text: '1 week',
        },
        {
          key: '3days',
          targetMinutes: 3 * 24 * 60, // 4320 minutes (exactly 3 days)
          text: '3 days',
        },
        {
          key: '1day',
          targetMinutes: 24 * 60, // 1440 minutes (exactly 1 day)
          text: '1 day',
        },
        {
          key: '3hours',
          targetMinutes: 3 * 60, // 180 minutes (exactly 3 hours)
          text: '3 hours',
        },
        {
          key: '1hour',
          targetMinutes: 60, // 60 minutes (exactly 1 hour)
          text: '1 hour',
        },
        {
          key: '30min',
          targetMinutes: 30, // 30 minutes (exactly 30 minutes)
          text: '30 minutes',
        },
      ];

      reminders.forEach(async (reminder) => {
        const reminderKey = reminder.key as keyof typeof event.reminders;

        // Check if reminder hasn't been sent and time matches exactly
        if (
          !event.reminders[reminderKey] &&
          timeDiffMinutes === reminder.targetMinutes
        ) {
          event.reminders[reminderKey] = true;

          const reminderMessage =
            `⏰ *Event Reminder - ${reminder.text}*\n\n` +
            `📌 *${event.title}*\n` +
            `📍 *Location:* ${event.location}\n` +
            `🕐 *Date & Time:* ${formatDateTime(event.datetime)}\n\n` +
            `⏳ *Time remaining:* ${reminder.text}`;

          try {
            await client.sendMessage(chatId, reminderMessage);
            debugLog(
              'Sent reminder for event:',
              event.title,
              'Reminder:',
              reminder.text,
              'Seconds remaining:',
              timeDiffSeconds,
            );
          } catch (error) {
            debugLog('Error sending reminder:', error);
          }

          saveEventsData();
        }
      });

      // Send "event starting now" message with confirmed attendees list when timeDiffMinutes is less than 0
      if (timeDiffMinutes < 0 && !event.reminders.start) {
        event.reminders.start = true;

        // Get confirmed attendees
        const confirmedAttendees = event.attendees.filter(
          (a) => a.status === 'confirmed',
        );

        let startingMessage =
          `🎉 *Event Starting Now!*\n\n` +
          `📌 *${event.title}*\n` +
          `📍 *Location:* ${event.location}\n` +
          `🕐 *Date & Time:* ${formatDateTime(event.datetime)}\n\n` +
          `🚀 The event is starting now! Have fun everyone!\n\n`;

        // Add confirmed attendees list
        if (confirmedAttendees.length > 0) {
          startingMessage += `✅ *Confirmed Attendees (${confirmedAttendees.length}):*\n`;
          confirmedAttendees.forEach((attendee, index) => {
            startingMessage += `${index + 1}. ${attendee.name}\n`;
          });
        } else {
          startingMessage += `📝 *No confirmed attendees yet*`;
        }

        try {
          await client.sendMessage(chatId, startingMessage);
          debugLog(
            'Sent "event starting now" message with attendees for event:',
            event.title,
            'Seconds past start:',
            Math.abs(timeDiffSeconds),
          );
        } catch (error) {
          debugLog('Error sending starting message:', error);
        }

        saveEventsData();
      }

      // Deactivate event when timeDiffMinutes is less than -1
      if (timeDiffMinutes < -1) {
        // Move to past events 2 minutes after event starts
        chatEvents.pastEvents.push(event);
        chatEvents.activeEvent = null;
        saveEventsData();
        debugLog(
          'Event has started and was deactivated:',
          event.title,
          'Seconds past start:',
          Math.abs(timeDiffSeconds),
        );

        // Send final notification that event is now inactive
        try {
          const inactiveMessage =
            `🎊 *Event Completed!*\n\n` +
            `📌 *${event.title}* has started and is now inactive.\n\n` +
            `✨ You can now create a new event if needed.`;

          await client.sendMessage(chatId, inactiveMessage);
          debugLog('Sent event deactivation notification:', event.title);
        } catch (error) {
          debugLog('Error sending deactivation notification:', error);
        }
      }
    });
  } catch (error) {
    debugLog('Error checking event reminders:', error);
  }
}

// Add the new delete command function
export async function handleEventDeleteCommand(message: Message) {
  try {
    const chatId = message.from;

    // Check if user is admin
    const isAdmin = await isUserAdmin(message);
    if (!isAdmin) {
      await message.reply('❌ Only group admins can delete events.');
      return;
    }

    const chatEvents = eventsData.get(chatId);

    if (!chatEvents || !chatEvents.activeEvent) {
      await message.reply('❌ No active event to delete.');
      return;
    }

    const eventTitle = chatEvents.activeEvent.title;

    // Move to past events instead of just deleting
    chatEvents.pastEvents.push(chatEvents.activeEvent);
    chatEvents.activeEvent = null;
    saveEventsData();

    await message.reply(
      `🗑️ Event "*${eventTitle}*" has been deleted successfully.\n\nYou can now create a new event.`,
    );
    debugLog('Event deleted by admin for chat:', chatId, 'Title:', eventTitle);
  } catch (error) {
    debugLog('Error in event delete command:', error);
    try {
      await message.reply('Sorry, there was an error deleting the event.');
    } catch (replyError) {
      debugLog(
        'Error sending error reply in event delete command:',
        replyError,
      );
    }
  }
}
