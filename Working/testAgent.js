/**
 * Simple Test Script for Intent Agent
 *
 * This script allows you to quickly test the agent with custom messages.
 * You can modify the testMessages array to test different inputs.
 */

const { IntentAgent } = require('./intentAgent');

/**
 * Test the agent with a single message
 *
 * @param {IntentAgent} agent - The initialized agent
 * @param {string} message - The message to test
 */
async function testSingleMessage(agent, message) {
  console.log('\n' + '='.repeat(70));
  console.log(`Testing: "${message}"`);
  console.log('-'.repeat(70));

  try {
    const result = await agent.processMessage(message);

    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
      return;
    }

    console.log(`✓ Intent: ${result.intent}`);
    console.log(`✓ Confidence: ${(result.confidence * 100).toFixed(1)}%`);

    if (Object.keys(result.entities).length > 0) {
      console.log(`✓ Entities:`, JSON.stringify(result.entities, null, 2));
    }

    console.log(`\n📝 Response:\n${result.response}`);
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
  }

  console.log('='.repeat(70));
}

/**
 * Main test function
 */
async function runTests() {
  console.log('\n🤖 Intent Agent Testing Suite\n');

  try {
    // Initialize the agent
    const agent = new IntentAgent();
    console.log('✓ Agent initialized successfully\n');

    // Test messages - modify this array to test your own inputs
    const testMessages = [
      'Hello there!',
      'What time is it?',
      'Can you help me with something?',
      'Schedule a meeting at 2pm tomorrow',
      'Thanks for your help!',
    ];

    // Run tests
    for (const message of testMessages) {
      await testSingleMessage(agent, message);
      // Small delay between tests for readability
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n✅ All tests completed!\n');
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Allow testing a single custom message via command line
// Usage: node Working/testAgent.js "Your message here"
if (process.argv.length > 2) {
  const customMessage = process.argv.slice(2).join(' ');

  (async () => {
    console.log('\n🤖 Testing Custom Message\n');
    const agent = new IntentAgent();
    await testSingleMessage(agent, customMessage);
  })();
} else {
  // Run default tests
  runTests();
}

module.exports = { testSingleMessage };
