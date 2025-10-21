/**
 * Intent Identifier - Backend Server
 *
 * This Node.js server provides HTTP endpoints for the frontend to communicate
 * with the IntentAgent. It bridges the browser-based frontend with the
 * Node.js-based intent classification system.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import the IntentAgent from the Working directory
const { IntentAgent } = require('../Working/intentAgent');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for frontend requests
app.use(express.json()); // Parse JSON request bodies
app.use(express.static(__dirname)); // Serve static files from Frontend directory
app.use('/Models', express.static(path.join(__dirname, '../Models'))); // Serve Models directory
app.use('/Working', express.static(path.join(__dirname, '../Working'))); // Serve Working directory

// Initialize IntentAgent
let agent;

try {
    agent = new IntentAgent();
    console.log('✓ IntentAgent initialized successfully');
} catch (error) {
    console.error('✗ Failed to initialize IntentAgent:', error.message);
    process.exit(1);
}

// Routes

/**
 * Health check endpoint
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'Intent Identifier Server',
        timestamp: new Date().toISOString(),
        agentStatus: agent ? 'ready' : 'unavailable'
    });
});

/**
 * Intent classification endpoint
 * POST /api/classify
 * Body: { "message": "user input text" }
 */
app.post('/api/classify', async (req, res) => {
    try {
        const { message } = req.body;

        // Validate input
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                error: 'Invalid input',
                message: 'Message field is required and must be a non-empty string'
            });
        }

        // Check message length
        if (message.length > 1000) {
            return res.status(400).json({
                error: 'Message too long',
                message: 'Message must be 1000 characters or less'
            });
        }

        console.log(`Processing message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);

        // Process message with IntentAgent
        const startTime = Date.now();
        const result = await agent.processMessage(message);
        const processingTime = Date.now() - startTime;

        console.log(`✓ Intent classified: ${result.intent} (${(result.confidence * 100).toFixed(1)}%) in ${processingTime}ms`);

        // Return result with metadata
        res.json({
            ...result,
            metadata: {
                processingTime,
                timestamp: new Date().toISOString(),
                model: 'llama3.2'
            }
        });

    } catch (error) {
        console.error('Error processing message:', error);

        res.status(500).json({
            error: 'Processing failed',
            message: error.message,
            intent: 'unknown',
            confidence: 0,
            entities: {},
            response: 'I apologize, but I encountered an error processing your message. Please try again.'
        });
    }
});

/**
 * Get intent categories
 * GET /api/categories
 */
app.get('/api/categories', (req, res) => {
    try {
        const categories = agent.config.intentCategories;
        res.json({
            categories,
            count: categories.length
        });
    } catch (error) {
        res.status(500).json({
            error: 'Failed to retrieve categories',
            message: error.message
        });
    }
});

/**
 * Batch classification endpoint
 * POST /api/classify-batch
 * Body: { "messages": ["msg1", "msg2", ...] }
 */
app.post('/api/classify-batch', async (req, res) => {
    try {
        const { messages } = req.body;

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                error: 'Invalid input',
                message: 'Messages field is required and must be a non-empty array'
            });
        }

        if (messages.length > 10) {
            return res.status(400).json({
                error: 'Too many messages',
                message: 'Maximum 10 messages per batch request'
            });
        }

        console.log(`Processing batch of ${messages.length} messages`);

        // Process all messages
        const results = await Promise.all(
            messages.map(async (message) => {
                try {
                    return await agent.processMessage(message);
                } catch (error) {
                    return {
                        intent: 'unknown',
                        confidence: 0,
                        entities: {},
                        response: 'Error processing message',
                        error: error.message
                    };
                }
            })
        );

        res.json({
            results,
            count: results.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Error processing batch:', error);
        res.status(500).json({
            error: 'Batch processing failed',
            message: error.message
        });
    }
});

/**
 * Root endpoint - serve the frontend
 * GET /
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not found',
        message: `Route ${req.method} ${req.path} not found`
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  Intent Identifier Server');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  Server running on: http://localhost:${PORT}`);
    console.log(`  API endpoint:      http://localhost:${PORT}/api/classify`);
    console.log(`  Health check:      http://localhost:${PORT}/api/health`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
    console.log('Available endpoints:');
    console.log('  GET  /                      - Frontend interface');
    console.log('  GET  /api/health            - Health check');
    console.log('  GET  /api/categories        - Get intent categories');
    console.log('  POST /api/classify          - Classify single message');
    console.log('  POST /api/classify-batch    - Classify multiple messages');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
    console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM signal. Shutting down gracefully...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\nReceived SIGINT signal. Shutting down gracefully...');
    process.exit(0);
});

module.exports = app;
