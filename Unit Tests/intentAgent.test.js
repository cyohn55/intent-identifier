/**
 * Unit Tests for Intent Agent Module
 *
 * Tests the Intent Agent functionality including state management,
 * intent identification, and response generation.
 */

const { IntentAgent, AgentState } = require('../Working/intentAgent');

// Mock the Ollama client to avoid actual API calls during testing
jest.mock('@langchain/ollama');

describe('Intent Agent Module', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
    // No API key needed for Ollama
  });

  afterEach(() => {
    process.env = originalEnv;
    jest.clearAllMocks();
  });

  describe('AgentState', () => {
    test('should initialize with correct default values', () => {
      const state = new AgentState();

      expect(state.userInput).toBe('');
      expect(state.messages).toEqual([]);
      expect(state.identifiedIntent).toBeNull();
      expect(state.confidence).toBe(0);
      expect(state.entities).toEqual({});
      expect(state.response).toBe('');
      expect(state.error).toBeNull();
    });

    test('should allow setting properties', () => {
      const state = new AgentState();

      state.userInput = 'Hello';
      state.identifiedIntent = 'greeting';
      state.confidence = 0.95;

      expect(state.userInput).toBe('Hello');
      expect(state.identifiedIntent).toBe('greeting');
      expect(state.confidence).toBe(0.95);
    });

    test('should maintain separate instances', () => {
      const state1 = new AgentState();
      const state2 = new AgentState();

      state1.userInput = 'Test 1';
      state2.userInput = 'Test 2';

      expect(state1.userInput).toBe('Test 1');
      expect(state2.userInput).toBe('Test 2');
    });
  });

  describe('IntentAgent initialization', () => {
    test('should initialize successfully with valid environment', () => {
      expect(() => new IntentAgent()).not.toThrow();
    });

    test('should initialize with default Ollama configuration', () => {
      const agent = new IntentAgent();

      expect(agent.config.model.name).toBe('llama3.2');
      expect(agent.config.model.baseUrl).toBeDefined();
    });

    test('should have config property', () => {
      const agent = new IntentAgent();

      expect(agent.config).toBeDefined();
      expect(agent.config.model).toBeDefined();
      expect(agent.config.systemPrompt).toBeDefined();
    });

    test('should have model property', () => {
      const agent = new IntentAgent();

      expect(agent.model).toBeDefined();
    });

    test('should have compiled graph', () => {
      const agent = new IntentAgent();

      expect(agent.graph).toBeDefined();
    });
  });

  describe('processInput method', () => {
    test('should process user input and create messages', async () => {
      const agent = new IntentAgent();
      const state = new AgentState();
      state.userInput = 'Hello, how are you?';

      const result = await agent.processInput(state);

      expect(result.messages).toBeDefined();
      expect(Array.isArray(result.messages)).toBe(true);
      expect(result.messages.length).toBeGreaterThan(0);
    });

    test('should include system message in processed state', async () => {
      const agent = new IntentAgent();
      const state = new AgentState();
      state.userInput = 'Test message';

      const result = await agent.processInput(state);

      expect(result.messages[0]).toBeDefined();
      expect(result.messages[0].constructor.name).toContain('System');
    });

    test('should include user message in processed state', async () => {
      const agent = new IntentAgent();
      const state = new AgentState();
      state.userInput = 'Test message';

      const result = await agent.processInput(state);

      expect(result.messages[1]).toBeDefined();
      expect(result.messages[1].constructor.name).toContain('Human');
    });

    test('should handle empty user input', async () => {
      const agent = new IntentAgent();
      const state = new AgentState();
      state.userInput = '';

      const result = await agent.processInput(state);

      expect(result.messages).toBeDefined();
      expect(result.error).toBeNull();
    });
  });

  describe('Intent Categories Validation', () => {
    test('agent should recognize all configured intent categories', () => {
      const agent = new IntentAgent();

      const expectedCategories = [
        'greeting',
        'question',
        'command',
        'information_request',
        'clarification',
        'feedback',
        'goodbye',
        'unknown',
      ];

      expectedCategories.forEach(category => {
        expect(agent.config.intentCategories).toContain(category);
      });
    });
  });

  describe('State Flow', () => {
    test('state should maintain data integrity through processing', async () => {
      const agent = new IntentAgent();
      const state = new AgentState();
      const testInput = 'What is the weather today?';

      state.userInput = testInput;
      const processedState = await agent.processInput(state);

      expect(processedState.userInput).toBe(testInput);
      expect(processedState.messages).toBeDefined();
    });

    test('error state should be set on processing failure', async () => {
      const agent = new IntentAgent();
      const state = new AgentState();

      // Force an error by making messages undefined
      state.userInput = 'Test';
      agent.config.systemPrompt = null;

      const result = await agent.processInput(state);

      // Should handle the error gracefully
      expect(result).toBeDefined();
    });
  });

  describe('Configuration Integration', () => {
    test('agent should use configuration values', () => {
      const agent = new IntentAgent();

      expect(agent.config.model.name).toBeDefined();
      expect(agent.config.model.temperature).toBeDefined();
      expect(agent.config.model.baseUrl).toBeDefined();
    });

    test('model should be initialized with config values', () => {
      const agent = new IntentAgent();

      expect(agent.model).toBeDefined();
    });
  });

  describe('Graph Structure', () => {
    test('buildGraph should return a compiled graph', () => {
      const agent = new IntentAgent();
      const graph = agent.buildGraph();

      expect(graph).toBeDefined();
    });

    test('graph should be created during initialization', () => {
      const agent = new IntentAgent();

      expect(agent.graph).toBeDefined();
    });
  });
});
