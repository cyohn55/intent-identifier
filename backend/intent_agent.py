"""
Intent Agent Module

This module implements a LangGraph-based agent for identifying and
classifying user intents. It uses a state graph approach to process
user messages and determine their underlying intent.
"""

import json
import re
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, field

from langgraph.graph import StateGraph, END
from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, SystemMessage

from agent_config import get_agent_config


@dataclass
class AgentState:
    """
    State schema for the agent graph.
    Represents the data that flows through the agent's processing pipeline.
    """
    user_input: str = ''
    messages: List[Any] = field(default_factory=list)
    identified_intent: Optional[str] = None
    confidence: float = 0.0
    entities: Dict[str, str] = field(default_factory=dict)
    response: str = ''
    reasoning: Any = None
    error: Optional[str] = None


class IntentAgent:
    """
    Intent Agent Class

    Implements a stateful agent using LangGraph for intent identification
    and classification. The agent processes user input through multiple
    stages to determine intent and generate appropriate responses.
    """

    def __init__(self):
        """Initializes the Intent Agent with configuration and model."""
        self.config = get_agent_config()

        # Initialize the language model
        self.model = ChatOllama(
            model=self.config.model['name'],
            temperature=self.config.model['temperature'],
            base_url=self.config.model['base_url']
        )

        # Build the agent graph
        self.graph = self.build_graph()

    async def process_input(self, state: AgentState) -> AgentState:
        """
        Processes user input node.
        Initializes the state with user input and system prompt.

        Args:
            state (AgentState): Current agent state

        Returns:
            AgentState: Updated state with messages
        """
        try:
            state.messages = [
                SystemMessage(content=self.config.system_prompt),
                HumanMessage(content=state.user_input)
            ]
            return state
        except Exception as error:
            state.error = f"Error processing input: {str(error)}"
            return state

    async def identify_intent(self, state: AgentState) -> AgentState:
        """
        Identifies intent from user input.
        Uses the language model to analyze and classify the intent.

        Args:
            state (AgentState): Current agent state

        Returns:
            AgentState: Updated state with identified intent
        """
        try:
            intent_prompt = f"""You MUST extract entities from the user's message.

User message: "{state.user_input}"

Step 1: Identify the intent from: {', '.join(self.config.intent_categories)}

Step 2: Extract ALL entities you find:
- If there's a person's name → add "person": "name"
- If there's an emotion word → add "emotion": "emotion"
- If there's a time reference → add "time": "time"
- If there's a location → add "location": "place"
- If there's a topic/subject → add "topic": "subject"
- If there's an action verb → add "action": "verb"
- If there's an object/thing → add "object": "thing"

CRITICAL: You MUST fill in the entities field. Do NOT leave it empty if there are ANY words that match the categories above.

Examples:
"Jane makes me so mad!" → person: Jane, emotion: mad
"studying for my exam tomorrow" → activity: studying, topic: exam, time: tomorrow
"I'm feeling happy" → emotion: happy
"Schedule a meeting with John" → action: schedule, object: meeting, person: John

Now respond ONLY with JSON in this EXACT format:
{{
  "intent": "category_name",
  "confidence": 0.9,
  "entities": {{"key": "value"}}
}}"""

            messages = state.messages + [HumanMessage(content=intent_prompt)]

            response = await self.model.ainvoke(messages)
            content = response.content

            # Try to parse the response to extract intent information
            # First, try to find JSON in the response
            json_match = re.search(r'\{[\s\S]*\}', content)

            if json_match:
                try:
                    # Clean up the JSON string - remove any invalid characters
                    json_string = json_match.group(0)

                    # Try to fix common JSON formatting issues
                    json_string = re.sub(r'[\x00-\x1F\x7F-\x9F]', '', json_string)  # Remove control characters
                    json_string = re.sub(r',(\s*[}\]])', r'\1', json_string)  # Remove trailing commas
                    json_string = json_string.replace('\n', ' ')  # Replace newlines with spaces
                    json_string = json_string.replace('\r', '')  # Remove carriage returns
                    json_string = json_string.strip()

                    intent_data = json.loads(json_string)
                    state.identified_intent = intent_data.get('intent', 'unknown')
                    state.confidence = intent_data.get('confidence', 0.5)
                    state.entities = intent_data.get('entities', {})
                except json.JSONDecodeError:
                    # If JSON parsing fails, try to extract intent using pattern matching
                    intent_match = re.search(r'"intent"\s*:\s*"([^"]+)"', content)
                    confidence_match = re.search(r'"confidence"\s*:\s*([\d.]+)', content)

                    state.identified_intent = intent_match.group(1) if intent_match else 'unknown'
                    state.confidence = float(confidence_match.group(1)) if confidence_match else 0.5
                    state.entities = {}
            else:
                # No JSON found, fallback to simple classification
                state.identified_intent = self.classify_intent_fallback(state.user_input)
                state.confidence = 0.6
                state.entities = {}

            return state
        except Exception as error:
            state.error = f"Error identifying intent: {str(error)}"
            state.identified_intent = 'unknown'
            state.confidence = 0.0
            return state

    def classify_intent_fallback(self, user_input: str) -> str:
        """
        Fallback method to classify intent using simple pattern matching.
        Used when JSON parsing fails.

        Args:
            user_input (str): User input message

        Returns:
            str: Classified intent
        """
        lower_input = user_input.lower()

        # Simple pattern matching for common intents
        if re.match(r'^(hi|hello|hey|greetings|good morning|good afternoon)', lower_input, re.IGNORECASE):
            return 'greeting'
        if re.search(r'(what|when|where|why|how|who|which)', lower_input, re.IGNORECASE) and '?' in lower_input:
            return 'question'
        if re.search(r'(please|could you|can you|would you|schedule|book|create|add)', lower_input, re.IGNORECASE):
            return 'command'
        if re.search(r'(thanks|thank you|appreciate|grateful|bye|goodbye|see you)', lower_input, re.IGNORECASE):
            return 'goodbye'
        if re.search(r'(help|assist|support|clarify|explain)', lower_input, re.IGNORECASE):
            return 'clarification'
        if re.search(r'(tell me|what is|what are|show me|give me)', lower_input, re.IGNORECASE):
            return 'information_request'

        return 'unknown'

    async def generate_response(self, state: AgentState) -> AgentState:
        """
        Generates response based on identified intent.
        Creates an appropriate response for the user based on the classified intent.

        Args:
            state (AgentState): Current agent state

        Returns:
            AgentState: Updated state with generated response and reasoning
        """
        try:
            # First, generate structured reasoning about the classification
            reasoning_prompt = f"""Analyze this intent classification decision:

User Message: "{state.user_input}"
Identified Intent: "{state.identified_intent}"
Confidence Score: {state.confidence}

Provide your analysis in the following format. Respond ONLY with valid JSON:

{{
  "message_analysis": {{
    "key_phrases": ["list", "of", "key", "phrases"],
    "user_goal": "brief description of user's primary goal"
  }},
  "intent_justification": {{
    "why_this_intent": "explanation of why this intent was chosen",
    "confidence_factors": ["factor 1", "factor 2", "factor 3"]
  }},
  "response_strategy": {{
    "approach": "how to respond to this intent",
    "user_expectation": "what the user expects"
  }}
}}"""

            reasoning_messages = state.messages + [HumanMessage(content=reasoning_prompt)]

            reasoning_response = await self.model.ainvoke(reasoning_messages)

            # Try to parse the reasoning as JSON
            try:
                content = reasoning_response.content.strip()
                json_match = re.search(r'\{[\s\S]*\}', content)

                if json_match:
                    json_string = json_match.group(0)
                    json_string = re.sub(r'[\x00-\x1F\x7F-\x9F]', '', json_string)
                    json_string = re.sub(r',(\s*[}\]])', r'\1', json_string)
                    json_string = json_string.strip()

                    state.reasoning = json.loads(json_string)
                else:
                    # Fallback to plain text if JSON parsing fails
                    state.reasoning = {
                        "message_analysis": {
                            "key_phrases": [],
                            "user_goal": "Could not parse reasoning"
                        },
                        "intent_justification": {
                            "why_this_intent": content,
                            "confidence_factors": []
                        },
                        "response_strategy": {
                            "approach": "Direct response",
                            "user_expectation": "Helpful answer"
                        }
                    }
            except json.JSONDecodeError:
                # If JSON parsing fails completely, use a simple structure
                state.reasoning = {
                    "message_analysis": {
                        "key_phrases": [],
                        "user_goal": state.user_input
                    },
                    "intent_justification": {
                        "why_this_intent": f"Classified as {state.identified_intent}",
                        "confidence_factors": [f"Confidence: {state.confidence}"]
                    },
                    "response_strategy": {
                        "approach": "Direct response",
                        "user_expectation": "Helpful answer"
                    }
                }

            # Then, generate a clean user-facing response
            response_prompt = f"""User message: "{state.user_input}"
Identified intent: "{state.identified_intent}"

IMPORTANT: Respond directly to the user's message. Do NOT explain your classification process, do NOT mention the intent, and do NOT include any meta-commentary. Just provide a natural, helpful response to what the user said.

Your response:"""

            response_messages = state.messages + [HumanMessage(content=response_prompt)]

            response = await self.model.ainvoke(response_messages)
            state.response = response.content.strip()

            return state
        except Exception as error:
            state.error = f"Error generating response: {str(error)}"
            state.response = 'I apologize, but I encountered an error processing your request.'
            state.reasoning = {
                "message_analysis": {
                    "key_phrases": [],
                    "user_goal": "Error occurred"
                },
                "intent_justification": {
                    "why_this_intent": str(error),
                    "confidence_factors": []
                },
                "response_strategy": {
                    "approach": "Error recovery",
                    "user_expectation": "Error message"
                }
            }
            return state

    def build_graph(self):
        """
        Builds the agent's state graph.
        Defines the flow of processing through different nodes.

        Returns:
            CompiledGraph: Compiled state graph ready for execution
        """
        workflow = StateGraph(AgentState)

        # Add nodes to the graph
        workflow.add_node('process_input', self.process_input)
        workflow.add_node('identify_intent', self.identify_intent)
        workflow.add_node('generate_response', self.generate_response)

        # Define the flow
        workflow.set_entry_point('process_input')
        workflow.add_edge('process_input', 'identify_intent')
        workflow.add_edge('identify_intent', 'generate_response')
        workflow.add_edge('generate_response', END)

        return workflow.compile()

    async def process_message(self, user_input: str) -> Dict[str, Any]:
        """
        Processes a user message through the agent pipeline.

        Args:
            user_input (str): The user's input message

        Returns:
            Dict[str, Any]: Dictionary containing intent, confidence, entities, response, and reasoning
        """
        initial_state = AgentState(user_input=user_input)

        result = await self.graph.ainvoke(initial_state)

        # LangGraph returns a dict, not AgentState object
        return {
            'intent': result.get('identified_intent'),
            'confidence': result.get('confidence', 0.0),
            'entities': result.get('entities', {}),
            'response': result.get('response', ''),
            'reasoning': result.get('reasoning', {}),
            'error': result.get('error')
        }
