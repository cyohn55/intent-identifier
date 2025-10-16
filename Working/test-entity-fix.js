/**
 * Test Entity Extraction Fix
 * Validates that entities are now properly captured after the regex fix
 */

const { IntentAgent } = require('./intentAgent.js');

async function testEntityExtraction() {
  const agent = new IntentAgent();

  const testCases = [
    {
      input: "Jane makes me so mad!",
      expectedEntities: ["person", "emotion"]
    },
    {
      input: "I'm studying for my exam tomorrow",
      expectedEntities: ["topic", "time"]
    },
    {
      input: "I'm feeling happy today",
      expectedEntities: ["emotion", "time"]
    },
    {
      input: "Schedule a meeting with John next week",
      expectedEntities: ["action", "object", "person", "time"]
    },
    {
      input: "Meet me at the coffee shop downtown",
      expectedEntities: ["action", "location"]
    }
  ];

  console.log('=== TESTING ENTITY EXTRACTION AFTER FIX ===\n');

  for (const testCase of testCases) {
    console.log(`\nTest Input: "${testCase.input}"`);
    console.log('Expected entity types:', testCase.expectedEntities.join(', '));

    try {
      const result = await agent.processMessage(testCase.input);

      console.log('Result:');
      console.log('  Intent:', result.intent);
      console.log('  Confidence:', result.confidence);
      console.log('  Entities:', JSON.stringify(result.entities));

      const entityKeys = Object.keys(result.entities || {});
      if (entityKeys.length > 0) {
        console.log('  ✓ SUCCESS: Entities captured:', entityKeys.join(', '));
      } else {
        console.log('  ✗ FAILURE: No entities captured (empty object)');
      }

    } catch (error) {
      console.log('  ✗ ERROR:', error.message);
    }

    console.log('---');
  }

  console.log('\n=== TEST COMPLETE ===');
}

testEntityExtraction().catch(console.error);
