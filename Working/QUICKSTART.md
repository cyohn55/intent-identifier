# Quick Start Guide - Python Backend

Get the Python backend up and running in 5 minutes.

## Prerequisites

- Python 3.9 or higher
- pip package manager
- Ollama installed and running

## Installation

### 1. Install Python Dependencies

```bash
cd Working
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env if needed (defaults should work)
# Default Ollama URL: http://localhost:11434
```

### 3. Verify Ollama

```bash
# Check Ollama is running
curl http://localhost:11434/api/version

# Ensure llama3.2 model exists
ollama list

# If llama3.2 is not installed:
ollama pull llama3.2
```

## Running the Server

### Option 1: Direct Execution

```bash
cd Working
python server.py
```

### Option 2: Using Uvicorn

```bash
cd Working
uvicorn server:app --reload --port 3000
```

### Option 3: Production Mode

```bash
cd Working
uvicorn server:app --host 0.0.0.0 --port 3000 --workers 4
```

## Verify Installation

### 1. Check Health Endpoint

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "Intent Identifier Server",
  "timestamp": "2025-01-19T12:00:00Z",
  "agent_status": "ready"
}
```

### 2. Test Classification

```bash
curl -X POST http://localhost:3000/api/classify \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, how are you?"}'
```

Expected response:
```json
{
  "intent": "greeting",
  "confidence": 0.95,
  "entities": {},
  "response": "Hello! I'm doing well...",
  "reasoning": {...},
  "metadata": {...}
}
```

### 3. Open Frontend

Navigate to: `http://localhost:3000/`

The frontend should load and connect to the Python backend.

## Running Tests

```bash
# Run all tests
cd Working
./run_tests.sh

# Or use pytest directly
pytest "../Unit Tests" -v
```

## API Documentation

FastAPI provides automatic API documentation:

- **Swagger UI:** http://localhost:3000/docs
- **ReDoc:** http://localhost:3000/redoc

## Common Issues

### Issue: "Module not found"

**Solution:**
```bash
# Ensure you're in the Working directory
cd Working

# Install dependencies
pip install -r requirements.txt
```

### Issue: "Connection refused to Ollama"

**Solution:**
```bash
# Start Ollama service
ollama serve

# Verify it's running
curl http://localhost:11434/api/version
```

### Issue: "Model not found: llama3.2"

**Solution:**
```bash
# Pull the model
ollama pull llama3.2

# Verify model is available
ollama list
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Use a different port
PORT=8000 python server.py

# Or stop the process using port 3000
lsof -ti:3000 | xargs kill -9
```

## Development Tips

### Hot Reload

```bash
# Uvicorn with auto-reload on file changes
uvicorn server:app --reload
```

### Debug Mode

```bash
# Enable debug logging
LOG_LEVEL=DEBUG python server.py
```

### Testing Single Endpoint

```bash
# Test specific functionality
pytest "../Unit Tests/test_server.py::TestClassifyEndpoint::test_classify_message_success" -v
```

## Next Steps

1. ✅ Server running successfully
2. ✅ Tests passing
3. ✅ Frontend connected

Now you can:
- Modify intent categories in `agent_config.py`
- Adjust model parameters
- Add custom endpoints in `server.py`
- Enhance intent logic in `intent_agent.py`

## Resources

- **Full Documentation:** `README_PYTHON.md`
- **Conversion Details:** `CONVERSION_SUMMARY.md`
- **Test Examples:** `../Unit Tests/`

## Support

If you encounter issues:
1. Check error logs in terminal
2. Verify all prerequisites are met
3. Review configuration in `.env`
4. Consult `README_PYTHON.md` for detailed documentation

Happy coding! 🚀
