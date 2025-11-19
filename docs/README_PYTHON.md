# Intent Identifier - Python Backend

This directory contains the Python conversion of the JavaScript backend for the Intent Identifier application. The backend has been converted from Node.js/Express to Python/FastAPI while maintaining all original functionality.

## Converted Files

### Backend Modules

1. **agent_config.py** (from Backend/agentConfig.js)
   - Configuration module for the intent agent
   - Manages model settings, system prompts, and behavior parameters
   - Environment variable integration

2. **intent_agent.py** (from Backend/intentAgent.js)
   - Core LangGraph-based intent agent
   - Intent identification and classification
   - Entity extraction and response generation
   - State management using dataclasses

3. **server.py** (from Backend/server.js)
   - FastAPI server implementation
   - RESTful API endpoints for frontend communication
   - Request validation using Pydantic models
   - CORS support and static file serving

### Test Files

All test files are located in the `../Unit Tests/` directory:

- **test_agent_config.py** - Tests for agent configuration
- **test_intent_agent.py** - Tests for intent agent logic
- **test_server.py** - Tests for API endpoints and server functionality

## Architecture

The Python backend maintains the same architecture as the JavaScript version:

```
┌─────────────┐
│   Frontend  │ (JavaScript - unchanged)
│  (Browser)  │
└──────┬──────┘
       │ HTTP/REST
       ▼
┌─────────────┐
│   server.py │ (FastAPI)
│   (REST API)│
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ intent_agent.py │ (LangGraph Agent)
│                 │
└────────┬────────┘
         │
         ▼
    ┌───────────┐
    │  Ollama   │ (LLM)
    │ llama3.2  │
    └───────────┘
```

## Installation

### Prerequisites

- Python 3.9 or higher
- Ollama running locally or remotely
- pip package manager

### Setup

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Ensure Ollama is running:**
   ```bash
   # If Ollama is installed locally
   ollama serve

   # Verify llama3.2 model is available
   ollama list

   # Pull model if needed
   ollama pull llama3.2
   ```

## Running the Server

### Development Mode

```bash
# From the Working directory
python server.py
```

The server will start on `http://localhost:3000` by default.

### Production Mode

```bash
# Using uvicorn directly
uvicorn server:app --host 0.0.0.0 --port 3000 --workers 4
```

### Using Environment Variables

```bash
# Set custom port
PORT=8000 python server.py

# Set environment to production
NODE_ENV=production python server.py
```

## API Endpoints

All endpoints maintain the same structure as the JavaScript version:

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "service": "Intent Identifier Server",
  "timestamp": "2025-01-19T12:00:00Z",
  "agent_status": "ready"
}
```

### Classify Single Message
```http
POST /api/classify
Content-Type: application/json

{
  "message": "Hello, how are you?"
}
```

**Response:**
```json
{
  "intent": "greeting",
  "confidence": 0.95,
  "entities": {},
  "response": "Hello! I'm doing well, thank you for asking.",
  "reasoning": {...},
  "error": null,
  "metadata": {
    "processing_time": 1250,
    "timestamp": "2025-01-19T12:00:00Z",
    "model": "llama3.2"
  }
}
```

### Get Intent Categories
```http
GET /api/categories
```

**Response:**
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

### Batch Classification
```http
POST /api/classify-batch
Content-Type: application/json

{
  "messages": [
    "Hello",
    "What is the weather?",
    "Thank you"
  ]
}
```

**Response:**
```json
{
  "results": [
    {"intent": "greeting", "confidence": 0.95, ...},
    {"intent": "question", "confidence": 0.88, ...},
    {"intent": "goodbye", "confidence": 0.92, ...}
  ],
  "count": 3,
  "timestamp": "2025-01-19T12:00:00Z"
}
```

## Running Tests

### Run All Tests
```bash
# From the project root
cd "Unit Tests"
pytest -v
```

### Run Specific Test File
```bash
pytest test_agent_config.py -v
pytest test_intent_agent.py -v
pytest test_server.py -v
```

### Run Tests with Coverage
```bash
pytest --cov=../Working --cov-report=html
```

### Run Tests in Parallel
```bash
pytest -n auto
```

## Key Differences from JavaScript Version

### Language-Specific Changes

1. **Async/Await:**
   - JavaScript: Native async/await
   - Python: `async`/`await` with `asyncio`

2. **Type Hints:**
   - Python version includes comprehensive type hints
   - Uses Pydantic for request/response validation

3. **Module System:**
   - JavaScript: CommonJS (`require`/`module.exports`)
   - Python: Standard Python imports

4. **Data Structures:**
   - JavaScript: Plain objects
   - Python: Dataclasses and Pydantic models

### Framework Changes

| Feature | JavaScript | Python |
|---------|-----------|--------|
| Web Framework | Express.js | FastAPI |
| Validation | Manual | Pydantic |
| CORS | cors middleware | CORSMiddleware |
| Static Files | express.static | StaticFiles |
| Server | Node.js | Uvicorn |

### Advantages of Python Version

1. **Type Safety:** Strong typing with Pydantic models
2. **Auto Documentation:** FastAPI auto-generates OpenAPI docs at `/docs`
3. **Data Validation:** Automatic request/response validation
4. **Performance:** Async support with asyncio
5. **Testing:** Comprehensive pytest-based test suite

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_API_KEY` | None | Optional API key for remote Ollama |
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `LOG_LEVEL` | `INFO` | Logging level |

## Troubleshooting

### Common Issues

1. **Module Import Errors:**
   ```bash
   # Ensure Working directory is in Python path
   export PYTHONPATH="${PYTHONPATH}:$(pwd)/Working"
   ```

2. **Ollama Connection Failed:**
   ```bash
   # Check Ollama is running
   curl http://localhost:11434/api/version

   # Verify model availability
   ollama list
   ```

3. **Port Already in Use:**
   ```bash
   # Use different port
   PORT=8000 python server.py
   ```

4. **LangChain Dependencies:**
   ```bash
   # Reinstall LangChain packages
   pip install --upgrade langchain-core langchain-ollama langgraph
   ```

## Code Style and Best Practices

The Python code follows these standards:

- **PEP 8:** Python style guide
- **Type Hints:** Comprehensive type annotations
- **Docstrings:** Google-style docstrings for all functions/classes
- **Modularity:** Single Responsibility Principle
- **Testing:** High test coverage with meaningful test names

## Development Workflow

1. **Make Changes:** Edit Python files in `Working/` directory
2. **Run Tests:** Execute pytest to validate changes
3. **Test Locally:** Run server and test with frontend
4. **Lint Code:** Use pylint or flake8 for code quality
5. **Format Code:** Use black or autopep8 for formatting

## Migration Guide

If you're migrating from the JavaScript version:

1. **Install Python and dependencies**
2. **Copy environment variables** from `.env` to `Working/.env`
3. **Update frontend config** if needed (usually no changes required)
4. **Start Python server** instead of Node.js server
5. **Test all endpoints** to ensure compatibility

## Frontend Compatibility

The Python backend is **100% compatible** with the existing JavaScript frontend. No changes are required to:

- `app.js` - Frontend application logic
- `config.js` - Frontend configuration
- `index.html` - HTML structure
- `styles.css` - Styling

The API contract remains identical to ensure seamless integration.

## Performance Considerations

- **Async Operations:** All I/O operations are async for better concurrency
- **Connection Pooling:** Reuses model connections efficiently
- **Request Validation:** Fast Pydantic validation at API boundary
- **Static File Serving:** Efficient static file handling with FastAPI

## Security Notes

1. **CORS:** Configure `allow_origins` for production
2. **Input Validation:** All inputs validated via Pydantic
3. **Error Handling:** Errors don't leak sensitive information
4. **Environment Variables:** Never commit `.env` file

## Support and Contribution

For issues or contributions:

1. Run tests before submitting changes
2. Follow existing code style
3. Add tests for new features
4. Update documentation as needed

## License

Same license as the original JavaScript implementation.
