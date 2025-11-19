# Souloxy Intent Identifier

An intelligent intent classification web application powered by LangGraph and Llama 3.2 via Ollama, featuring an interactive 3D Soul Buddy character.

## Overview

The Souloxy Intent Identifier is a real-time chat application that analyzes user messages to identify their underlying intent. It combines modern AI capabilities with an engaging 3D-animated interface to provide immediate feedback on message classification, confidence levels, and extracted entities.

## Features

- **Real-time Intent Classification**: Analyzes user messages using Llama 3.2 to determine intent
- **Confidence Scoring**: Provides confidence levels for each classification
- **Entity Extraction**: Identifies and extracts relevant entities from user input
- **Interactive 3D Character**: Animated Soul Buddy character with multiple emotional states (waving, idle, sleeping, heart, thinking)
- **Clean UI**: Dual-panel interface with chat on the left and intent analysis on the right
- **Health Monitoring**: Built-in status indicators for server connectivity
- **Comprehensive Test Suite**: 60+ tests covering all functionality

## Project Structure

```
intent-identifier/
├── backend/                  # Python backend (FastAPI)
│   ├── server.py            # FastAPI server with API endpoints
│   ├── intent_agent.py      # LangGraph-based intent classification agent
│   ├── agent_config.py      # Agent configuration
│   ├── requirements.txt     # Python dependencies
│   ├── pytest.ini           # Pytest configuration
│   ├── run_tests.sh         # Test runner script
│   └── venv/                # Python virtual environment (gitignored)
├── tests/                   # Comprehensive test suite
│   ├── test_server.py       # API endpoint tests
│   ├── test_intent_agent.py # Agent logic tests
│   └── test_agent_config.py # Configuration tests
├── frontend/                # Frontend files
│   ├── index.html          # Main application entry point
│   ├── app.js              # Frontend JavaScript logic
│   ├── config.js           # Frontend configuration
│   ├── styles.css          # Application styles
│   └── soul-buddy-animator.js # Three.js animation controller
├── Models/                  # 3D model files for Soul Buddy character
│   ├── waving-soul-buddy.glb
│   ├── idle-soul-buddy.glb
│   ├── sleeping-soul-buddy.glb
│   ├── heart-soul-buddy.glb
│   └── thinking-soul-buddy.glb
├── docs/                    # Documentation
│   ├── README_PYTHON.md    # Python backend documentation
│   ├── QUICKSTART.md       # Quick start guide
│   ├── TESTING_GUIDE.md    # Testing documentation
│   ├── QUICK_TEST.md       # Quick testing reference
│   ├── CUSTOMIZATION-GUIDE.md # Customization guide
│   └── DEPLOYMENT-GUIDE.md # Deployment guide
├── scripts/                 # Utility scripts
│   └── test_all.sh         # Comprehensive test script
└── README.md               # This file
```

## Technology Stack

### Frontend
- **HTML5/CSS3/JavaScript**: Core web technologies
- **Three.js**: 3D rendering and animation for Soul Buddy character
- **GLTF/GLB**: 3D model format for character animations

### Backend
- **Python 3.8+**: Runtime environment
- **FastAPI**: Modern, fast web framework
- **Uvicorn**: ASGI server
- **Pydantic**: Data validation
- **LangGraph**: State graph framework for agent orchestration
- **LangChain**: AI integration framework
- **Ollama**: Local AI model runtime for Llama 3.2

### Testing
- **pytest**: Testing framework
- **pytest-asyncio**: Async testing support
- **httpx**: HTTP client for testing

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Ollama installed and running locally
- Llama 3.2 model pulled in Ollama

## Installation

### 1. Install Ollama

**macOS/Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
Download from [https://ollama.ai](https://ollama.ai)

### 2. Pull Llama 3.2 Model

```bash
ollama pull llama3.2
```

### 3. Clone and Install Dependencies

```bash
git clone <repository-url>
cd intent-identifier
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 4. Configure Environment (Optional)

Create a `.env` file in the backend directory:

```env
PORT=3000
OLLAMA_BASE_URL=http://localhost:11434
```

## Usage

### Starting the Server

1. **Ensure Ollama is running:**
```bash
ollama serve
```

2. **Start the backend server:**
```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python3 server.py
```

The server will start on `http://localhost:3000`

### Accessing the Application

Once the server is running, open your browser and navigate to:
```
http://localhost:3000
```

## API Endpoints

### Health Check
```
GET /api/health
```

Returns server status and agent availability.

**Response:**
```json
{
  "status": "ok",
  "service": "Intent Identifier Server",
  "timestamp": "2025-11-19T20:00:00.000Z",
  "agent_status": "ready"
}
```

### Classify Intent
```
POST /api/classify
Content-Type: application/json

{
  "message": "I want to book a flight to New York"
}
```

Returns intent classification with confidence score, extracted entities, and reasoning.

**Response:**
```json
{
  "intent": "command",
  "confidence": 0.95,
  "entities": {
    "action": "book",
    "object": "flight",
    "location": "New York"
  },
  "response": "I can help you book a flight to New York.",
  "reasoning": {
    "message_analysis": {
      "key_phrases": ["book", "flight", "New York"],
      "user_goal": "Book travel"
    },
    "intent_justification": {
      "why_this_intent": "User is requesting an action",
      "confidence_factors": ["Clear action verb", "Specific destination"]
    }
  },
  "metadata": {
    "processing_time": 1250,
    "timestamp": "2025-11-19T20:00:00.000Z",
    "model": "llama3.2"
  }
}
```

### Get Intent Categories
```
GET /api/categories
```

Returns available intent categories.

### Batch Classification
```
POST /api/classify-batch
Content-Type: application/json

{
  "messages": ["Hello", "What time is it?", "Book a meeting"]
}
```

Classifies multiple messages in one request (max 10).

## Testing

### Run All Tests

```bash
cd backend
source venv/bin/activate
./run_tests.sh
```

### Run Specific Tests

```bash
# Test specific module
pytest ../tests/test_server.py -v

# Test specific function
pytest ../tests/test_server.py::TestHealthEndpoint::test_health_check_success -v
```

### Comprehensive System Test

```bash
cd scripts
./test_all.sh
```

This tests:
- Prerequisites (Python, Ollama, llama3.2)
- Backend unit tests (60+ tests)
- Server functionality
- Frontend files
- Integration tests

## Configuration

### Agent Configuration

Modify `backend/agent_config.py` to customize:
- Model parameters (temperature, base_url)
- Intent categories
- System prompts
- Behavior settings

### Frontend Configuration

Modify `frontend/config.js` to customize:
- API endpoints
- UI behavior
- Animation settings

## Development

### Adding New Intents

1. Update intent categories in `backend/agent_config.py`
2. Modify system prompts to include new intent types
3. Add tests in `tests/test_intent_agent.py`
4. Test with various user inputs

### Modifying Soul Buddy Animations

1. Create new GLTF/GLB animation files
2. Add them to the `Models/` directory
3. Update `frontend/soul-buddy-animator.js` to include new animation states
4. Update `frontend/index.html` to load new models

### Code Quality

The project follows these best practices:
- **Modularity**: Clear separation of concerns
- **Type Safety**: Pydantic models for validation
- **Testing**: Comprehensive test coverage (98%+)
- **Documentation**: Inline comments and dedicated docs
- **Error Handling**: Graceful error handling throughout

## Troubleshooting

### Server Won't Start
- Ensure Ollama is running: `ollama serve`
- Check if port 3000 is available: `lsof -i :3000` (macOS/Linux) or `netstat -ano | findstr :3000` (Windows)
- Verify Python version: `python3 --version` (must be 3.8+)
- Ensure virtual environment is activated
- Install dependencies: `pip install -r requirements.txt`

### Model Not Found
- Pull the model: `ollama pull llama3.2`
- Check Ollama is running: `ollama list`
- Verify Ollama URL in `.env` or defaults to `http://localhost:11434`

### 3D Models Not Loading
- Ensure Models directory has all required .glb files
- Check browser console for loading errors (F12)
- Verify file paths in frontend/index.html
- Check server logs for static file serving errors

### Tests Failing
- Ensure Ollama is running before running tests
- Activate virtual environment: `source venv/bin/activate`
- Install test dependencies: `pip install -r requirements.txt`
- Check pytest configuration in `backend/pytest.ini`

### CORS Errors
- CORS is enabled by default in server.py
- If issues persist, check browser console for specific errors
- Verify API endpoint URLs in `frontend/config.js`

## Deployment

### Production Considerations

1. **Environment Variables**: Use `.env` file for configuration
2. **HTTPS**: Enable HTTPS in production
3. **Rate Limiting**: Implement rate limiting for API endpoints
4. **Authentication**: Add authentication if needed
5. **Process Management**: Use systemd, supervisor, or PM2 equivalent
6. **Monitoring**: Set up logging and monitoring
7. **Security**: Review and update CORS settings

### Example Production Setup

```bash
# Using systemd service
sudo systemctl enable intent-identifier
sudo systemctl start intent-identifier

# Or using screen/tmux for simple deployment
screen -S intent-identifier
cd backend
source venv/bin/activate
python3 server.py
# Press Ctrl+A, D to detach
```

## Documentation

- **Quick Start**: See `docs/QUICKSTART.md` for a 5-minute setup guide
- **Testing Guide**: See `docs/TESTING_GUIDE.md` for detailed testing information
- **Quick Test**: See `docs/QUICK_TEST.md` for quick testing reference
- **Python Backend**: See `docs/README_PYTHON.md` for backend details
- **Customization**: See `docs/CUSTOMIZATION-GUIDE.md` for customization options
- **Deployment**: See `docs/DEPLOYMENT-GUIDE.md` for deployment instructions

## Contributing

When contributing to this project:

1. Follow the existing code structure and naming conventions
2. Write tests for new features
3. Update documentation as needed
4. Test all changes locally before pushing
5. Follow Python PEP 8 style guidelines

## License

[Add your license information here]

## Credits

- **AI Model**: Llama 3.2 by Meta
- **3D Rendering**: Three.js
- **Agent Framework**: LangGraph by LangChain
- **Character Design**: Soul Buddy by Souloxy team
- **Backend Framework**: FastAPI

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.

## Version History

- **v2.0.0** - Complete Python/FastAPI rewrite with comprehensive testing
- **v1.0.0** - Initial Node.js/Express implementation
