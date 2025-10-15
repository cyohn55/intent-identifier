# Intent Identifier

A LangGraph-based agent for identifying and classifying user intents using Llama 3.2.

## Project Structure

```
intent-identifier/
├── Frontend/                   # Web interface (NEW!)
│   ├── index.html             # Main HTML interface
│   ├── styles.css             # Styling and animations
│   ├── app.js                 # Client-side JavaScript
│   ├── server.js              # Node.js backend server
│   ├── README.md              # Frontend documentation
│   └── QUICKSTART.md          # Quick start guide
├── Working/                    # Active development files
│   ├── agentConfig.js         # Agent configuration module
│   ├── intentAgent.js         # Main intent agent implementation
│   └── exampleUsage.js        # Usage examples
├── Unit Tests/                # Test files
│   ├── agentConfig.test.js   # Configuration tests
│   └── intentAgent.test.js   # Agent tests
├── MCP Server/               # MCP server configurations
│   └── mcp-settings.json    # GitHub & Playwright MCP settings
├── .env                     # Environment variables (not in git)
├── .env.example            # Environment template
└── package.json           # Project dependencies
```

## Features

- **Web Interface**: Beautiful dual-panel chat interface with real-time intent display
- Intent classification using LangGraph state machine
- Multiple intent categories (greeting, question, command, etc.)
- Confidence scoring for identified intents
- Entity extraction from user messages
- JSON visualization of classification results
- REST API endpoints for integration
- Modular and extensible architecture
- Comprehensive unit tests

## Prerequisites

- Node.js (v14 or higher)
- Ollama installed and running locally (https://ollama.ai)
- Llama 3.2 model pulled in Ollama (`ollama pull llama3.2`)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd intent-identifier
```

2. Install dependencies:
```bash
npm install
```

3. Install and start Ollama:
```bash
# Install Ollama from https://ollama.ai
# Pull Llama 3.2 model
ollama pull llama3.2
```

4. Set up environment variables (optional):
```bash
cp .env.example .env
```

5. Edit `.env` if needed (all settings are optional):
```
# GitHub token for MCP server
GITHUB_PERSONAL_ACCESS_TOKEN=your_github_token_here

# Optional: Custom Ollama URL (defaults to http://localhost:11434)
# OLLAMA_BASE_URL=http://localhost:11434
```

## Usage

### Quick Start - Web Interface (Recommended)

The easiest way to use the Intent Identifier is through the web interface:

```bash
# Start the web interface with backend server
npm start

# Then open your browser to:
# http://localhost:3000
```

**See [Frontend/QUICKSTART.md](Frontend/QUICKSTART.md) for detailed instructions.**

The web interface provides:
- Interactive chat window (left panel)
- Real-time JSON intent display (right panel)
- Confidence indicators
- Entity extraction visualization
- REST API access

### Running Command Line Examples

To run the example usage demonstrating various intent classifications:

```bash
npm run example
```

### Using the Agent in Your Code

```javascript
const { IntentAgent } = require('./Working/intentAgent');

async function main() {
  const agent = new IntentAgent();

  const result = await agent.processMessage('Hello, how are you?');

  console.log(`Intent: ${result.intent}`);
  console.log(`Confidence: ${result.confidence}`);
  console.log(`Response: ${result.response}`);
}

main();
```

### Running Tests

Run all unit tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Intent Categories

The agent currently supports the following intent categories:

- `greeting` - User greetings and salutations
- `question` - Questions seeking information
- `command` - Action requests or commands
- `information_request` - Requests for specific information
- `clarification` - Requests for clarification
- `feedback` - User feedback or comments
- `goodbye` - Farewell messages
- `unknown` - Unclassified intents

## Architecture

### Agent Configuration (`agentConfig.js`)

Manages agent settings including:
- Model configuration (Llama 3.2, temperature, Ollama base URL)
- System prompts
- Behavior settings
- Intent categories
- Environment validation (optional for Ollama)

### Intent Agent (`intentAgent.js`)

Core agent implementation using LangGraph:
- **State Management**: Uses `AgentState` class for data flow
- **Graph Structure**: Three-node processing pipeline
  1. `processInput`: Initializes messages with user input
  2. `identifyIntent`: Analyzes and classifies intent
  3. `generateResponse`: Creates appropriate response

### Testing

Unit tests validate:
- Configuration integrity
- State management
- Intent classification logic
- Error handling
- Environment validation

## MCP Servers

The project includes Model Context Protocol (MCP) servers:

- **GitHub Server**: Git operations and GitHub API access
- **Playwright Server**: Browser automation capabilities

Configuration in `MCP Server/mcp-settings.json`

## Development Guidelines

Following best practices:
- Single Responsibility Principle (SRP)
- High cohesion, low coupling
- Meaningful naming conventions
- Comprehensive documentation
- Production-ready code
- Modular architecture

## License

ISC

## Contributing

1. Create new components in the `Working/` folder
2. Add corresponding tests in `Unit Tests/` folder
3. Follow the code style guide in CLAUDE.md
4. Ensure all tests pass before committing
