# Complete Testing Guide - Frontend & Backend

This guide covers all testing scenarios for the Intent Identifier application.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Backend Testing](#backend-testing)
3. [Frontend Testing](#frontend-testing)
4. [Integration Testing](#integration-testing)
5. [Manual Testing Scenarios](#manual-testing-scenarios)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- ✅ Python 3.9+ installed
- ✅ pip package manager
- ✅ Ollama installed and running
- ✅ Web browser (Chrome, Firefox, Edge, Safari)

### Initial Setup

```bash
# 1. Install Python dependencies
cd Working
pip install -r requirements.txt

# 2. Verify Ollama is running
ollama serve

# 3. Ensure llama3.2 model is available
ollama list
# If not present: ollama pull llama3.2
```

---

## Backend Testing

### 1. Run Unit Tests

Tests the Python backend logic without running the server.

```bash
# Option 1: Use the test runner script
cd Working
./run_tests.sh

# Option 2: Use pytest directly
cd Working
pytest "../Unit Tests" -v

# Option 3: Run specific test file
pytest "../Unit Tests/test_agent_config.py" -v
pytest "../Unit Tests/test_intent_agent.py" -v
pytest "../Unit Tests/test_server.py" -v
```

**Expected Output:**
```
========================================
  Intent Identifier - Python Test Suite
========================================

Running all tests...

Unit Tests/test_agent_config.py::TestAgentConfig::test_initialization_with_defaults PASSED
Unit Tests/test_agent_config.py::TestAgentConfig::test_system_prompt_is_not_empty PASSED
[... more tests ...]

========================================
✓ All tests passed!
========================================
```

### 2. Run Backend Server

Start the Python backend server.

```bash
# From the Working directory
cd Working
python server.py
```

**Expected Output:**
```
═══════════════════════════════════════════════════════════
  Intent Identifier Server
═══════════════════════════════════════════════════════════
  Server running on: http://localhost:3000
  API endpoint:      http://localhost:3000/api/classify
  Health check:      http://localhost:3000/api/health
═══════════════════════════════════════════════════════════

Available endpoints:
  GET  /                      - Frontend interface
  GET  /api/health            - Health check
  GET  /api/categories        - Get intent categories
  POST /api/classify          - Classify single message
  POST /api/classify-batch    - Classify multiple messages

Press Ctrl+C to stop the server
```

### 3. Test Backend API Endpoints

**In a NEW terminal window** (keep server running in first terminal):

#### Test Health Check
```bash
curl http://localhost:3000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "Intent Identifier Server",
  "timestamp": "2025-01-19T...",
  "agent_status": "ready"
}
```

#### Test Single Message Classification
```bash
curl -X POST http://localhost:3000/api/classify \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'
```

**Expected Response:**
```json
{
  "intent": "greeting",
  "confidence": 0.95,
  "entities": {},
  "response": "Hello! I'm doing well, thank you...",
  "reasoning": {...},
  "error": null,
  "metadata": {
    "processing_time": 1250,
    "timestamp": "2025-01-19T...",
    "model": "llama3.2"
  }
}
```

#### Test Intent Categories
```bash
curl http://localhost:3000/api/categories
```

**Expected Response:**
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

#### Test Batch Classification
```bash
curl -X POST http://localhost:3000/api/classify-batch \
  -H "Content-Type: application/json" \
  -d '{"messages": ["Hello", "What is the weather?", "Thank you"]}'
```

**Expected Response:**
```json
{
  "results": [
    {"intent": "greeting", "confidence": 0.95, ...},
    {"intent": "question", "confidence": 0.88, ...},
    {"intent": "goodbye", "confidence": 0.92, ...}
  ],
  "count": 3,
  "timestamp": "2025-01-19T..."
}
```

### 4. View Auto-Generated API Documentation

FastAPI automatically generates interactive API documentation:

- **Swagger UI:** http://localhost:3000/docs
- **ReDoc:** http://localhost:3000/redoc

You can test all API endpoints directly from the Swagger UI interface!

---

## Frontend Testing

### 1. Access Frontend Interface

With the backend server running:

1. **Open your web browser**
2. **Navigate to:** http://localhost:3000/
3. **You should see:**
   - Chat interface on the left
   - Intent analysis panel on the right
   - 3D animated character (Soul Buddy)
   - Status indicator showing "Connected"

### 2. Test Frontend Components

#### A. Connection Status
- **Location:** Top-right corner
- **Expected:** Green dot with "Connected to Intent Identifier Server"
- **If Disconnected:** Red dot with error message

#### B. 3D Animation (Soul Buddy)
- **Expected Behavior:**
  - Character should be visible and animated
  - Background should rotate slowly
  - Character should cycle through animations:
    1. Wave animation (greeting)
    2. Idle animation (5 loops)
    3. Sleeping animation (continuous)

#### C. Chat Input
- **Location:** Bottom of chat panel
- **Test:**
  1. Type a message
  2. Click "Send" or press Enter
  3. Message should appear in chat
  4. Response should appear after ~1-2 seconds

#### D. Intent Display Panel
- **Location:** Right side
- **Expected:** Shows JSON with:
  - Intent classification
  - Confidence score
  - Extracted entities
  - Reasoning analysis

### 3. Test Frontend JavaScript Console

Open browser developer tools (F12) and check for errors:

**Chrome/Edge:** Right-click → Inspect → Console tab
**Firefox:** Right-click → Inspect Element → Console tab
**Safari:** Develop → Show JavaScript Console

**Expected:** No errors (warnings are OK)

---

## Integration Testing

Test the full stack (Frontend + Backend working together).

### Test Scenario 1: Basic Chat Flow

1. **Start Backend:**
   ```bash
   cd Working
   python server.py
   ```

2. **Open Frontend:** http://localhost:3000/

3. **Send Messages and Verify:**

| Message | Expected Intent | Expected Response Type |
|---------|----------------|----------------------|
| "Hi there" | greeting | Friendly greeting |
| "What is the weather?" | question | Informative answer |
| "Schedule a meeting" | command | Acknowledgment |
| "Thank you" | goodbye | Polite farewell |
| "Can you help me?" | clarification | Offer to assist |

4. **Verify Intent Panel Updates:**
   - JSON shows correct intent
   - Confidence score displayed (0.0 to 1.0)
   - Entities extracted (if any)
   - Reasoning provided

### Test Scenario 2: Animation Interactions

1. **Send Button Click:**
   - Type a message
   - Click Send
   - **Expected:** Character switches to "thinking" animation
   - **Then:** Returns to idle after response

2. **Click Character:**
   - Click on the 3D character
   - **Expected:** Heart animation plays
   - **Then:** Returns to idle

3. **Idle Behavior:**
   - Leave browser tab open
   - Don't interact for 30+ seconds
   - **Expected:** Character switches to sleeping animation

### Test Scenario 3: Error Handling

1. **Test with Backend Stopped:**
   - Stop the backend server (Ctrl+C)
   - Refresh browser
   - **Expected:** Status shows "Disconnected"
   - Try sending a message
   - **Expected:** Error message in chat

2. **Test with Invalid Input:**
   - Send empty message
   - **Expected:** Nothing happens (button disabled)

3. **Test with Very Long Message:**
   - Send message > 1000 characters
   - **Expected:** Error response from server

### Test Scenario 4: Clear Chat

1. **Send several messages**
2. **Click "Clear Chat" button**
3. **Expected:**
   - All messages removed
   - Intent panel resets to placeholder
   - Message counter resets to 0

---

## Manual Testing Scenarios

### Comprehensive Test Suite

Copy this checklist and verify each item:

#### Backend Server Tests

- [ ] Server starts without errors
- [ ] Health endpoint returns 200 OK
- [ ] Classify endpoint accepts valid messages
- [ ] Classify endpoint rejects empty messages
- [ ] Classify endpoint rejects messages > 1000 chars
- [ ] Batch endpoint accepts 1-10 messages
- [ ] Batch endpoint rejects > 10 messages
- [ ] Categories endpoint returns 8 categories
- [ ] API documentation accessible at /docs

#### Frontend Display Tests

- [ ] Page loads without errors
- [ ] Chat panel visible
- [ ] Intent panel visible
- [ ] 3D character visible
- [ ] Status indicator shows connection
- [ ] Message counter displays "Messages: 0"

#### Frontend Interaction Tests

- [ ] Can type in message input
- [ ] Send button clickable
- [ ] Enter key sends message
- [ ] Shift+Enter creates new line
- [ ] Clear chat button works
- [ ] Character responds to clicks

#### 3D Animation Tests

- [ ] Wave animation plays on load
- [ ] Idle animation loops 5 times
- [ ] Sleeping animation starts after idle
- [ ] Thinking animation plays on send
- [ ] Heart animation plays on click
- [ ] Background rotates continuously

#### Intent Classification Tests

Test these messages and verify correct intent:

- [ ] "Hello" → greeting
- [ ] "Hi there" → greeting
- [ ] "Good morning" → greeting
- [ ] "What is this?" → question
- [ ] "How does it work?" → question
- [ ] "Schedule a meeting" → command
- [ ] "Can you help?" → clarification
- [ ] "Thanks" → goodbye
- [ ] "Goodbye" → goodbye
- [ ] "Tell me about Python" → information_request

#### Entity Extraction Tests

Test these messages and verify entities:

- [ ] "I'm feeling happy" → emotion: happy
- [ ] "Meeting with John tomorrow" → person: John, time: tomorrow
- [ ] "Jane makes me mad" → person: Jane, emotion: mad

---

## Troubleshooting

### Backend Issues

#### Problem: "Module not found" error
```bash
# Solution: Install dependencies
cd Working
pip install -r requirements.txt
```

#### Problem: "Connection refused" to Ollama
```bash
# Solution: Start Ollama
ollama serve

# In another terminal, verify:
curl http://localhost:11434/api/version
```

#### Problem: "Model not found: llama3.2"
```bash
# Solution: Pull the model
ollama pull llama3.2

# Verify:
ollama list
```

#### Problem: "Port 3000 already in use"
```bash
# Solution 1: Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Solution 2: Use different port
PORT=8000 python server.py
# Then access at http://localhost:8000
```

#### Problem: Tests fail with import errors
```bash
# Solution: Set PYTHONPATH
cd Working
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
pytest "../Unit Tests" -v
```

### Frontend Issues

#### Problem: "Backend Unavailable" message
**Check:**
1. Is backend server running? (`python server.py`)
2. Is it running on correct port? (default: 3000)
3. Check browser console for errors (F12)

**Solution:**
```bash
# Restart backend
cd Working
python server.py
```

#### Problem: 3D character not visible
**Check:**
1. Are Models files present in `Models/` directory?
2. Check browser console for 404 errors
3. Ensure WebGL is enabled in browser

**Test WebGL:**
Visit https://get.webgl.org/

#### Problem: No response after sending message
**Check:**
1. Backend server logs for errors
2. Browser console for JavaScript errors
3. Network tab shows successful API calls

**Debug:**
```bash
# Check backend logs in terminal where server is running
# Look for error messages after sending message
```

#### Problem: Incorrect API endpoint
**Check:** `config.js` file

```javascript
// Should automatically detect localhost
get BACKEND_API_URL() {
    return window.location.origin;
}
```

### Performance Issues

#### Problem: Slow response times (> 5 seconds)
**Causes:**
1. Ollama model not loaded in memory
2. Insufficient system resources
3. Cold start (first request)

**Solutions:**
```bash
# Warm up Ollama
ollama run llama3.2
# Type: /bye to exit

# Check system resources
htop  # or top on Mac/Linux
```

#### Problem: High memory usage
**Normal:** 200-500MB for Python backend
**High:** > 1GB

**Solutions:**
- Restart backend server
- Check for memory leaks in logs
- Ensure only one instance running

---

## Test Results Documentation

Use this template to document your test results:

```markdown
# Test Results - [Date]

## Environment
- OS: [Windows/Mac/Linux]
- Python Version: [3.9/3.10/3.11]
- Browser: [Chrome/Firefox/Safari/Edge]
- Ollama Version: [version]

## Backend Tests
- [ ] Unit tests: [PASS/FAIL] - [XX/70 tests passed]
- [ ] Server startup: [PASS/FAIL]
- [ ] API endpoints: [PASS/FAIL]
- [ ] Error handling: [PASS/FAIL]

## Frontend Tests
- [ ] Page load: [PASS/FAIL]
- [ ] Chat interface: [PASS/FAIL]
- [ ] 3D animations: [PASS/FAIL]
- [ ] API integration: [PASS/FAIL]

## Issues Found
1. [Description of any issues]
2. [Steps to reproduce]
3. [Expected vs actual behavior]

## Notes
[Any additional observations]
```

---

## Quick Test Commands

**Complete test in one terminal session:**

```bash
# Terminal 1: Start backend
cd Working
python server.py

# Terminal 2: Run tests
cd Working
pytest "../Unit Tests" -v

# Terminal 2: Test API
curl http://localhost:3000/api/health

# Terminal 2: Test classification
curl -X POST http://localhost:3000/api/classify \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello world"}'

# Browser: Open http://localhost:3000/
# Manually test chat interface
```

---

## Continuous Testing During Development

### Watch Mode (Auto-run tests on file changes)

```bash
# Install pytest-watch
pip install pytest-watch

# Run in watch mode
cd Working
ptw "../Unit Tests" -- -v
```

### VS Code Testing

If using VS Code:
1. Install "Python" extension
2. Click Testing icon in sidebar
3. Tests appear in test explorer
4. Click to run individual tests

### Pre-commit Testing

Create a pre-commit hook:

```bash
# .git/hooks/pre-commit
#!/bin/bash
cd Working
pytest "../Unit Tests" -q
if [ $? -ne 0 ]; then
    echo "Tests failed. Commit aborted."
    exit 1
fi
```

---

## Success Criteria

Your testing is successful when:

✅ **All unit tests pass** (70+ tests)
✅ **Backend server starts without errors**
✅ **Health endpoint returns 200 OK**
✅ **Frontend loads without console errors**
✅ **Can send messages and receive responses**
✅ **Intent classification is accurate**
✅ **3D animations work smoothly**
✅ **Connection status shows "Connected"**
✅ **Clear chat functionality works**

---

## Additional Resources

- **Python Backend Docs:** `Working/README_PYTHON.md`
- **Quick Start Guide:** `Working/QUICKSTART.md`
- **API Documentation:** http://localhost:3000/docs (when server running)
- **Conversion Details:** `Working/CONVERSION_SUMMARY.md`

---

## Getting Help

If you encounter issues:

1. **Check logs:** Backend terminal shows detailed error messages
2. **Browser console:** F12 to see JavaScript errors
3. **Review docs:** `README_PYTHON.md` has detailed troubleshooting
4. **Test isolation:** Test backend and frontend separately to isolate issues

Happy Testing! 🧪✅
