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

// Configuration - uses external config.js
const config = {
    get apiEndpoint() {
        return window.API_CONFIG ? window.API_CONFIG.CLASSIFY_ENDPOINT : 'http://localhost:3000/api/classify';
    },
    get healthEndpoint() {
        return window.API_CONFIG ? window.API_CONFIG.HEALTH_ENDPOINT : 'http://localhost:3000/api/health';
    }
};

// Initialize the application
async function initialize() {
    console.log('Initializing Intent Identifier Chat Interface...');
    console.log('Backend API URL:', config.apiEndpoint);

    // Set up event listeners
    setupEventListeners();

    // Check backend connection
    await checkConnection();
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

// Check connection to backend API
async function checkConnection() {
    try {
        const response = await fetch(config.healthEndpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            updateStatus('connected', `Connected to ${data.service}`);
            console.log('✓ Backend connected:', data);
            return true;
        } else {
            throw new Error('API returned error status');
        }
    } catch (error) {
        console.error('✗ Backend connection failed:', error.message);
        updateStatus('disconnected', 'Backend Unavailable - Please start server');
        addErrorMessage('Cannot connect to backend server. Please ensure the server is running at: ' + config.apiEndpoint);
        return false;
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
    try {
        const response = await fetch(config.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            throw new Error(`Backend returned status ${response.status}`);
        }

        const data = await response.json();
        console.log('✓ Intent classified:', data);
        return data;
    } catch (error) {
        console.error('✗ API call failed:', error);
        updateStatus('disconnected', 'Backend Error');

        throw new Error(`Failed to connect to backend at ${config.apiEndpoint}. ${error.message}`);
    }
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
