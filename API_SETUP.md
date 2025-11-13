# API Server Setup Summary

## What Was Created

### 1. API Server (`src/api/server.ts`)
A RESTful API service that allows external applications to send WhatsApp messages via HTTP requests.

**Features:**
- ✅ UUID token-based authentication
- ✅ Automatic token generation and persistence
- ✅ Health check endpoint
- ✅ Send messages to phone numbers or chat IDs
- ✅ Get WhatsApp client information
- ✅ Comprehensive error handling

### 2. Integration with Main Bot (`src/index.ts`)
The API server is automatically started when the bot becomes ready and has access to the WhatsApp client.

### 3. Documentation (`API_DOCUMENTATION.md`)
Complete API documentation with:
- Endpoint descriptions
- Authentication methods
- Usage examples (cURL, JavaScript, Python)
- Error responses
- Security best practices

## Installation Steps

### 1. Install Dependencies
```bash
npm install express body-parser uuid
npm install --save-dev @types/express @types/uuid
```

### 2. Build the Project
```bash
npm run build
```

### 3. Start the Bot
```bash
# Development
npm run watch

# Production with PM2
npm run pm2
```

## API Server Details

### Port
- **Default**: 3000
- **Configure**: Set `API_PORT` environment variable

### Authentication Token
- **Location**: `data/api-token.json`
- **Auto-generated**: On first startup
- **Security**: Stored in gitignored `data/` folder

### Finding Your Token

**Method 1 - Console Logs:**
When the bot starts, the token is displayed:
```
📝 API Token: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

**Method 2 - Check File:**
```bash
cat data/api-token.json
```

## Quick Start Usage

### 1. Check if API is Running
```bash
curl http://localhost:3000/health
```

### 2. Send a Message
```bash
curl -X POST http://localhost:3000/api/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello from API!",
    "number": "YOUR_NUMBER"
  }'
```

### 3. Get Client Info
```bash
curl http://localhost:3000/api/info \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Available Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |
| GET | `/api/token/info` | No | Token information |
| POST | `/api/send` | Yes | Send WhatsApp message |
| GET | `/api/info` | Yes | Get client information |

## Security Features

1. **UUID Token**: Unique, randomly generated authentication token
2. **Multiple Auth Methods**: Header, body, or query parameter
3. **Token Persistence**: Saved securely in `data/` folder
4. **Gitignore Protected**: Token file excluded from version control
5. **Request Validation**: Validates all required fields

## Integration Example

### Node.js
```javascript
const axios = require('axios');

async function sendWhatsAppMessage(number, message) {
  const response = await axios.post('http://localhost:3000/api/send', {
    message,
    number
  }, {
    headers: {
      'Authorization': 'Bearer YOUR_TOKEN'
    }
  });
  return response.data;
}
```

### Python
```python
import requests

def send_whatsapp_message(number, message):
    response = requests.post('http://localhost:3000/api/send',
        json={'message': message, 'number': number},
        headers={'Authorization': 'Bearer YOUR_TOKEN'}
    )
    return response.json()
```

## Production Deployment

### With nginx Reverse Proxy
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### With HTTPS (Recommended)
Use Let's Encrypt or similar for SSL/TLS:
```bash
certbot --nginx -d your-domain.com
```

## Troubleshooting

### API not starting
- Check if port 3000 is available
- Verify dependencies are installed
- Check logs for errors

### Authentication failing
- Verify token from `data/api-token.json`
- Check Authorization header format: `Bearer TOKEN`
- Ensure no extra spaces in token

### Messages not sending
- Verify WhatsApp client is connected
- Check `/api/info` endpoint for client status
- Verify number format (country code + number)

## File Structure
```
WA-Bot/
├── src/
│   ├── api/
│   │   └── server.ts        # API server implementation
│   ├── commands/
│   ├── utils/
│   └── index.ts             # Main bot entry (integrated with API)
├── data/
│   └── api-token.json       # Auto-generated token (gitignored)
└── API_DOCUMENTATION.md     # Complete API documentation
```

## Next Steps

1. **Install Dependencies**: Run `npm install`
2. **Build**: Run `npm run build`
3. **Start Bot**: Run `npm run pm2` or `npm run watch`
4. **Get Token**: Check console logs or `data/api-token.json`
5. **Test API**: Use cURL examples from documentation
6. **Integrate**: Use the API in your applications

## Support

For detailed API documentation, see `API_DOCUMENTATION.md`
For bot commands and features, see `README.md`
