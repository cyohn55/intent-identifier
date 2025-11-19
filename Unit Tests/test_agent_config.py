"""
Unit Tests for Agent Configuration Module

This module tests the agent configuration functionality including
initialization, environment validation, and configuration retrieval.
"""

import os
import pytest
from unittest.mock import patch, Mock
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent / 'Working'))

from agent_config import AgentConfig, get_agent_config


class TestAgentConfig:
    """Test suite for AgentConfig class."""

    def test_initialization_with_defaults(self):
        """Test AgentConfig initialization with default values."""
        config = AgentConfig()

        # Verify model configuration
        assert config.model['name'] == 'llama3.2'
        assert config.model['temperature'] == 0.7
        assert 'base_url' in config.model

        # Verify behavior configuration
        assert config.behavior['max_iterations'] == 10
        assert config.behavior['enable_memory'] is True

        # Verify intent categories
        expected_categories = [
            'greeting',
            'question',
            'command',
            'information_request',
            'clarification',
            'feedback',
            'goodbye',
            'unknown'
        ]
        assert config.intent_categories == expected_categories

    @patch.dict(os.environ, {'OLLAMA_BASE_URL': 'http://custom:11434'})
    def test_initialization_with_custom_base_url(self):
        """Test AgentConfig initialization with custom base URL from environment."""
        config = AgentConfig()

        assert config.model['base_url'] == 'http://custom:11434'

    @patch.dict(os.environ, {'NODE_ENV': 'development'})
    def test_verbose_logging_in_development(self):
        """Test that verbose logging is enabled in development environment."""
        config = AgentConfig()

        assert config.behavior['verbose_logging'] is True

    @patch.dict(os.environ, {'NODE_ENV': 'production'}, clear=True)
    def test_verbose_logging_in_production(self):
        """Test that verbose logging is disabled in production environment."""
        config = AgentConfig()

        assert config.behavior['verbose_logging'] is False

    def test_system_prompt_is_not_empty(self):
        """Test that system prompt is properly initialized."""
        config = AgentConfig()

        assert len(config.system_prompt) > 0
        assert 'intent' in config.system_prompt.lower()
        assert 'classify' in config.system_prompt.lower()

    def test_validate_environment_succeeds(self):
        """Test that environment validation succeeds with valid configuration."""
        config = AgentConfig()

        # Should not raise any exception
        config.validate_environment()

    def test_get_model_config(self):
        """Test get_model_config returns correct configuration."""
        config = AgentConfig()
        model_config = config.get_model_config()

        assert isinstance(model_config, dict)
        assert 'name' in model_config
        assert 'temperature' in model_config
        assert 'base_url' in model_config

    def test_get_behavior_config(self):
        """Test get_behavior_config returns correct configuration."""
        config = AgentConfig()
        behavior_config = config.get_behavior_config()

        assert isinstance(behavior_config, dict)
        assert 'max_iterations' in behavior_config
        assert 'verbose_logging' in behavior_config
        assert 'enable_memory' in behavior_config

    def test_get_intent_categories(self):
        """Test get_intent_categories returns list of categories."""
        config = AgentConfig()
        categories = config.get_intent_categories()

        assert isinstance(categories, list)
        assert len(categories) > 0
        assert 'greeting' in categories
        assert 'unknown' in categories


class TestGetAgentConfig:
    """Test suite for get_agent_config function."""

    def test_get_agent_config_returns_agent_config_instance(self):
        """Test that get_agent_config returns an AgentConfig instance."""
        config = get_agent_config()

        assert isinstance(config, AgentConfig)

    def test_get_agent_config_validates_environment(self):
        """Test that get_agent_config validates environment."""
        # Mock validate_environment to track if it's called
        with patch.object(AgentConfig, 'validate_environment') as mock_validate:
            config = get_agent_config()

            mock_validate.assert_called_once()

    def test_get_agent_config_returns_consistent_configuration(self):
        """Test that get_agent_config returns consistent configuration across calls."""
        config1 = get_agent_config()
        config2 = get_agent_config()

        # Configurations should have the same structure
        assert config1.model['name'] == config2.model['name']
        assert config1.intent_categories == config2.intent_categories


class TestAgentConfigIntegration:
    """Integration tests for agent configuration."""

    def test_full_configuration_workflow(self):
        """Test the complete configuration workflow."""
        # Get configuration
        config = get_agent_config()

        # Verify all components are accessible
        model_config = config.get_model_config()
        behavior_config = config.get_behavior_config()
        categories = config.get_intent_categories()

        # Verify integrity
        assert model_config['name'] is not None
        assert behavior_config['max_iterations'] > 0
        assert len(categories) > 0

    @patch.dict(os.environ, {
        'OLLAMA_BASE_URL': 'http://test:11434',
        'NODE_ENV': 'development'
    })
    def test_configuration_with_environment_variables(self):
        """Test configuration respects environment variables."""
        config = get_agent_config()

        assert config.model['base_url'] == 'http://test:11434'
        assert config.behavior['verbose_logging'] is True


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
