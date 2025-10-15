# Quick Start Guide - Intent Identifier Frontend

## Overview

This frontend provides a dual-panel web interface for real-time intent classification:
- **Left Panel**: Interactive chat window for user queries
- **Right Panel**: JSON display showing intent analysis results

## Prerequisites

Before starting, ensure you have:
- ✅ Node.js installed (v14 or higher)
- ✅ Ollama installed and running
- ✅ Llama 3.2 model pulled in Ollama
- ✅ All npm dependencies installed

## Installation Steps

### 1. Install Dependencies

If you haven't already, install the required packages:

```bash
# From the project root directory
npm install
```

This will install:
- `express` - Web server framework
- `cors` - Cross-origin resource sharing
- All IntentAgent dependencies

### 2. Ensure Ollama is Running

Make sure Ollama is running with Llama 3.2:

```bash
# Start Ollama (if not already running)
ollama serve

# Verify Llama 3.2 is available
ollama list
```

If Llama 3.2 is not installed:
```bash
ollama pull llama3.2
```

## Running the Application

### Method 1: Using npm Scripts (Recommended)

```bash
# Start the frontend server
npm start

# OR specifically run the frontend
npm run frontend
```

### Method 2: Direct Node Execution

```bash
# From the project root
node Frontend/server.js
```

### Method 3: From Frontend Directory

```bash
cd Frontend
node server.js
```

## Accessing the Application

Once the server starts, you'll see:

```
═══════════════════════════════════════════════════════════
  Intent Identifier Server
═══════════════════════════════════════════════════════════
  Server running on: http://localhost:3000
  API endpoint:      http://localhost:3000/api/classify
  Health check:      http://localhost:3000/api/health
═══════════════════════════════════════════════════════════
```

### Open in Browser

1. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

2. You should see the Intent Identifier interface with:
   - Chat panel on the left
   - Intent analysis panel on the right
   - Status indicator showing "Connected"

## Using the Interface

### Sending Messages

1. **Type your message** in the input box at the bottom left
2. **Press Enter** or click the "Send" button
3. **View the chat response** in the left panel
4. **See intent analysis** in the right panel (JSON format)

### Example Messages to Try

**Greeting:**
```
Hello!
```
Expected intent: `greeting` with high confidence

**Question:**
```
What is the weather like today?
```
Expected intent: `question`

**Command:**
```
Please schedule a meeting for tomorrow
```
Expected intent: `command`

**Information Request:**
```
Tell me about intent classification
```
Expected intent: `information_request`

**Feedback:**
```
This is great, thank you!
```
Expected intent: `feedback`

**Goodbye:**
```
Thanks, goodbye!
```
Expected intent: `goodbye`

### Understanding the JSON Output

The right panel shows:

```json
{
  "intent": "greeting",
  "confidence": 0.92,
  "entities": {},
  "error": null
}
```

- **intent**: Classified category (greeting, question, command, etc.)
- **confidence**: How confident the model is (0.0 - 1.0)
- **entities**: Extracted entities from the message
- **error**: Any errors that occurred (null if successful)

### Confidence Badge

The confidence badge in the right panel header shows:
- 🔴 **Red** (< 60%): Low confidence
- 🟠 **Orange** (60-80%): Medium confidence
- 🟢 **Green** (> 80%): High confidence

### Clear Chat

Click the "Clear Chat" button to start a new conversation.

## API Endpoints

The server exposes several endpoints:

### 1. Health Check
```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "ok",
  "service": "Intent Identifier Server",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "agentStatus": "ready"
}
```

### 2. Classify Single Message
```bash
curl -X POST http://localhost:3000/api/classify \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello there!"}'
```

Response:
```json
{
  "intent": "greeting",
  "confidence": 0.92,
  "entities": {},
  "response": "Hello! How can I assist you today?",
  "metadata": {
    "processingTime": 1234,
    "timestamp": "2024-01-15T10:30:00.000Z",
    "model": "llama3.2"
  }
}
```

### 3. Get Intent Categories
```bash
curl http://localhost:3000/api/categories
```

Response:
```json
{
  "categories": [
    "greeting",
    "question",
    "command",
    "information_request",
    "clarification",
    "feedback",
    "goodbye",
    "unknown"
  ],
  "count": 8
}
```

### 4. Batch Classification
```bash
curl -X POST http://localhost:3000/api/classify-batch \
  -H "Content-Type: application/json" \
  -d '{"messages": ["Hello", "How are you?", "Goodbye"]}'
```

## Troubleshooting

### Issue: "Connection failed" status

**Cause**: Server is not running or Ollama is not accessible

**Solution**:
1. Ensure the server is running: `npm start`
2. Check Ollama is running: `ollama serve`
3. Verify port 3000 is not in use

### Issue: Slow response times

**Cause**: Llama 3.2 processing time depends on hardware

**Solution**:
1. This is normal behavior (2-5 seconds typical)
2. Ensure no other heavy processes are running
3. Consider using a smaller model if available

### Issue: "Failed to initialize IntentAgent"

**Cause**: Missing dependencies or incorrect paths

**Solution**:
1. Run `npm install` from project root
2. Verify `Working/intentAgent.js` exists
3. Check `Working/agentConfig.js` is configured correctly

### Issue: Cannot access from other devices

**Cause**: Server only listens on localhost by default

**Solution**:
Edit `Frontend/server.js` and change:
```javascript
app.listen(PORT, '0.0.0.0', () => {
  // ...
});
```

## Deployment Options

### Option 1: Local Development (Current Setup)
- Run on localhost:3000
- Full Ollama integration
- Best for testing and development

### Option 2: GitHub Pages (Demo Mode)
- Static hosting without backend
- Uses mock classification
- No Ollama required
- Limited functionality

### Option 3: Production Server
- Deploy to Heroku, Railway, or similar
- Requires Ollama on server
- Full functionality
- Scalable

## Performance

- **Processing Time**: 2-5 seconds per message (Llama 3.2)
- **Mock Mode**: ~500ms (when Ollama unavailable)
- **Concurrent Users**: Supports multiple users
- **Memory Usage**: ~200-500MB (depends on model)

## Security Considerations

For production deployment:
- Add authentication
- Implement rate limiting
- Use HTTPS
- Validate all inputs
- Add logging and monitoring

## Next Steps

1. ✅ Test with various message types
2. ✅ Explore the API endpoints
3. 📝 Integrate with your application
4. 🚀 Deploy to production (optional)

## Support

If you encounter issues:
1. Check this guide for common problems
2. Review the main README.md
3. Check the Frontend/README.md for detailed info
4. Verify Ollama is working: `ollama run llama3.2 "test"`

## Tips for Best Results

1. **Be specific**: Clear, concise messages get better classifications
2. **Check confidence**: Low confidence may indicate unclear intent
3. **Review entities**: Check what information was extracted
4. **Test edge cases**: Try ambiguous messages to see behavior
5. **Monitor performance**: Keep an eye on response times

Enjoy using the Intent Identifier! 🚀
