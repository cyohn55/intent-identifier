/**
 * Intent Identifier Chat Interface
 * Frontend application for real-time intent classification
 */

// State Management
const state = {
    messageCount: 0,
    isProcessing: false,
    lastIntent: null
};

// DOM Elements
const elements = {
    chatMessages: document.getElementById('chatMessages'),
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendMessage'),
    clearBtn: document.getElementById('clearChat'),
    sendBtnText: document.getElementById('sendBtnText'),
    sendBtnLoader: document.getElementById('sendBtnLoader'),
    intentDisplay: document.getElementById('intentDisplay'),
    intentSummary: document.getElementById('intentSummary'),
    intentType: document.getElementById('intentType'),
    intentConfidence: document.getElementById('intentConfidence'),
    intentEntities: document.getElementById('intentEntities'),
    confidenceBadge: document.getElementById('confidenceBadge'),
    statusDot: document.getElementById('statusDot'),
    statusText: document.getElementById('statusText'),
    messageCount: document.getElementById('messageCount')
};

// Configuration
const config = {
    // In a production environment, this would point to your backend API
    // For now, we'll use the intent-identifier directly
    useLocalIntentAgent: true,
    apiEndpoint: 'http://localhost:3000/api/classify' // placeholder
};

// Initialize the application
async function initialize() {
    console.log('Initializing Intent Identifier Chat Interface...');

    // Set up event listeners
    setupEventListeners();

    // Check if we can use the local intent agent
    await checkConnection();

    // Load IntentAgent if available
    if (config.useLocalIntentAgent) {
        await loadIntentAgent();
    }
}

// Set up event listeners
function setupEventListeners() {
    // Send message on button click
    elements.sendBtn.addEventListener('click', handleSendMessage);

    // Send message on Enter key (Shift+Enter for new line)
    elements.messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    // Clear chat button
    elements.clearBtn.addEventListener('click', clearChat);

    // Auto-resize textarea
    elements.messageInput.addEventListener('input', autoResizeTextarea);
}

// Auto-resize textarea based on content
function autoResizeTextarea() {
    const textarea = elements.messageInput;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
}

// Check connection to backend/local service
async function checkConnection() {
    try {
        // Try to connect to the local server API
        const response = await fetch(`${config.apiEndpoint.replace('/classify', '/health')}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateStatus('connected', `Connected to ${data.service}`);
            config.useLocalIntentAgent = false; // Use API instead of mock
            return true;
        } else {
            throw new Error('API not available');
        }
    } catch (error) {
        console.log('API not available, using mock classification');
        updateStatus('connected', 'Demo Mode (Mock Classification)');
        config.useLocalIntentAgent = true; // Fallback to mock
        return false;
    }
}

// Load the Intent Agent (when running locally)
async function loadIntentAgent() {
    try {
        // Note: This requires running in a Node.js environment
        // For browser-only deployment, you'll need a backend API
        console.log('Intent Agent would be loaded here in a Node.js environment');
        console.log('For GitHub Pages, this will use a mock implementation');

        // Set status to indicate we're using browser-only mode
        updateStatus('connected', 'Browser Mode (Demo)');
    } catch (error) {
        console.error('Failed to load Intent Agent:', error);
        updateStatus('disconnected', 'Failed to load agent');
    }
}

// Handle sending a message
async function handleSendMessage() {
    const message = elements.messageInput.value.trim();

    if (!message || state.isProcessing) {
        return;
    }

    // Update state
    state.isProcessing = true;
    state.messageCount++;

    // Update UI
    updateMessageCount();
    disableSendButton(true);

    // Add user message to chat
    addMessageToChat(message, 'user');

    // Clear input
    elements.messageInput.value = '';
    autoResizeTextarea();

    try {
        // Process message and get intent
        const intentResult = await processMessageWithIntent(message);

        // Display intent in JSON panel
        displayIntent(intentResult);

        // Add bot response to chat
        if (intentResult.response) {
            addMessageToChat(intentResult.response, 'bot');
        }

    } catch (error) {
        console.error('Error processing message:', error);
        addErrorMessage('Failed to process message. Please try again.');
        displayError(error);
    } finally {
        state.isProcessing = false;
        disableSendButton(false);
    }
}

// Process message and get intent classification
async function processMessageWithIntent(message) {
    // If API is available, use it
    if (!config.useLocalIntentAgent) {
        try {
            const response = await fetch(config.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API call failed, falling back to mock classification:', error);
            config.useLocalIntentAgent = true; // Fallback to mock for future calls
            updateStatus('connected', 'Demo Mode (API Failed)');
        }
    }

    // Fallback: Mock classification for browser environment
    await sleep(500); // Simulate processing delay
    return mockIntentClassification(message);
}

// Mock intent classification (for browser-only deployment)
function mockIntentClassification(message) {
    const lowerMessage = message.toLowerCase();

    let intent = 'unknown';
    let confidence = 0.5;
    let entities = {};
    let response = '';

    // Simple pattern matching
    if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/i.test(lowerMessage)) {
        intent = 'greeting';
        confidence = 0.92;
        response = 'Hello! How can I assist you today?';
    } else if (/(what|when|where|why|how|who|which)/i.test(lowerMessage) && lowerMessage.includes('?')) {
        intent = 'question';
        confidence = 0.88;
        response = 'That\'s an interesting question. Let me help you with that.';
    } else if (/(please|could you|can you|would you|schedule|book|create|add)/i.test(lowerMessage)) {
        intent = 'command';
        confidence = 0.85;
        response = 'I understand you want me to perform an action. I\'ll help you with that.';
    } else if (/(thanks|thank you|appreciate|grateful|bye|goodbye|see you|farewell)/i.test(lowerMessage)) {
        intent = 'goodbye';
        confidence = 0.90;
        response = 'You\'re welcome! Feel free to come back anytime.';
    } else if (/(help|assist|support|clarify|explain)/i.test(lowerMessage)) {
        intent = 'clarification';
        confidence = 0.87;
        response = 'I\'m here to help clarify things for you. What would you like to know more about?';
    } else if (/(tell me|what is|what are|show me|give me|information about)/i.test(lowerMessage)) {
        intent = 'information_request';
        confidence = 0.86;
        response = 'I\'ll provide you with the information you\'re looking for.';
    } else if (/(good|great|excellent|bad|poor|terrible|feedback|opinion)/i.test(lowerMessage)) {
        intent = 'feedback';
        confidence = 0.84;
        response = 'Thank you for your feedback! I appreciate your input.';
    } else {
        intent = 'unknown';
        confidence = 0.65;
        response = 'I\'m not entirely sure what you mean, but I\'m here to help. Could you rephrase that?';
    }

    // Extract simple entities (this is very basic)
    if (lowerMessage.includes('tomorrow') || lowerMessage.includes('today') || lowerMessage.includes('yesterday')) {
        entities.time_reference = lowerMessage.match(/(tomorrow|today|yesterday)/i)[0];
    }

    return {
        intent,
        confidence,
        entities,
        response,
        error: null
    };
}

// Add message to chat display
function addMessageToChat(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = text;

    elements.chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

// Add error message to chat
function addErrorMessage(text) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = text;

    elements.chatMessages.appendChild(errorDiv);
    scrollToBottom();
}

// Display intent in JSON panel
function displayIntent(intentResult) {
    // Remove placeholder if it exists
    const placeholder = elements.intentDisplay.querySelector('.placeholder-message');
    if (placeholder) {
        placeholder.remove();
    }

    // Format JSON with proper indentation
    const intentJSON = JSON.stringify({
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        entities: intentResult.entities,
        error: intentResult.error
    }, null, 2);

    // Display in JSON panel
    const jsonDiv = document.createElement('pre');
    jsonDiv.className = 'intent-json';
    jsonDiv.textContent = intentJSON;

    elements.intentDisplay.innerHTML = '';
    elements.intentDisplay.appendChild(jsonDiv);

    // Update summary section
    updateIntentSummary(intentResult);

    // Store last intent
    state.lastIntent = intentResult;
}

// Update intent summary section
function updateIntentSummary(intentResult) {
    elements.intentSummary.style.display = 'block';
    elements.intentType.textContent = intentResult.intent;
    elements.intentConfidence.textContent = `${(intentResult.confidence * 100).toFixed(1)}%`;

    // Format entities
    const entitiesCount = Object.keys(intentResult.entities).length;
    if (entitiesCount > 0) {
        elements.intentEntities.textContent = JSON.stringify(intentResult.entities);
    } else {
        elements.intentEntities.textContent = 'None detected';
    }

    // Update confidence badge
    updateConfidenceBadge(intentResult.confidence);
}

// Update confidence badge
function updateConfidenceBadge(confidence) {
    elements.confidenceBadge.style.display = 'inline-block';
    elements.confidenceBadge.textContent = `${(confidence * 100).toFixed(0)}%`;

    // Remove previous confidence classes
    elements.confidenceBadge.classList.remove('confidence-low', 'confidence-medium', 'confidence-high');

    // Add appropriate class based on confidence level
    if (confidence < 0.6) {
        elements.confidenceBadge.classList.add('confidence-low');
    } else if (confidence < 0.8) {
        elements.confidenceBadge.classList.add('confidence-medium');
    } else {
        elements.confidenceBadge.classList.add('confidence-high');
    }
}

// Display error in intent panel
function displayError(error) {
    const errorJSON = JSON.stringify({
        error: error.message || 'Unknown error occurred',
        timestamp: new Date().toISOString()
    }, null, 2);

    const errorDiv = document.createElement('pre');
    errorDiv.className = 'intent-json';
    errorDiv.style.color = '#ff4757';
    errorDiv.textContent = errorJSON;

    elements.intentDisplay.innerHTML = '';
    elements.intentDisplay.appendChild(errorDiv);
}

// Clear chat
function clearChat() {
    // Keep system message, remove others
    const systemMessage = elements.chatMessages.querySelector('.system-message');
    elements.chatMessages.innerHTML = '';
    if (systemMessage) {
        elements.chatMessages.appendChild(systemMessage);
    }

    // Reset intent display
    elements.intentDisplay.innerHTML = '<div class="placeholder-message">Intent analysis will appear here after you send a message</div>';
    elements.intentSummary.style.display = 'none';
    elements.confidenceBadge.style.display = 'none';

    // Reset state
    state.messageCount = 0;
    state.lastIntent = null;
    updateMessageCount();
}

// Update status indicator
function updateStatus(status, message) {
    elements.statusDot.className = `status-dot ${status}`;
    elements.statusText.textContent = message;
}

// Update message count
function updateMessageCount() {
    elements.messageCount.textContent = `Messages: ${state.messageCount}`;
}

// Disable/enable send button
function disableSendButton(disabled) {
    elements.sendBtn.disabled = disabled;

    if (disabled) {
        elements.sendBtnText.style.display = 'none';
        elements.sendBtnLoader.style.display = 'inline-block';
    } else {
        elements.sendBtnText.style.display = 'inline';
        elements.sendBtnLoader.style.display = 'none';
    }
}

// Scroll chat to bottom
function scrollToBottom() {
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// Utility: Sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initialize);

// Export for potential use in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        processMessageWithIntent,
        mockIntentClassification
    };
}
