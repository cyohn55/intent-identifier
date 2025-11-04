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
- **Cloudflare Tunnel Support**: Infrastructure for secure remote access

## Project Structure

```
intent-identifier/
├── Frontend/                 # Frontend-specific assets (currently empty, using root files)
├── Backend/                  # Server and AI logic
│   ├── server.js            # Express server with API endpoints
│   ├── intentAgent.js       # LangGraph-based intent classification agent
│   └── agentConfig.js       # Agent configuration
├── Infrastructure/          # Deployment and infrastructure files
│   ├── ecosystem.config.js  # PM2 configuration
│   ├── start-server.sh      # Linux/Mac startup script
│   ├── start-server.ps1     # Windows PowerShell startup script
│   ├── start-with-tunnel.ps1 # Cloudflare tunnel startup script
│   └── cloudflared          # Cloudflare tunnel binary
├── Models/                  # 3D model files for Soul Buddy character
│   ├── waving-soul-buddy.glb
│   ├── idle-soul-buddy.glb
│   ├── sleeping-soul-buddy.glb
│   ├── heart-soul-buddy.glb
│   └── thinking-soul-buddy.glb
├── Working/                 # Development workspace for active iterations
├── index.html              # Main application entry point
├── app.js                  # Frontend JavaScript logic
├── styles.css              # Application styles
├── soul-buddy-animator.js  # Three.js animation controller
└── config.js               # Frontend configuration

```

## Technology Stack

### Frontend
- **HTML5/CSS3/JavaScript**: Core web technologies
- **Three.js**: 3D rendering and animation for Soul Buddy character
- **GLTF/GLB**: 3D model format for character animations

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web server framework
- **LangGraph**: State graph framework for agent orchestration
- **LangChain**: AI integration framework
- **Ollama**: Local AI model runtime for Llama 3.2

### Infrastructure
- **PM2**: Process management
- **Cloudflare Tunnel**: Secure remote access
- **CORS**: Cross-origin resource sharing enabled

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
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
git clone https://github.com/shrutib31/souloxy-ai-core.git
cd souloxy-ai-core
git checkout cody-intent-identifier
npm install
```

### 4. Configure Environment

Create a `.env` file in the root directory (optional, defaults will work):

```env
PORT=3000
OLLAMA_BASE_URL=http://localhost:11434
```

## Usage

### Starting the Server

**Option 1: Direct Node.js**
```bash
node Backend/server.js
```

**Option 2: Using PM2 (Recommended for Production)**
```bash
npm install -g pm2
pm2 start Infrastructure/ecosystem.config.js
pm2 logs
```

**Option 3: Platform-Specific Scripts**

Linux/Mac:
```bash
chmod +x Infrastructure/start-server.sh
./Infrastructure/start-server.sh
```

Windows PowerShell:
```powershell
.\Infrastructure\start-server.ps1
```

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

### Identify Intent
```
POST /api/identify-intent
Content-Type: application/json

{
  "message": "I want to book a flight to New York"
}
```

Returns intent classification with confidence score and extracted entities.

## Configuration

### Agent Configuration

Modify `Backend/agentConfig.js` to customize:
- Model parameters (temperature, maxTokens)
- Intent categories
- System prompts
- Timeout settings

### Frontend Configuration

Modify `config.js` to customize:
- API endpoints
- UI behavior
- Animation settings

## Development

### Adding New Intents

1. Update intent categories in `Backend/agentConfig.js`
2. Modify system prompts to include new intent types
3. Test with various user inputs

### Modifying Soul Buddy Animations

1. Create new GLTF/GLB animation files
2. Add them to the `Models/` directory
3. Update `soul-buddy-animator.js` to include new animation states
4. Update `index.html` to load new models

### Working Directory

During active development, place iterative files in the `Working/` directory. Move them to appropriate locations once finalized.

## Troubleshooting

### Server Won't Start
- Ensure Ollama is running: `ollama serve`
- Check if port 3000 is available
- Verify Node.js version: `node --version`

### Model Not Found
- Pull the model: `ollama pull llama3.2`
- Check Ollama is running: `ollama list`

### 3D Models Not Loading
- Ensure Models directory has all required .glb files
- Check browser console for loading errors
- Verify file paths in index.html

### CORS Errors
- CORS is enabled by default in server.js
- If issues persist, check your reverse proxy configuration

## Deployment

### Using Cloudflare Tunnel

```powershell
.\Infrastructure\start-with-tunnel.ps1
```

This will:
1. Start the Node.js server
2. Launch Cloudflare tunnel
3. Provide a public URL for access

### Production Considerations

- Use environment variables for sensitive configuration
- Enable HTTPS
- Implement rate limiting
- Add authentication if needed
- Monitor with PM2 or similar process manager

## Contributing

When contributing to this project:

1. Place new development files in the `Working/` directory
2. Follow the existing code structure and naming conventions
3. Test all changes locally before pushing
4. Document any new features or configuration options

## License

[Add your license information here]

## Credits

- **AI Model**: Llama 3.2 by Meta
- **3D Rendering**: Three.js
- **Agent Framework**: LangGraph by LangChain
- **Character Design**: Soul Buddy by Souloxy team

## Support

For issues, questions, or contributions, please open an issue on the GitHub repository.
