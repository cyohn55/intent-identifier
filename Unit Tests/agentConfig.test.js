/**
 * Unit Tests for Agent Configuration Module
 *
 * Tests the configuration management, environment validation,
 * and configuration retrieval functions.
 */

const {
  agentConfig,
  getAgentConfig,
  validateEnvironment,
} = require('../Working/agentConfig');

describe('Agent Configuration Module', () => {
  // Store original environment variables
  let originalEnv;

  beforeEach(() => {
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('agentConfig object', () => {
    test('should have valid model configuration', () => {
      expect(agentConfig.model).toBeDefined();
      expect(agentConfig.model.name).toBe('llama3.2');
      expect(agentConfig.model.temperature).toBeGreaterThanOrEqual(0);
      expect(agentConfig.model.temperature).toBeLessThanOrEqual(1);
      expect(agentConfig.model.baseUrl).toBeDefined();
    });

    test('should have a defined system prompt', () => {
      expect(agentConfig.systemPrompt).toBeDefined();
      expect(typeof agentConfig.systemPrompt).toBe('string');
      expect(agentConfig.systemPrompt.length).toBeGreaterThan(0);
    });

    test('should have valid behavior settings', () => {
      expect(agentConfig.behavior).toBeDefined();
      expect(agentConfig.behavior.maxIterations).toBeGreaterThan(0);
      expect(typeof agentConfig.behavior.verboseLogging).toBe('boolean');
      expect(typeof agentConfig.behavior.enableMemory).toBe('boolean');
    });

    test('should have defined intent categories', () => {
      expect(agentConfig.intentCategories).toBeDefined();
      expect(Array.isArray(agentConfig.intentCategories)).toBe(true);
      expect(agentConfig.intentCategories.length).toBeGreaterThan(0);
    });

    test('intent categories should include expected values', () => {
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
        expect(agentConfig.intentCategories).toContain(category);
      });
    });
  });

  describe('validateEnvironment', () => {
    test('should not throw error with default Ollama configuration', () => {
      expect(() => validateEnvironment()).not.toThrow();
    });

    test('should not throw error when OLLAMA_API_KEY is set', () => {
      process.env.OLLAMA_API_KEY = 'test-api-key';

      expect(() => validateEnvironment()).not.toThrow();
    });

    test('should handle optional environment variables gracefully', () => {
      delete process.env.OLLAMA_API_KEY;
      delete process.env.OLLAMA_BASE_URL;

      expect(() => validateEnvironment()).not.toThrow();
    });
  });

  describe('getAgentConfig', () => {
    test('should return config with default environment', () => {
      const config = getAgentConfig();

      expect(config).toBeDefined();
      expect(config.model).toBeDefined();
      expect(config.systemPrompt).toBeDefined();
      expect(config.behavior).toBeDefined();
      expect(config.intentCategories).toBeDefined();
    });

    test('should work without required environment variables', () => {
      delete process.env.OLLAMA_API_KEY;
      delete process.env.OLLAMA_BASE_URL;

      expect(() => getAgentConfig()).not.toThrow();
    });

    test('should return same structure as agentConfig', () => {
      const config = getAgentConfig();

      expect(config).toEqual(agentConfig);
    });
  });

  describe('Configuration Integrity', () => {
    test('model name should be a valid Llama model', () => {
      expect(agentConfig.model.name).toMatch(/^llama/);
    });

    test('temperature should be within valid range', () => {
      expect(agentConfig.model.temperature).toBeGreaterThanOrEqual(0);
      expect(agentConfig.model.temperature).toBeLessThanOrEqual(2);
    });

    test('baseUrl should be defined', () => {
      expect(agentConfig.model.baseUrl).toBeDefined();
      expect(typeof agentConfig.model.baseUrl).toBe('string');
    });

    test('maxIterations should be positive', () => {
      expect(agentConfig.behavior.maxIterations).toBeGreaterThan(0);
    });

    test('all intent categories should be lowercase with underscores', () => {
      agentConfig.intentCategories.forEach(category => {
        expect(category).toMatch(/^[a-z_]+$/);
      });
    });
  });
});
