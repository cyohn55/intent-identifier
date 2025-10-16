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
    this.reasoning = '';
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

Extract any relevant entities from the message. Entities are specific pieces of information like:
- dates/times (e.g., "tomorrow", "3pm", "next week")
- locations (e.g., "New York", "home", "office")
- people (e.g., names, pronouns with context)
- topics/subjects (e.g., "machine learning", "budget report")
- actions (e.g., "schedule", "book", "create")
- items/objects (e.g., "meeting", "flight", "document")
- quantities (e.g., numbers, amounts, durations)
- emotions/sentiments (e.g., "happy", "frustrated", "excited")

IMPORTANT: Respond ONLY with valid JSON. Do not include any text before or after the JSON object.

{
  "intent": "category_name",
  "confidence": 0.9,
  "entities": {
    "entity_type": "extracted_value"
  }
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
   * @returns {AgentState} Updated state with generated response and reasoning
   */
  async generateResponse(state) {
    try {
      // First, generate structured reasoning about the classification
      const reasoningPrompt = `Analyze this intent classification decision:

User Message: "${state.userInput}"
Identified Intent: "${state.identifiedIntent}"
Confidence Score: ${state.confidence}

Provide your analysis in the following format. Respond ONLY with valid JSON:

{
  "message_analysis": {
    "key_phrases": ["list", "of", "key", "phrases"],
    "user_goal": "brief description of user's primary goal"
  },
  "intent_justification": {
    "why_this_intent": "explanation of why this intent was chosen",
    "confidence_factors": ["factor 1", "factor 2", "factor 3"]
  },
  "response_strategy": {
    "approach": "how to respond to this intent",
    "user_expectation": "what the user expects"
  }
}`;

      const reasoningMessages = [
        ...state.messages,
        new HumanMessage(reasoningPrompt),
      ];

      const reasoningResponse = await this.model.invoke(reasoningMessages);

      // Try to parse the reasoning as JSON
      try {
        const content = reasoningResponse.content.trim();
        const jsonMatch = content.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
          let jsonString = jsonMatch[0]
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
            .replace(/,(\s*[}\]])/g, '$1')
            .trim();

          state.reasoning = JSON.parse(jsonString);
        } else {
          // Fallback to plain text if JSON parsing fails
          state.reasoning = {
            message_analysis: { key_phrases: [], user_goal: "Could not parse reasoning" },
            intent_justification: { why_this_intent: content, confidence_factors: [] },
            response_strategy: { approach: "Direct response", user_expectation: "Helpful answer" }
          };
        }
      } catch (parseError) {
        // If JSON parsing fails completely, use a simple structure
        state.reasoning = {
          message_analysis: { key_phrases: [], user_goal: state.userInput },
          intent_justification: { why_this_intent: `Classified as ${state.identifiedIntent}`, confidence_factors: [`Confidence: ${state.confidence}`] },
          response_strategy: { approach: "Direct response", user_expectation: "Helpful answer" }
        };
      }

      // Then, generate a clean user-facing response
      const responsePrompt = `User message: "${state.userInput}"
Identified intent: "${state.identifiedIntent}"

IMPORTANT: Respond directly to the user's message. Do NOT explain your classification process, do NOT mention the intent, and do NOT include any meta-commentary. Just provide a natural, helpful response to what the user said.

Your response:`;

      const responseMessages = [
        ...state.messages,
        new HumanMessage(responsePrompt),
      ];

      const response = await this.model.invoke(responseMessages);
      state.response = response.content.trim();

      return state;
    } catch (error) {
      state.error = `Error generating response: ${error.message}`;
      state.response = 'I apologize, but I encountered an error processing your request.';
      state.reasoning = {
        message_analysis: { key_phrases: [], user_goal: "Error occurred" },
        intent_justification: { why_this_intent: error.message, confidence_factors: [] },
        response_strategy: { approach: "Error recovery", user_expectation: "Error message" }
      };
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
        reasoning: null,
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
   * @returns {Promise<Object>} Object containing intent, confidence, entities, response, and reasoning
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
      reasoning: result.reasoning,
      error: result.error,
    };
  }
}

module.exports = { IntentAgent, AgentState };
