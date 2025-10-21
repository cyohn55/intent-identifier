/**
 * JSON Formatting Examples for Intent Display
 * Copy the option you want to Frontend/app.js line 209-214
 */

// OPTION 1: Compact (single line)
const compact = JSON.stringify({
    intent: intentResult.intent,
    confidence: intentResult.confidence,
    entities: intentResult.entities,
    error: intentResult.error
});
// Result: {"intent":"greeting","confidence":0.9,"entities":{},"error":null}


// OPTION 2: Minimal indentation (1 space)
const minimal = JSON.stringify({
    intent: intentResult.intent,
    confidence: intentResult.confidence,
    entities: intentResult.entities,
    error: intentResult.error
}, null, 1);


// OPTION 3: Standard (2 spaces) - CURRENT
const standard = JSON.stringify({
    intent: intentResult.intent,
    confidence: intentResult.confidence,
    entities: intentResult.entities,
    error: intentResult.error
}, null, 2);


// OPTION 4: Wide (4 spaces)
const wide = JSON.stringify({
    intent: intentResult.intent,
    confidence: intentResult.confidence,
    entities: intentResult.entities,
    error: intentResult.error
}, null, 4);


// OPTION 5: Tab indentation
const tabbed = JSON.stringify({
    intent: intentResult.intent,
    confidence: intentResult.confidence,
    entities: intentResult.entities,
    error: intentResult.error
}, null, '\t');


// OPTION 6: Include ALL fields (reasoning, response, metadata)
const complete = JSON.stringify({
    intent: intentResult.intent,
    confidence: intentResult.confidence,
    entities: intentResult.entities,
    response: intentResult.response,
    reasoning: intentResult.reasoning,
    metadata: intentResult.metadata,
    error: intentResult.error
}, null, 2);


// OPTION 7: Custom order (most important first)
const customOrder = JSON.stringify({
    intent: intentResult.intent,
    confidence: intentResult.confidence,
    entities: intentResult.entities,
    error: intentResult.error,
    // Optional fields only if they exist
    ...(intentResult.response && { response: intentResult.response }),
    ...(intentResult.reasoning && { reasoning: intentResult.reasoning })
}, null, 2);


// OPTION 8: Pretty formatted with custom replacer
const prettyFormatted = JSON.stringify({
    intent: intentResult.intent,
    confidence: intentResult.confidence,
    entities: intentResult.entities,
    error: intentResult.error
}, (key, value) => {
    // Round confidence to 2 decimal places
    if (key === 'confidence') {
        return Math.round(value * 100) / 100;
    }
    // Remove null/empty values
    if (value === null || value === undefined) {
        return undefined;
    }
    return value;
}, 2);


// OPTION 9: Color-coded JSON (requires HTML modification)
function coloredJSON(intentResult) {
    const data = {
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        entities: intentResult.entities,
        error: intentResult.error
    };

    let json = JSON.stringify(data, null, 2);

    // Add syntax highlighting
    json = json.replace(/"([^"]+)":/g, '<span class="json-key">"$1":</span>');
    json = json.replace(/: "([^"]+)"/g, ': <span class="json-string">"$1"</span>');
    json = json.replace(/: (\d+\.?\d*)/g, ': <span class="json-number">$1</span>');
    json = json.replace(/: (true|false)/g, ': <span class="json-boolean">$1</span>');
    json = json.replace(/: null/g, ': <span class="json-null">null</span>');

    return json;
}


// OPTION 10: Exclude empty/null fields
const cleanJSON = JSON.stringify(
    Object.fromEntries(
        Object.entries({
            intent: intentResult.intent,
            confidence: intentResult.confidence,
            entities: intentResult.entities,
            error: intentResult.error
        }).filter(([_, v]) => v != null && (typeof v !== 'object' || Object.keys(v).length > 0))
    ),
    null,
    2
);
