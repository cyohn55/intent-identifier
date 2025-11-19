"""
Unit Tests for Server Module

This module tests the FastAPI server functionality including
endpoints, request validation, and error handling.
"""

import pytest
from unittest.mock import Mock, AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / 'Working'))


@pytest.fixture
def mock_agent():
    """Create a mock IntentAgent."""
    agent = AsyncMock()
    agent.config = Mock()
    agent.config.intent_categories = [
        'greeting', 'question', 'command',
        'information_request', 'clarification',
        'feedback', 'goodbye', 'unknown'
    ]
    agent.process_message = AsyncMock(return_value={
        'intent': 'greeting',
        'confidence': 0.95,
        'entities': {},
        'response': 'Hello! How can I help you?',
        'reasoning': {},
        'error': None
    })
    return agent


@pytest.fixture
def client(mock_agent):
    """Create a test client with mocked agent."""
    with patch('server.IntentAgent', return_value=mock_agent):
        from server import app
        # Set the agent directly
        import server
        server.agent = mock_agent
        client = TestClient(app)
        yield client


class TestHealthEndpoint:
    """Test suite for health check endpoint."""

    def test_health_check_success(self, client):
        """Test successful health check."""
        response = client.get('/api/health')

        assert response.status_code == 200
        data = response.json()
        assert data['status'] == 'ok'
        assert data['service'] == 'Intent Identifier Server'
        assert 'timestamp' in data
        assert data['agent_status'] in ['ready', 'unavailable']

    def test_health_check_returns_correct_structure(self, client):
        """Test health check returns expected structure."""
        response = client.get('/api/health')

        assert response.status_code == 200
        data = response.json()
        required_fields = ['status', 'service', 'timestamp', 'agent_status']
        for field in required_fields:
            assert field in data


class TestClassifyEndpoint:
    """Test suite for message classification endpoint."""

    def test_classify_message_success(self, client, mock_agent):
        """Test successful message classification."""
        request_data = {'message': 'Hello world'}

        response = client.post('/api/classify', json=request_data)

        assert response.status_code == 200
        data = response.json()
        assert data['intent'] == 'greeting'
        assert data['confidence'] == 0.95
        assert 'entities' in data
        assert 'response' in data
        assert 'metadata' in data

    def test_classify_message_with_empty_string(self, client):
        """Test classification with empty string."""
        request_data = {'message': ''}

        response = client.post('/api/classify', json=request_data)

        assert response.status_code == 422  # Validation error

    def test_classify_message_with_whitespace_only(self, client):
        """Test classification with whitespace-only message."""
        request_data = {'message': '   '}

        response = client.post('/api/classify', json=request_data)

        assert response.status_code == 422  # Validation error

    def test_classify_message_too_long(self, client):
        """Test classification with message exceeding max length."""
        request_data = {'message': 'a' * 1001}  # 1001 characters

        response = client.post('/api/classify', json=request_data)

        assert response.status_code == 422  # Validation error

    def test_classify_message_missing_field(self, client):
        """Test classification with missing message field."""
        request_data = {}

        response = client.post('/api/classify', json=request_data)

        assert response.status_code == 422  # Validation error

    def test_classify_message_returns_metadata(self, client):
        """Test that classification returns metadata."""
        request_data = {'message': 'Hello'}

        response = client.post('/api/classify', json=request_data)

        assert response.status_code == 200
        data = response.json()
        assert 'metadata' in data
        assert 'processing_time' in data['metadata']
        assert 'timestamp' in data['metadata']
        assert 'model' in data['metadata']

    def test_classify_message_with_special_characters(self, client, mock_agent):
        """Test classification with special characters."""
        request_data = {'message': 'Hello! @#$%^&*()'}

        response = client.post('/api/classify', json=request_data)

        assert response.status_code == 200

    def test_classify_message_handles_agent_error(self, client, mock_agent):
        """Test classification handles agent errors gracefully."""
        # Make agent raise an exception
        mock_agent.process_message = AsyncMock(side_effect=Exception('Agent error'))

        request_data = {'message': 'Hello'}

        response = client.post('/api/classify', json=request_data)

        assert response.status_code == 200  # Should still return 200 with error info
        data = response.json()
        assert data['intent'] == 'unknown'
        assert data['confidence'] == 0.0
        assert data['error'] is not None


class TestCategoriesEndpoint:
    """Test suite for intent categories endpoint."""

    def test_get_categories_success(self, client):
        """Test successful retrieval of intent categories."""
        response = client.get('/api/categories')

        assert response.status_code == 200
        data = response.json()
        assert 'categories' in data
        assert 'count' in data
        assert isinstance(data['categories'], list)
        assert len(data['categories']) > 0

    def test_get_categories_contains_expected_intents(self, client):
        """Test that categories contain expected intent types."""
        response = client.get('/api/categories')

        assert response.status_code == 200
        data = response.json()
        expected_intents = ['greeting', 'question', 'command', 'unknown']
        for intent in expected_intents:
            assert intent in data['categories']

    def test_get_categories_count_matches_list_length(self, client):
        """Test that category count matches list length."""
        response = client.get('/api/categories')

        assert response.status_code == 200
        data = response.json()
        assert data['count'] == len(data['categories'])


class TestBatchClassifyEndpoint:
    """Test suite for batch classification endpoint."""

    def test_batch_classify_success(self, client, mock_agent):
        """Test successful batch classification."""
        request_data = {
            'messages': ['Hello', 'What is the weather?', 'Thank you']
        }

        response = client.post('/api/classify-batch', json=request_data)

        assert response.status_code == 200
        data = response.json()
        assert 'results' in data
        assert 'count' in data
        assert 'timestamp' in data
        assert len(data['results']) == 3

    def test_batch_classify_empty_array(self, client):
        """Test batch classification with empty array."""
        request_data = {'messages': []}

        response = client.post('/api/classify-batch', json=request_data)

        assert response.status_code == 422  # Validation error

    def test_batch_classify_too_many_messages(self, client):
        """Test batch classification with too many messages."""
        request_data = {'messages': ['message'] * 11}  # 11 messages (max is 10)

        response = client.post('/api/classify-batch', json=request_data)

        assert response.status_code == 422  # Validation error

    def test_batch_classify_with_empty_string_in_array(self, client):
        """Test batch classification with empty string in array."""
        request_data = {'messages': ['Hello', '', 'World']}

        response = client.post('/api/classify-batch', json=request_data)

        assert response.status_code == 422  # Validation error

    def test_batch_classify_missing_messages_field(self, client):
        """Test batch classification with missing messages field."""
        request_data = {}

        response = client.post('/api/classify-batch', json=request_data)

        assert response.status_code == 422  # Validation error

    def test_batch_classify_handles_partial_failures(self, client, mock_agent):
        """Test batch classification handles individual message failures."""
        # Make agent fail on some messages
        def side_effect(message):
            if 'error' in message.lower():
                raise Exception('Processing error')
            return {
                'intent': 'greeting',
                'confidence': 0.95,
                'entities': {},
                'response': 'Response',
                'reasoning': {},
                'error': None
            }

        mock_agent.process_message = AsyncMock(side_effect=side_effect)

        request_data = {
            'messages': ['Hello', 'error message', 'Thank you']
        }

        response = client.post('/api/classify-batch', json=request_data)

        assert response.status_code == 200
        data = response.json()
        assert len(data['results']) == 3
        # Check that the error message has error info
        assert data['results'][1]['error'] is not None


class TestRequestValidation:
    """Test suite for request validation."""

    def test_classify_request_validation_strips_whitespace(self, client, mock_agent):
        """Test that message whitespace is stripped."""
        request_data = {'message': '  Hello world  '}

        response = client.post('/api/classify', json=request_data)

        assert response.status_code == 200
        # Verify that agent was called with stripped message
        mock_agent.process_message.assert_called_once()
        call_args = mock_agent.process_message.call_args[0]
        assert call_args[0] == 'Hello world'

    def test_batch_classify_strips_whitespace_from_messages(self, client, mock_agent):
        """Test that batch messages have whitespace stripped."""
        request_data = {
            'messages': ['  Hello  ', '  World  ', '  Test  ']
        }

        response = client.post('/api/classify-batch', json=request_data)

        assert response.status_code == 200
        # Verify all messages were processed
        assert mock_agent.process_message.call_count == 3


class TestErrorHandling:
    """Test suite for error handling."""

    def test_404_handler(self, client):
        """Test 404 error handling."""
        response = client.get('/nonexistent-endpoint')

        assert response.status_code == 404
        data = response.json()
        assert 'error' in data
        assert 'message' in data

    def test_invalid_json_format(self, client):
        """Test handling of invalid JSON format."""
        response = client.post(
            '/api/classify',
            data='invalid json',
            headers={'Content-Type': 'application/json'}
        )

        assert response.status_code == 422  # Unprocessable entity

    def test_wrong_content_type(self, client):
        """Test handling of wrong content type."""
        response = client.post(
            '/api/classify',
            data='message=hello',
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )

        assert response.status_code == 422


class TestResponseStructure:
    """Test suite for response structure validation."""

    def test_classify_response_has_all_required_fields(self, client):
        """Test that classify response has all required fields."""
        request_data = {'message': 'Hello'}

        response = client.post('/api/classify', json=request_data)

        assert response.status_code == 200
        data = response.json()
        required_fields = [
            'intent', 'confidence', 'entities',
            'response', 'reasoning', 'metadata'
        ]
        for field in required_fields:
            assert field in data, f"Missing required field: {field}"

    def test_health_response_structure(self, client):
        """Test health check response structure."""
        response = client.get('/api/health')

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data['status'], str)
        assert isinstance(data['service'], str)
        assert isinstance(data['timestamp'], str)
        assert isinstance(data['agent_status'], str)


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
