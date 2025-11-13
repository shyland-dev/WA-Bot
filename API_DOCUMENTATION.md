# API Server Documentation

## Overview
The WhatsApp Bot now includes a RESTful API server that allows you to send messages programmatically via HTTP requests.

## Configuration

The API server runs on port **3000** by default. You can change this by setting the `API_PORT` environment variable.

## Authentication

All API endpoints (except `/health` and `/api/token/info`) require authentication using a UUID token.

### Getting Your Token

1. **On first startup**, a unique token is automatically generated and saved to `data/api-token.json`
2. **Check the console logs** when the bot starts - the token is displayed
3. **Check the file**: `cat data/api-token.json`

### Using the Token

Include the token in your requests using one of these methods:

1. **Authorization Header** (Recommended):
```bash
Authorization: Bearer YOUR_TOKEN_HERE
```

2. **Request Body**:
```json
{
  "token": "YOUR_TOKEN_HERE",
  "message": "Hello"
}
```

3. **Query Parameter**:
```
POST /api/send?token=YOUR_TOKEN_HERE
```

## API Endpoints

### 1. Health Check
**GET** `/health`

No authentication required. Check if the API server is online.

**Response:**
```json
{
  "success": true,
  "status": "online",
  "timestamp": "2025-11-13T10:30:00.000Z"
}
```

---

### 2. Token Info
**GET** `/api/token/info`

No authentication required. Get information about the token (but not the token itself).

**Response:**
```json
{
  "success": true,
  "exists": true,
  "createdAt": "2025-11-13T10:00:00.000Z",
  "message": "Token exists. Check your data/api-token.json file or server logs for the actual token."
}
```

---

### 3. Send Message
**POST** `/api/send`

**Authentication:** Required

Send a WhatsApp message to a number or chat ID.

**Request Body:**
```json
{
  "message": "Hello from the API!",
  "number": "YOUR_NUMBER"
}
```

OR

```json
{
  "message": "Hello from the API!",
  "chatId": "YOUR_NUMBER@c.us"
}
```

**Parameters:**
- `message` (required): The text message to send
- `number` (optional): Phone number (will be formatted automatically)
- `chatId` (optional): WhatsApp chat ID (e.g., `YOUR_NUMBER@c.us` for direct message or `YOUR_GROUP@g.us` for groups)

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "targetChatId": "YOUR_NUMBER@c.us",
  "timestamp": "2025-11-13T10:30:00.000Z"
}
```

---

### 4. Get Client Info
**GET** `/api/info`

**Authentication:** Required

Get information about the WhatsApp client.

**Response:**
```json
{
  "success": true,
  "client": {
    "name": "Bot Name",
    "number": "5516991234567",
    "platform": "android",
    "state": "CONNECTED"
  },
  "timestamp": "2025-11-13T10:30:00.000Z"
}
```

## Usage Examples

### cURL Examples

**1. Send message to a phone number:**
```bash
curl -X POST http://localhost:3000/api/send \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello from API!",
    "number": "YOUR_NUMBER"
  }'
```

**2. Send message to a chat ID:**
```bash
curl -X POST http://localhost:3000/api/send \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello group!",
    "chatId": "YOUR_GROUP@g.us"
  }'
```

**3. Check health:**
```bash
curl http://localhost:3000/health
```

**4. Get client info:**
```bash
curl http://localhost:3000/api/info \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### JavaScript/Node.js Example

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:3000';
const API_TOKEN = 'YOUR_TOKEN_HERE';

async function sendMessage(number, message) {
  try {
    const response = await axios.post(`${API_URL}/api/send`, {
      message: message,
      number: number
    }, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Message sent:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    throw error;
  }
}

// Usage
sendMessage('YOUR_NUMBER', 'Hello from Node.js!');
```

### Python Example

```python
import requests

API_URL = 'http://localhost:3000'
API_TOKEN = 'YOUR_TOKEN_HERE'

def send_message(number, message):
    headers = {
        'Authorization': f'Bearer {API_TOKEN}',
        'Content-Type': 'application/json'
    }
    
    data = {
        'message': message,
        'number': number
    }
    
    response = requests.post(f'{API_URL}/api/send', json=data, headers=headers)
    
    if response.status_code == 200:
        print('Message sent:', response.json())
    else:
        print('Error:', response.json())
    
    return response.json()

# Usage
send_message('YOUR_NUMBER', 'Hello from Python!')
```

## Error Responses

**401 Unauthorized** - No token provided:
```json
{
  "success": false,
  "error": "No token provided. Please include token in Authorization header, request body, or query parameter."
}
```

**403 Forbidden** - Invalid token:
```json
{
  "success": false,
  "error": "Invalid token"
}
```

**400 Bad Request** - Missing required fields:
```json
{
  "success": false,
  "error": "Message is required"
}
```

**503 Service Unavailable** - WhatsApp client not ready:
```json
{
  "success": false,
  "error": "WhatsApp client not initialized"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": "Failed to send message",
  "details": "Error details here"
}
```

## Security Notes

1. **Keep your token secret** - Never commit it to version control
2. **Use HTTPS** in production with a reverse proxy (nginx, Apache, etc.)
3. **Firewall** - Restrict access to the API port if needed
4. **Rate limiting** - Consider adding rate limiting for production use
5. **Token rotation** - You can regenerate the token by deleting `data/api-token.json` and restarting the bot

## Deployment Tips

### Using with PM2
The API server starts automatically when you run `npm run pm2`.

### Using with nginx (Reverse Proxy)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Environment Variables
```bash
export API_PORT=3000  # Change API port
```

## Troubleshooting

**API not responding:**
- Check if the bot is running and connected
- Check the logs for any errors
- Verify the port is not blocked by a firewall

**Authentication failing:**
- Verify you're using the correct token from `data/api-token.json`
- Check the Authorization header format: `Bearer TOKEN`

**Messages not sending:**
- Ensure the WhatsApp client is connected (check with `/api/info`)
- Verify the phone number format (numbers only, with country code)
- Check bot logs for detailed error messages
