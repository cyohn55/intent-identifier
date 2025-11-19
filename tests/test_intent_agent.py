"""
Unit Tests for Intent Agent Module

This module tests the intent agent functionality including
state management, intent identification, and response generation.
"""

import pytest
from unittest.mock import Mock, AsyncMock, patch, MagicMock
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / 'Working'))

from intent_agent import IntentAgent, AgentState


class TestAgentState:
    """Test suite for AgentState dataclass."""

    def test_agent_state_initialization_with_defaults(self):
        """Test AgentState initialization with default values."""
        state = AgentState()

        assert state.user_input == ''
        assert state.messages == []
        assert state.identified_intent is None
        assert state.confidence == 0.0
        assert state.entities == {}
        assert state.response == ''
        assert state.reasoning is None
        assert state.error is None

    def test_agent_state_initialization_with_values(self):
        """Test AgentState initialization with custom values."""
        state = AgentState(
            user_input='Hello',
            identified_intent='greeting',
            confidence=0.95
        )

        assert state.user_input == 'Hello'
        assert state.identified_intent == 'greeting'
        assert state.confidence == 0.95

    def test_agent_state_mutable_fields(self):
        """Test that AgentState fields can be modified."""
        state = AgentState()

        state.user_input = 'Test message'
        state.identified_intent = 'question'
        state.confidence = 0.85
        state.entities = {'topic': 'weather'}

        assert state.user_input == 'Test message'
        assert state.identified_intent == 'question'
        assert state.confidence == 0.85
        assert state.entities == {'topic': 'weather'}


class TestIntentAgent:
    """Test suite for IntentAgent class."""

    @pytest.fixture
    def mock_model(self):
        """Create a mock ChatOllama model."""
        return AsyncMock()

    @pytest.fixture
    def agent(self, mock_model):
        """Create an IntentAgent instance with mocked model."""
        with patch('intent_agent.ChatOllama', return_value=mock_model):
            agent = IntentAgent()
            agent.model = mock_model
            return agent

    def test_agent_initialization(self):
        """Test IntentAgent initialization."""
        with patch('intent_agent.ChatOllama'):
            agent = IntentAgent()

            assert agent.config is not None
            assert agent.model is not None
            assert agent.graph is not None

    @pytest.mark.asyncio
    async def test_process_input_success(self, agent):
        """Test successful input processing."""
        state = AgentState(user_input='Hello world')

        result = await agent.process_input(state)

        assert len(result.messages) == 2
        assert result.error is None

    @pytest.mark.asyncio
    async def test_process_input_with_empty_input(self, agent):
        """Test input processing with empty input."""
        state = AgentState(user_input='')

        result = await agent.process_input(state)

        assert len(result.messages) == 2
        assert result.error is None

    def test_classify_intent_fallback_greeting(self, agent):
        """Test fallback classification for greeting intents."""
        test_inputs = [
            'Hi there',
            'Hello',
            'Hey',
            'Good morning',
            'Greetings'
        ]

        for user_input in test_inputs:
            intent = agent.classify_intent_fallback(user_input)
            assert intent == 'greeting', f"Failed for input: {user_input}"

    def test_classify_intent_fallback_question(self, agent):
        """Test fallback classification for question intents."""
        test_inputs = [
            'What is the weather?',
            'How do I do this?',
            'Where is the store?',
            'When does it start?'
        ]

        for user_input in test_inputs:
            intent = agent.classify_intent_fallback(user_input)
            assert intent == 'question', f"Failed for input: {user_input}"

    def test_classify_intent_fallback_command(self, agent):
        """Test fallback classification for command intents."""
        test_inputs = [
            'Please schedule a meeting',
            'Can you book a flight?',
            'Create a new task',
            'Add this to my calendar'
        ]

        for user_input in test_inputs:
            intent = agent.classify_intent_fallback(user_input)
            assert intent == 'command', f"Failed for input: {user_input}"

    def test_classify_intent_fallback_goodbye(self, agent):
        """Test fallback classification for goodbye intents."""
        test_inputs = [
            'Thank you',
            'Goodbye',
            'Bye',
            'See you later'
        ]

        for user_input in test_inputs:
            intent = agent.classify_intent_fallback(user_input)
            assert intent == 'goodbye', f"Failed for input: {user_input}"

    def test_classify_intent_fallback_clarification(self, agent):
        """Test fallback classification for clarification intents."""
        test_inputs = [
            'Can you help me?',
            'I need assistance',
            'Please clarify',
            'Explain this to me'
        ]

        for user_input in test_inputs:
            intent = agent.classify_intent_fallback(user_input)
            assert intent == 'clarification', f"Failed for input: {user_input}"

    def test_classify_intent_fallback_information_request(self, agent):
        """Test fallback classification for information request intents."""
        test_inputs = [
            'Tell me about Python',
            'What is machine learning',
            'Show me the data',
            'Give me the results'
        ]

        for user_input in test_inputs:
            intent = agent.classify_intent_fallback(user_input)
            assert intent == 'information_request', f"Failed for input: {user_input}"

    def test_classify_intent_fallback_unknown(self, agent):
        """Test fallback classification for unknown intents."""
        test_inputs = [
            'xyz abc def',
            'random text here',
            '12345'
        ]

        for user_input in test_inputs:
            intent = agent.classify_intent_fallback(user_input)
            assert intent == 'unknown', f"Failed for input: {user_input}"

    @pytest.mark.asyncio
    async def test_identify_intent_with_valid_json(self, agent):
        """Test intent identification with valid JSON response."""
        state = AgentState(user_input='Hello world')
        state.messages = []

        # Mock the model response with valid JSON
        mock_response = Mock()
        mock_response.content = '''
        {
            "intent": "greeting",
            "confidence": 0.95,
            "entities": {"emotion": "happy"}
        }
        '''
        agent.model.ainvoke = AsyncMock(return_value=mock_response)

        result = await agent.identify_intent(state)

        assert result.identified_intent == 'greeting'
        assert result.confidence == 0.95
        assert result.entities == {"emotion": "happy"}
        assert result.error is None

    @pytest.mark.asyncio
    async def test_identify_intent_with_malformed_json(self, agent):
        """Test intent identification with malformed JSON response."""
        state = AgentState(user_input='Hello world')
        state.messages = []

        # Mock the model response with malformed JSON
        mock_response = Mock()
        mock_response.content = 'This is not JSON at all'
        agent.model.ainvoke = AsyncMock(return_value=mock_response)

        result = await agent.identify_intent(state)

        # Should fall back to simple classification
        assert result.identified_intent == 'greeting'
        assert result.confidence > 0
        assert result.error is None

    @pytest.mark.asyncio
    async def test_identify_intent_handles_exception(self, agent):
        """Test intent identification handles exceptions gracefully."""
        state = AgentState(user_input='Hello world')
        state.messages = []

        # Mock the model to raise an exception
        agent.model.ainvoke = AsyncMock(side_effect=Exception('Model error'))

        result = await agent.identify_intent(state)

        assert result.identified_intent == 'unknown'
        assert result.confidence == 0.0
        assert result.error is not None
        assert 'Model error' in result.error

    @pytest.mark.asyncio
    async def test_generate_response_success(self, agent):
        """Test successful response generation."""
        state = AgentState(
            user_input='Hello',
            identified_intent='greeting',
            confidence=0.95,
            messages=[]
        )

        # Mock the model responses
        reasoning_response = Mock()
        reasoning_response.content = '''
        {
            "message_analysis": {
                "key_phrases": ["hello"],
                "user_goal": "greet"
            },
            "intent_justification": {
                "why_this_intent": "greeting pattern detected",
                "confidence_factors": ["hello keyword"]
            },
            "response_strategy": {
                "approach": "friendly greeting",
                "user_expectation": "greeting response"
            }
        }
        '''

        response_message = Mock()
        response_message.content = 'Hello! How can I help you today?'

        agent.model.ainvoke = AsyncMock(side_effect=[reasoning_response, response_message])

        result = await agent.generate_response(state)

        assert result.response == 'Hello! How can I help you today?'
        assert result.reasoning is not None
        assert result.error is None

    @pytest.mark.asyncio
    async def test_generate_response_handles_exception(self, agent):
        """Test response generation handles exceptions gracefully."""
        state = AgentState(
            user_input='Hello',
            identified_intent='greeting',
            confidence=0.95,
            messages=[]
        )

        # Mock the model to raise an exception
        agent.model.ainvoke = AsyncMock(side_effect=Exception('Response error'))

        result = await agent.generate_response(state)

        assert 'error' in result.response.lower()
        assert result.error is not None
        assert 'Response error' in result.error

    @pytest.mark.asyncio
    async def test_process_message_integration(self, agent):
        """Test complete message processing flow."""
        # Mock successful responses at each stage
        mock_response = Mock()
        mock_response.content = '''
        {
            "intent": "greeting",
            "confidence": 0.95,
            "entities": {}
        }
        '''

        reasoning_response = Mock()
        reasoning_response.content = '''
        {
            "message_analysis": {"key_phrases": ["hello"], "user_goal": "greet"},
            "intent_justification": {"why_this_intent": "greeting", "confidence_factors": []},
            "response_strategy": {"approach": "friendly", "user_expectation": "response"}
        }
        '''

        final_response = Mock()
        final_response.content = 'Hello! How can I help?'

        agent.model.ainvoke = AsyncMock(side_effect=[
            mock_response,
            reasoning_response,
            final_response
        ])

        # Process message
        result = await agent.process_message('Hello')

        # Verify result structure
        assert 'intent' in result
        assert 'confidence' in result
        assert 'entities' in result
        assert 'response' in result
        assert 'reasoning' in result
        assert result['intent'] == 'greeting'


class TestIntentAgentEdgeCases:
    """Test suite for edge cases and error handling."""

    @pytest.fixture
    def agent(self):
        """Create an IntentAgent instance with mocked model."""
        with patch('intent_agent.ChatOllama') as mock_model_class:
            mock_model = AsyncMock()
            mock_model_class.return_value = mock_model
            agent = IntentAgent()
            agent.model = mock_model
            return agent

    @pytest.mark.asyncio
    async def test_process_message_with_empty_string(self, agent):
        """Test processing an empty string message."""
        # Mock responses
        mock_response = Mock()
        mock_response.content = '{"intent": "unknown", "confidence": 0.5, "entities": {}}'

        reasoning_response = Mock()
        reasoning_response.content = '{"message_analysis": {}, "intent_justification": {}, "response_strategy": {}}'

        final_response = Mock()
        final_response.content = 'I did not understand that.'

        agent.model.ainvoke = AsyncMock(side_effect=[
            mock_response,
            reasoning_response,
            final_response
        ])

        result = await agent.process_message('')

        assert result['intent'] is not None
        assert result['confidence'] >= 0

    @pytest.mark.asyncio
    async def test_process_message_with_very_long_input(self, agent):
        """Test processing a very long input message."""
        long_message = 'This is a test. ' * 100  # 1500+ characters

        # Mock responses
        mock_response = Mock()
        mock_response.content = '{"intent": "question", "confidence": 0.7, "entities": {}}'

        reasoning_response = Mock()
        reasoning_response.content = '{"message_analysis": {}, "intent_justification": {}, "response_strategy": {}}'

        final_response = Mock()
        final_response.content = 'Response to long message'

        agent.model.ainvoke = AsyncMock(side_effect=[
            mock_response,
            reasoning_response,
            final_response
        ])

        result = await agent.process_message(long_message)

        assert result['intent'] is not None
        assert result['response'] is not None


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
