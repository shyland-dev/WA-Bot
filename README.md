# WA-Bot

WhatsApp Bot with API integration, expense tracking, and utility commands.

## Setup

1. Install dependencies:
```bash
npm ci
```

2. Copy environment file and configure:
```bash
cp .env.example .env
```

Edit `.env` file and set your configuration:
- `KEEP_ALIVE=true` to enable keep-alive messages
- `WEBSERVICE_URL` - Your API base URL
- `WEBSERVICE_USER` - Your API username
- `WEBSERVICE_PASSWORD` - Your API password

## Ubuntu/Debian Dependencies
```bash
sudo apt install -y chromium-browser
```

## Deploy to PM2
```bash
npm run pm2

pm2 startup
```

## Features

- [x] Expense Tracking
- [x] Help Command
- [x] Info Command
- [x] Ping Command
- [x] Source Command
- [x] Uptime Command
- [x] Version Command
- [x] QR Code Generator
- [x] API Integration (CRUD Operations)
- [x] Configurable Keep-Alive Messages
- [x] Comprehensive Logging
- [x] Environment Configuration

## Commands

### Basic Commands
- `/help` - Show all available commands
- `/ping` - Check if bot is responsive
- `/info` - Get chat information
- `/source` - Get source code repository
- `/uptime` - Show bot uptime
- `/version` - Show bot version
- `/qr <text>` - Generate QR code from text

### API Commands
- `/api-read-all` - Get all records from the API
- `/api-read <ID>` - Get a specific record by ID
- `/api-create <phrase> | <number> | <date>` - Create a new record
- `/api-update <ID> | <phrase> | <number> | <date>` - Update a record
- `/api-delete <ID>` - Delete a record by ID

### Expense Commands
- `/expenses` - Toggle expense tracking in current chat/group
- `/expenses-total` - Show total expenses tracked
- `/expenses-reset` - Reset all tracked expenses

## Usage Examples

### QR Code Generation
```
/qr Hello World
/qr https://github.com/shyland-dev/WA-Bot
/qr Contact: +1234567890
```

### API Operations
```
/api-read-all
/api-read 2
/api-create Hello World | 42 | 2024-01-15 10:30:00
/api-update 2 | Updated Text | 99 | 2024-01-16 14:20:00
/api-delete 2
```

### Expense Tracking
```
/expenses              # Start tracking
15.50 Coffee           # Add expense
25.00 Lunch           # Add expense
/expenses-total       # View total
/expenses-reset       # Reset all
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `KEEP_ALIVE` | Enable/disable keep-alive messages | `false` |
| `KEEP_ALIVE_CHAT_ID` | WhatsApp chat ID for keep-alive messages | `120363403106512185@g.us` |
| `KEEP_ALIVE_INTERVAL_MINUTES` | Interval between keep-alive messages | `30` |
| `WEBSERVICE_URL` | Base URL for API integration | `https://api.example.com` |
| `WEBSERVICE_USER` | Username for API authentication | `user` |
| `WEBSERVICE_PASSWORD` | Password for API authentication | `password` |
