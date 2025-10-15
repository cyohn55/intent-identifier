# Intent Identifier - Frontend Interface

A web-based chat interface for real-time intent classification using Llama 3.2 via Ollama.

## Features

- **Split-panel interface**: Chat on the left, JSON intent display on the right
- **Real-time intent classification**: See intent, confidence, and entities as you chat
- **Confidence indicators**: Visual badges showing classification confidence (Low/Medium/High)
- **Intent categories**: Supports 8 different intent types
  - greeting
  - question
  - command
  - information_request
  - clarification
  - feedback
  - goodbye
  - unknown
- **Responsive design**: Works on desktop and mobile devices
- **Clean, modern UI**: Professional gradient design with smooth animations

## Project Structure

```
Frontend/
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── app.js              # Client-side JavaScript logic
├── server.js           # Node.js server for IntentAgent integration
└── README.md           # This file
```

## Deployment Options

### Option 1: GitHub Pages (Static Demo)

For quick deployment to GitHub Pages with mock intent classification:

1. Push the Frontend folder to your GitHub repository
2. Enable GitHub Pages in repository settings
3. Select the `Frontend` folder as the source
4. Visit `https://<username>.github.io/<repo-name>/`

**Note**: GitHub Pages version uses mock classification since it's static hosting. For real Ollama integration, use Option 2.

### Option 2: Local Server with Ollama Integration

For full functionality with actual Llama 3.2 intent classification:

1. **Ensure Ollama is running**:
   ```bash
   ollama serve
   ollama pull llama3.2
   ```

2. **Install dependencies**:
   ```bash
   cd Frontend
   npm install express cors
   ```

3. **Start the local server**:
   ```bash
   node server.js
   ```

4. **Open in browser**:
   ```
   http://localhost:3000
   ```

### Option 3: Node.js Backend with API

For production deployment with a backend API:

1. Set up a Node.js/Express backend
2. Expose the IntentAgent as a REST API endpoint
3. Update `app.js` config to point to your API
4. Deploy frontend to any static hosting service
5. Deploy backend to Heroku, Railway, or similar

## Usage

1. **Type a message** in the chat input on the left panel
2. **Press Send** or hit Enter to process the message
3. **View intent analysis** in the right panel showing:
   - Full JSON response with intent, confidence, and entities
   - Summary section with key metrics
   - Confidence badge with color coding
4. **See bot response** in the chat window
5. **Clear chat** button to start a new conversation

## Configuration

Edit `app.js` to configure behavior:

```javascript
const config = {
    useLocalIntentAgent: true,  // Use local agent or API
    apiEndpoint: 'http://localhost:3000/api/classify'  // API endpoint
};
```

## Integration with IntentAgent

The frontend is designed to work with the IntentAgent module located in `../Working/intentAgent.js`.

### Browser Mode (Default)
Uses mock classification for demonstration purposes.

### Server Mode (Recommended)
Run `server.js` to create an HTTP server that bridges the frontend with the actual IntentAgent.

```javascript
// server.js creates an endpoint that the frontend calls
POST /api/classify
Request: { "message": "user input" }
Response: { "intent", "confidence", "entities", "response" }
```

## Customization

### Styling
Edit `styles.css` to change:
- Color scheme (gradient colors)
- Font styles
- Layout dimensions
- Animation timing

### Intent Categories
Update in both:
- `Working/agentConfig.js` (backend)
- `app.js` mockIntentClassification() (frontend fallback)

### Response Generation
Modify the response logic in:
- `Working/intentAgent.js` for real responses
- `app.js` mockIntentClassification() for demo responses

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Responsive design supported

## Performance

- Mock classification: ~500ms response time
- Real Ollama classification: ~2-5 seconds (depends on hardware)
- Supports multiple concurrent users
- Lightweight: ~100KB total assets

## Security Considerations

For production deployment:
- Add input sanitization
- Implement rate limiting
- Add authentication if needed
- Use HTTPS
- Validate all user inputs
- Add CORS configuration

## Troubleshooting

### "Connection failed" status
- Ensure Ollama is running: `ollama serve`
- Check if port 3000 is available
- Verify IntentAgent dependencies are installed

### Intent classification not working
- In browser mode, uses mock classification (expected)
- For real classification, run `server.js`
- Check console for error messages

### Styling issues
- Clear browser cache
- Ensure `styles.css` is in same directory
- Check browser console for 404 errors

## Future Enhancements

Potential improvements:
- [ ] Real-time streaming responses
- [ ] Conversation history persistence
- [ ] Export conversation as JSON/PDF
- [ ] Multiple language support
- [ ] Voice input integration
- [ ] Intent confidence visualization graphs
- [ ] User authentication
- [ ] Multi-user chat sessions
- [ ] Intent statistics dashboard

## License

ISC

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues or questions:
- Check the main README.md in the project root
- Review the IntentAgent documentation
- Check Ollama documentation for LLM issues
