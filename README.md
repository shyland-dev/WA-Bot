# WA-Bot

## Ubuntu/Debian Deps
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
- [ ] ???

## Commands

- `/help` - Show all available commands
- `/ping` - Check if bot is responsive
- `/info` - Get chat information
- `/source` - Get source code repository
- `/uptime` - Show bot uptime
- `/version` - Show bot version
- `/qr <text>` - Generate QR code from text
- `/expenses` - Toggle expense tracking
- `/expenses-total` - Show total expenses
- `/expenses-reset` - Reset expenses
