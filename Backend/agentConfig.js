/**
 * Agent Configuration Module
 *
 * This module provides configuration settings for the LangGraph agent,
 * including model settings, system prompts, and agent behavior parameters.
 */

require('dotenv').config();

/**
 * Agent configuration object containing all settings for agent initialization
 * and operation.
 */
const agentConfig = {
  // Model configuration
  model: {
    name: 'llama3.2',
    temperature: 0.7,
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
  },

  // System prompt for the agent
  systemPrompt: `You are a helpful AI assistant designed to identify and classify user intents.
Your primary responsibilities are:
1. Analyze user input to determine their underlying intent
2. Classify intents into appropriate categories
3. Extract relevant entities and parameters from user messages
4. Provide clear and actionable responses based on identified intents

Always be clear, concise, and helpful in your responses.`,

  // Agent behavior settings
  behavior: {
    maxIterations: 10,
    verboseLogging: process.env.NODE_ENV === 'development',
    enableMemory: true,
  },

  // Intent categories for classification
  intentCategories: [
    'greeting',
    'question',
    'command',
    'information_request',
    'clarification',
    'feedback',
    'goodbye',
    'unknown',
  ],
};

/**
 * Validates that all required environment variables are set
 * @throws {Error} If required environment variables are missing
 */
function validateEnvironment() {
  // Ollama typically runs locally, so no API key is required
  // Only validate if using a custom base URL that requires authentication
  if (process.env.OLLAMA_API_KEY) {
    // Optional: validate API key if provided
    return;
  }
  // No required environment variables for local Ollama
}

/**
 * Gets the agent configuration with validated environment
 * @returns {Object} The agent configuration object
 * @throws {Error} If environment validation fails
 */
function getAgentConfig() {
  validateEnvironment();
  return agentConfig;
}

module.exports = {
  agentConfig,
  getAgentConfig,
  validateEnvironment,
};
