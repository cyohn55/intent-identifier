# JSON Customization Guide

Complete guide for customizing what fields the AI extracts and how they're displayed.

---

## Overview

**Two Files Control JSON Output:**

1. **`Working/intentAgent.js`** - Backend (AI extracts and returns data)
2. **`Frontend/app.js`** - Frontend (displays the data)

---

## Part 1: Backend - What AI Extracts

### Location: `Working/intentAgent.js`

### A. Entity Types (Lines 92-99)

**Current entity types the AI looks for:**

```javascript
- If there's a person's name → add "person": "name"
- If there's an emotion word → add "emotion": "emotion"
- If there's a time reference → add "time": "time"
- If there's a location → add "location": "place"
- If there's a topic/subject → add "topic": "subject"
- If there's an action verb → add "action": "verb"
- If there's an object/thing → add "object": "thing"
```

**To add/modify entities, edit lines 92-99:**

```javascript
// ADD YOUR CUSTOM ENTITIES:
- If there's a quantity/number → add "quantity": "number"
- If there's a date → add "date": "date_value"
- If there's a price → add "price": "amount"
- If there's a company name → add "company": "name"
- If there's a product → add "product": "product_name"
- If there's a sentiment → add "sentiment": "positive/negative/neutral"
```

### B. Return Object Structure (Lines 352-359)

**Current fields returned by AI:**

```javascript
return {
  intent: result.identifiedIntent,      // "greeting", "question", etc.
  confidence: result.confidence,         // 0.0 to 1.0
  entities: result.entities,             // {"person": "Jane", "emotion": "mad"}
  response: result.response,             // AI generated response
  reasoning: result.reasoning,           // Detailed reasoning object
  error: result.error,                   // Error message if any
};
```

**To add custom fields:**

```javascript
return {
  intent: result.identifiedIntent,
  confidence: result.confidence,
  entities: result.entities,
  response: result.response,
  reasoning: result.reasoning,
  error: result.error,

  // ADD CUSTOM FIELDS:
  timestamp: new Date().toISOString(),
  language: "en",
  sentiment: calculateSentiment(result),  // Your custom function
  keywords: extractKeywords(state.userInput),
  category: mapIntentToCategory(result.identifiedIntent),
};
```

### C. Reasoning Structure (Lines 225-237)

**Current reasoning format:**

```javascript
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
}
```

**To modify reasoning structure, edit lines 225-237:**

```javascript
{
  "analysis": {
    "primary_emotion": "detected emotion",
    "complexity_score": "1-10 rating",
    "context_needed": "yes/no"
  },
  "classification": {
    "method": "how it was classified",
    "alternatives": ["other possible intents"],
    "certainty": "high/medium/low"
  },
  "recommendations": {
    "next_steps": ["suggested actions"],
    "clarifications": ["questions to ask if unclear"]
  }
}
```

---

## Part 2: Frontend - What Gets Displayed

### Location: `Frontend/app.js`

### A. Main JSON Display (Lines 209-214)

**Current display (4 fields):**

```javascript
const intentJSON = JSON.stringify({
    intent: intentResult.intent,
    confidence: intentResult.confidence,
    entities: intentResult.entities,
    error: intentResult.error
}, null, 2);
```

### Common Customizations:

#### Option 1: Show Everything
```javascript
const intentJSON = JSON.stringify({
    intent: intentResult.intent,
    confidence: intentResult.confidence,
    entities: intentResult.entities,
    response: intentResult.response,
    reasoning: intentResult.reasoning,
    metadata: intentResult.metadata,
    error: intentResult.error
}, null, 2);
```

#### Option 2: Custom Order (Most Important First)
```javascript
const intentJSON = JSON.stringify({
    intent: intentResult.intent,
    confidence: intentResult.confidence,
    entities: intentResult.entities,
    // Optional fields only if they exist
    ...(intentResult.response && { response: intentResult.response }),
    ...(intentResult.error && { error: intentResult.error })
}, null, 2);
```

#### Option 3: Reorganized Structure
```javascript
const intentJSON = JSON.stringify({
    classification: {
        intent: intentResult.intent,
        confidence: intentResult.confidence,
    },
    extracted_data: intentResult.entities,
    ai_response: intentResult.response,
    debug: {
        reasoning: intentResult.reasoning,
        error: intentResult.error
    }
}, null, 2);
```

#### Option 4: Hide Empty/Null Values
```javascript
const intentJSON = JSON.stringify(
    Object.fromEntries(
        Object.entries({
            intent: intentResult.intent,
            confidence: intentResult.confidence,
            entities: intentResult.entities,
            response: intentResult.response,
            error: intentResult.error
        }).filter(([_, v]) =>
            v != null &&
            (typeof v !== 'object' || Object.keys(v).length > 0)
        )
    ),
    null,
    2
);
```

#### Option 5: Add Custom Formatting
```javascript
const intentJSON = JSON.stringify({
    intent: intentResult.intent.toUpperCase(),  // Uppercase intent
    confidence: `${(intentResult.confidence * 100).toFixed(1)}%`,  // Show as percentage
    entities: intentResult.entities,
    entity_count: Object.keys(intentResult.entities).length,  // Add count
    error: intentResult.error
}, null, 2);
```

---

## Part 3: Examples of Complete Customizations

### Example 1: E-commerce Intent Classifier

**Backend (`intentAgent.js` line 92-99):**
```javascript
- If there's a product name → add "product": "product_name"
- If there's a price → add "price": "amount"
- If there's a quantity → add "quantity": "number"
- If there's a brand → add "brand": "brand_name"
- If there's a category → add "category": "type"
- If there's a color → add "color": "color_name"
- If there's a size → add "size": "size_value"
```

**Frontend (`app.js` line 209-214):**
```javascript
const intentJSON = JSON.stringify({
    customer_intent: intentResult.intent,
    confidence_score: `${(intentResult.confidence * 100).toFixed(0)}%`,
    product_details: intentResult.entities,
    suggested_response: intentResult.response
}, null, 2);
```

### Example 2: Customer Support Classifier

**Backend (`intentAgent.js` line 92-99):**
```javascript
- If there's urgency words → add "urgency": "high/medium/low"
- If there's a complaint → add "issue_type": "description"
- If there's a request → add "request_type": "category"
- If there's an order number → add "order_id": "number"
- If there's account info → add "account": "details"
```

**Frontend (`app.js` line 209-214):**
```javascript
const intentJSON = JSON.stringify({
    ticket_classification: intentResult.intent,
    priority: intentResult.entities.urgency || "medium",
    customer_data: intentResult.entities,
    suggested_action: intentResult.response,
    confidence: intentResult.confidence
}, null, 2);
```

### Example 3: Minimal Clean Display

**Frontend only:**
```javascript
const intentJSON = JSON.stringify({
    intent: intentResult.intent,
    entities: intentResult.entities
}, null, 2);
```

---

## Part 4: Advanced Customizations

### Add Custom Calculated Fields

**In Backend (`intentAgent.js` lines 352-359):**

```javascript
// Helper function (add before processMessage)
calculateSentiment(result) {
  const entities = result.entities;
  if (entities.emotion) {
    const positive = ['happy', 'excited', 'joy', 'love'];
    const negative = ['mad', 'angry', 'sad', 'frustrated'];

    if (positive.includes(entities.emotion.toLowerCase())) return 'positive';
    if (negative.includes(entities.emotion.toLowerCase())) return 'negative';
  }
  return 'neutral';
}

// Then in return object:
return {
  intent: result.identifiedIntent,
  confidence: result.confidence,
  entities: result.entities,
  sentiment: this.calculateSentiment(result),  // NEW
  response: result.response,
  reasoning: result.reasoning,
  error: result.error,
};
```

### Format Values in Frontend

**In Frontend (`app.js`):**

```javascript
// Custom replacer function
const intentJSON = JSON.stringify({
    intent: intentResult.intent,
    confidence: intentResult.confidence,
    entities: intentResult.entities,
    error: intentResult.error
}, (key, value) => {
    // Round confidence to 2 decimals
    if (key === 'confidence') {
        return Math.round(value * 100) / 100;
    }
    // Uppercase intent
    if (key === 'intent') {
        return value.toUpperCase();
    }
    // Remove null/undefined
    if (value === null || value === undefined) {
        return undefined;
    }
    return value;
}, 2);
```

---

## Quick Reference

| Want to... | Edit File | Line Number |
|------------|-----------|-------------|
| Add new entity types | `Working/intentAgent.js` | 92-99 |
| Change AI prompt | `Working/intentAgent.js` | 86-114 |
| Add return fields | `Working/intentAgent.js` | 352-359 |
| Change reasoning structure | `Working/intentAgent.js` | 225-237 |
| Change displayed fields | `Frontend/app.js` | 209-214 |
| Change JSON spacing | `Frontend/app.js` | 214 (change `2`) |
| Filter empty values | `Frontend/app.js` | 209-214 (see examples) |
| Add custom styling | `Frontend/styles.css` | 243-249 |

---

## Testing Your Changes

After making changes:

1. **Backend changes** - Restart server:
   ```bash
   pkill -f "node Frontend/server.js"
   PORT=8888 node Frontend/server.js
   ```

2. **Frontend changes** - Refresh browser (Ctrl+F5)

3. **Test with sample message:**
   - "Jane makes me so mad!"
   - Check JSON output matches expectations

---

## Tips

1. **Start small** - Change one thing at a time
2. **Test frequently** - Verify each change works
3. **Keep backups** - Commit changes to git before major edits
4. **Check syntax** - JSON must be valid (no trailing commas, proper quotes)
5. **Read errors** - Console shows helpful error messages

---

## Need Help?

Common issues:
- **JSON parse error** - Check for trailing commas, missing quotes
- **Field not showing** - Make sure backend returns it AND frontend displays it
- **AI not extracting** - Update the prompt with clearer instructions
- **Wrong format** - Check JSON.stringify spacing parameter
