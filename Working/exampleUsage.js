/**
 * Example Usage of Intent Agent
 *
 * This file demonstrates how to use the Intent Agent to process
 * user messages and identify their intents. It includes examples
 * of different types of user inputs and how to handle the responses.
 */

const { IntentAgent } = require('./intentAgent');

/**
 * Runs example scenarios demonstrating the agent's capabilities
 */
async function runExamples() {
  try {
    console.log('=== Intent Agent Example Usage ===\n');

    // Initialize the agent
    const agent = new IntentAgent();
    console.log('Agent initialized successfully.\n');

    // Example test messages covering different intent categories
    const testMessages = [
      'Hello! How are you today?',
      'What is the weather like tomorrow?',
      'Please schedule a meeting for 3pm',
      'Can you tell me more about your capabilities?',
      'I need help understanding how this works',
      'Thank you for your assistance!',
      'Goodbye!',
    ];

    // Process each test message
    for (const message of testMessages) {
      console.log(`User Input: "${message}"`);
      console.log('-'.repeat(60));

      const result = await agent.processMessage(message);

      if (result.error) {
        console.log(`Error: ${result.error}\n`);
        continue;
      }

      console.log(`Identified Intent: ${result.intent}`);
      console.log(`Confidence: ${(result.confidence * 100).toFixed(2)}%`);

      if (Object.keys(result.entities).length > 0) {
        console.log(`Entities: ${JSON.stringify(result.entities, null, 2)}`);
      }

      console.log(`\nAgent Response: ${result.response}`);
      console.log('='.repeat(60));
      console.log('\n');
    }
  } catch (error) {
    console.error('Error running examples:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

/**
 * Interactive example allowing custom user input
 *
 * @param {string} customMessage - User message to process
 * @returns {Promise<Object>} Processing result from the agent
 */
async function processCustomMessage(customMessage) {
  try {
    const agent = new IntentAgent();
    const result = await agent.processMessage(customMessage);

    console.log('\n=== Processing Result ===');
    console.log(`Input: "${customMessage}"`);
    console.log(`Intent: ${result.intent}`);
    console.log(`Confidence: ${(result.confidence * 100).toFixed(2)}%`);
    console.log(`Response: ${result.response}`);

    if (result.error) {
      console.log(`Error: ${result.error}`);
    }

    return result;
  } catch (error) {
    console.error('Error processing custom message:', error.message);
    throw error;
  }
}

// Run examples if this file is executed directly
if (require.main === module) {
  runExamples().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  runExamples,
  processCustomMessage,
};
