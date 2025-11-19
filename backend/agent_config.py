"""
Agent Configuration Module

This module provides configuration settings for the LangGraph agent,
including model settings, system prompts, and agent behavior parameters.
"""

import os
from typing import Dict, List, Any
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class AgentConfig:
    """
    Agent configuration class containing all settings for agent initialization
    and operation.
    """

    def __init__(self):
        """Initialize agent configuration with default and environment values."""
        # Model configuration
        self.model = {
            'name': 'llama3.2',
            'temperature': 0.7,
            'base_url': os.getenv('OLLAMA_BASE_URL', 'http://localhost:11434')
        }

        # System prompt for the agent
        self.system_prompt = """You are a helpful AI assistant designed to identify and classify user intents.
Your primary responsibilities are:
1. Analyze user input to determine their underlying intent
2. Classify intents into appropriate categories
3. Extract relevant entities and parameters from user messages
4. Provide clear and actionable responses based on identified intents

Always be clear, concise, and helpful in your responses."""

        # Agent behavior settings
        self.behavior = {
            'max_iterations': 10,
            'verbose_logging': os.getenv('NODE_ENV') == 'development',
            'enable_memory': True
        }

        # Intent categories for classification
        self.intent_categories = [
            'greeting',
            'question',
            'command',
            'information_request',
            'clarification',
            'feedback',
            'goodbye',
            'unknown'
        ]

    def validate_environment(self) -> None:
        """
        Validates that all required environment variables are set.

        Raises:
            EnvironmentError: If required environment variables are missing
        """
        # Ollama typically runs locally, so no API key is required
        # Only validate if using a custom base URL that requires authentication
        if os.getenv('OLLAMA_API_KEY'):
            # Optional: validate API key if provided
            pass
        # No required environment variables for local Ollama

    def get_model_config(self) -> Dict[str, Any]:
        """
        Get the model configuration dictionary.

        Returns:
            Dict[str, Any]: Model configuration settings
        """
        return self.model

    def get_behavior_config(self) -> Dict[str, Any]:
        """
        Get the behavior configuration dictionary.

        Returns:
            Dict[str, Any]: Behavior configuration settings
        """
        return self.behavior

    def get_intent_categories(self) -> List[str]:
        """
        Get the list of intent categories.

        Returns:
            List[str]: List of intent category names
        """
        return self.intent_categories


def get_agent_config() -> AgentConfig:
    """
    Gets the agent configuration with validated environment.

    Returns:
        AgentConfig: The agent configuration object

    Raises:
        EnvironmentError: If environment validation fails
    """
    config = AgentConfig()
    config.validate_environment()
    return config
