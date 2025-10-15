/**
 * Intent Agent Module
 *
 * This module implements a LangGraph-based agent for identifying and
 * classifying user intents. It uses a state graph approach to process
 * user messages and determine their underlying intent.
 */

const { StateGraph, END } = require('@langchain/langgraph');
const { ChatOllama } = require('@langchain/ollama');
const { HumanMessage, SystemMessage } = require('@langchain/core/messages');
const { getAgentConfig } = require('./agentConfig');

/**
 * State schema for the agent graph
 * Represents the data that flows through the agent's processing pipeline
 */
class AgentState {
  constructor() {
    this.userInput = '';
    this.messages = [];
    this.identifiedIntent = null;
    this.confidence = 0;
    this.entities = {};
    this.response = '';
    this.error = null;
  }
}

/**
 * Intent Agent Class
 *
 * Implements a stateful agent using LangGraph for intent identification
 * and classification. The agent processes user input through multiple
 * stages to determine intent and generate appropriate responses.
 */
class IntentAgent {
  /**
   * Initializes the Intent Agent with configuration and model
   */
  constructor() {
    const config = getAgentConfig();
    this.config = config;

    // Initialize the language model
    this.model = new ChatOllama({
      model: config.model.name,
      temperature: config.model.temperature,
      baseUrl: config.model.baseUrl,
    });

    // Build the agent graph
    this.graph = this.buildGraph();
  }

  /**
   * Processes user input node
   * Initializes the state with user input and system prompt
   *
   * @param {AgentState} state - Current agent state
   * @returns {AgentState} Updated state with messages
   */
  async processInput(state) {
    try {
      state.messages = [
        new SystemMessage(this.config.systemPrompt),
        new HumanMessage(state.userInput),
      ];
      return state;
    } catch (error) {
      state.error = `Error processing input: ${error.message}`;
      return state;
    }
  }

  /**
   * Identifies intent from user input
   * Uses the language model to analyze and classify the intent
   *
   * @param {AgentState} state - Current agent state
   * @returns {AgentState} Updated state with identified intent
   */
  async identifyIntent(state) {
    try {
      const intentPrompt = `Analyze the following user message and identify the primary intent.
Choose from these categories: ${this.config.intentCategories.join(', ')}.

User message: "${state.userInput}"

IMPORTANT: Respond ONLY with valid JSON. Do not include any text before or after the JSON object.

{
  "intent": "category_name",
  "confidence": 0.9,
  "entities": {}
}`;

      const messages = [
        ...state.messages,
        new HumanMessage(intentPrompt),
      ];

      const response = await this.model.invoke(messages);
      const content = response.content;

      // Try to parse the response to extract intent information
      // First, try to find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*?\}/);

      if (jsonMatch) {
        try {
          // Clean up the JSON string - remove any invalid characters
          let jsonString = jsonMatch[0];

          // Try to fix common JSON formatting issues
          jsonString = jsonString
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
            .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
            .replace(/\n/g, ' ') // Replace newlines with spaces
            .replace(/\r/g, '') // Remove carriage returns
            .trim();

          const intentData = JSON.parse(jsonString);
          state.identifiedIntent = intentData.intent || 'unknown';
          state.confidence = intentData.confidence || 0.5;
          state.entities = intentData.entities || {};
        } catch (parseError) {
          // If JSON parsing fails, try to extract intent using pattern matching
          const intentPattern = /"intent"\s*:\s*"([^"]+)"/;
          const confidencePattern = /"confidence"\s*:\s*([\d.]+)/;

          const intentMatch = content.match(intentPattern);
          const confidenceMatch = content.match(confidencePattern);

          state.identifiedIntent = intentMatch ? intentMatch[1] : 'unknown';
          state.confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.5;
          state.entities = {};
        }
      } else {
        // No JSON found, fallback to simple classification
        state.identifiedIntent = this.classifyIntentFallback(state.userInput);
        state.confidence = 0.6;
        state.entities = {};
      }

      return state;
    } catch (error) {
      state.error = `Error identifying intent: ${error.message}`;
      state.identifiedIntent = 'unknown';
      state.confidence = 0.0;
      return state;
    }
  }

  /**
   * Fallback method to classify intent using simple pattern matching
   * Used when JSON parsing fails
   *
   * @param {string} input - User input message
   * @returns {string} Classified intent
   */
  classifyIntentFallback(input) {
    const lowerInput = input.toLowerCase();

    // Simple pattern matching for common intents
    if (/^(hi|hello|hey|greetings|good morning|good afternoon)/i.test(lowerInput)) {
      return 'greeting';
    }
    if (/(what|when|where|why|how|who|which)/i.test(lowerInput) && lowerInput.includes('?')) {
      return 'question';
    }
    if (/(please|could you|can you|would you|schedule|book|create|add)/i.test(lowerInput)) {
      return 'command';
    }
    if (/(thanks|thank you|appreciate|grateful|bye|goodbye|see you)/i.test(lowerInput)) {
      return 'goodbye';
    }
    if (/(help|assist|support|clarify|explain)/i.test(lowerInput)) {
      return 'clarification';
    }
    if (/(tell me|what is|what are|show me|give me)/i.test(lowerInput)) {
      return 'information_request';
    }

    return 'unknown';
  }

  /**
   * Generates response based on identified intent
   * Creates an appropriate response for the user based on the classified intent
   *
   * @param {AgentState} state - Current agent state
   * @returns {AgentState} Updated state with generated response
   */
  async generateResponse(state) {
    try {
      const responsePrompt = `Based on the identified intent "${state.identifiedIntent}" with confidence ${state.confidence},
generate an appropriate response to the user's message: "${state.userInput}"

Provide a helpful, clear, and concise response.`;

      const messages = [
        ...state.messages,
        new HumanMessage(responsePrompt),
      ];

      const response = await this.model.invoke(messages);
      state.response = response.content;

      return state;
    } catch (error) {
      state.error = `Error generating response: ${error.message}`;
      state.response = 'I apologize, but I encountered an error processing your request.';
      return state;
    }
  }

  /**
   * Builds the agent's state graph
   * Defines the flow of processing through different nodes
   *
   * @returns {CompiledGraph} Compiled state graph ready for execution
   */
  buildGraph() {
    const workflow = new StateGraph({
      channels: {
        userInput: null,
        messages: null,
        identifiedIntent: null,
        confidence: null,
        entities: null,
        response: null,
        error: null,
      },
    });

    // Add nodes to the graph
    workflow.addNode('processInput', this.processInput.bind(this));
    workflow.addNode('identifyIntent', this.identifyIntent.bind(this));
    workflow.addNode('generateResponse', this.generateResponse.bind(this));

    // Define the flow
    workflow.setEntryPoint('processInput');
    workflow.addEdge('processInput', 'identifyIntent');
    workflow.addEdge('identifyIntent', 'generateResponse');
    workflow.addEdge('generateResponse', END);

    return workflow.compile();
  }

  /**
   * Processes a user message through the agent pipeline
   *
   * @param {string} userInput - The user's input message
   * @returns {Promise<Object>} Object containing intent, confidence, entities, and response
   */
  async processMessage(userInput) {
    const initialState = new AgentState();
    initialState.userInput = userInput;

    const result = await this.graph.invoke(initialState);

    return {
      intent: result.identifiedIntent,
      confidence: result.confidence,
      entities: result.entities,
      response: result.response,
      error: result.error,
    };
  }
}

module.exports = { IntentAgent, AgentState };
