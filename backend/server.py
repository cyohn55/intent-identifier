"""
Intent Identifier - Backend Server

This FastAPI server provides HTTP endpoints for the frontend to communicate
with the IntentAgent. It bridges the browser-based frontend with the
Python-based intent classification system.
"""

import os
import time
from datetime import datetime
from typing import List, Optional
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field, validator

from intent_agent import IntentAgent
from auth_middleware import authenticate_request, AUTH_ENABLED


# Request/Response Models
class ClassifyRequest(BaseModel):
    """Request model for single message classification."""
    message: str = Field(..., min_length=1, max_length=1000)

    @validator('message')
    def validate_message(cls, value):
        """Validate that message is not empty after stripping whitespace."""
        if not value.strip():
            raise ValueError('Message must be a non-empty string')
        return value.strip()


class BatchClassifyRequest(BaseModel):
    """Request model for batch message classification."""
    messages: List[str] = Field(..., min_items=1, max_items=10)

    @validator('messages')
    def validate_messages(cls, value):
        """Validate that all messages are valid."""
        for msg in value:
            if not msg or not msg.strip():
                raise ValueError('All messages must be non-empty strings')
        return [msg.strip() for msg in value]


class HealthResponse(BaseModel):
    """Response model for health check endpoint."""
    status: str
    service: str
    timestamp: str
    agent_status: str


class ClassifyResponse(BaseModel):
    """Response model for classification endpoint."""
    intent: str
    confidence: float
    entities: dict
    response: str
    reasoning: dict
    error: Optional[str] = None
    metadata: Optional[dict] = None


# Initialize FastAPI app
app = FastAPI(
    title="Intent Identifier Server",
    description="Backend server for intent classification using LangGraph",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize IntentAgent
agent: Optional[IntentAgent] = None


@app.on_event("startup")
async def startup_event():
    """Initialize the IntentAgent on server startup."""
    global agent
    try:
        agent = IntentAgent()
        print('✓ IntentAgent initialized successfully')
    except Exception as error:
        print(f'✗ Failed to initialize IntentAgent: {str(error)}')
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on server shutdown."""
    print('Server shutting down...')


# Routes

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.
    GET /api/health

    Returns:
        HealthResponse: Server health status
    """
    return HealthResponse(
        status="ok",
        service="Intent Identifier Server",
        timestamp=datetime.utcnow().isoformat() + 'Z',
        agent_status="ready" if agent else "unavailable"
    )


@app.post("/api/classify", response_model=ClassifyResponse)
async def classify_message(
    request: ClassifyRequest,
    user_info: dict = Depends(authenticate_request)
):
    """
    Intent classification endpoint with JWT authentication.
    POST /api/classify
    Body: { "message": "user input text" }
    Headers: { "Authorization": "Bearer <JWT>" } (if JWT_AUTH_ENABLED=true)

    Args:
        request (ClassifyRequest): Request containing user message
        user_info (dict): Authenticated user information from JWT

    Returns:
        ClassifyResponse: Classification results with metadata

    Raises:
        HTTPException: If processing fails or authentication fails
    """
    try:
        message = request.message

        print(f'Processing message: "{message[:50]}{"..." if len(message) > 50 else ""}"')

        # Process message with IntentAgent
        start_time = time.time()
        result = await agent.process_message(message)
        processing_time = int((time.time() - start_time) * 1000)  # Convert to milliseconds

        print(f'✓ Intent classified: {result["intent"]} ({result["confidence"] * 100:.1f}%) in {processing_time}ms')

        # Return result with metadata
        return ClassifyResponse(
            intent=result['intent'],
            confidence=result['confidence'],
            entities=result['entities'],
            response=result['response'],
            reasoning=result['reasoning'],
            error=result.get('error'),
            metadata={
                'processing_time': processing_time,
                'timestamp': datetime.utcnow().isoformat() + 'Z',
                'model': 'llama3.2'
            }
        )

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    except Exception as error:
        print(f'Error processing message: {str(error)}')

        return ClassifyResponse(
            intent='unknown',
            confidence=0.0,
            entities={},
            response='I apologize, but I encountered an error processing your message. Please try again.',
            reasoning={},
            error=str(error)
        )


@app.get("/api/categories")
async def get_categories():
    """
    Get intent categories.
    GET /api/categories

    Returns:
        dict: Intent categories and count

    Raises:
        HTTPException: If retrieval fails
    """
    try:
        categories = agent.config.intent_categories
        return {
            'categories': categories,
            'count': len(categories)
        }
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail={
                'error': 'Failed to retrieve categories',
                'message': str(error)
            }
        )


@app.post("/api/classify-batch")
async def classify_batch(
    request: BatchClassifyRequest,
    user_info: dict = Depends(authenticate_request)
):
    """
    Batch classification endpoint with JWT authentication.
    POST /api/classify-batch
    Body: { "messages": ["msg1", "msg2", ...] }
    Headers: { "Authorization": "Bearer <JWT>" } (if JWT_AUTH_ENABLED=true)

    Args:
        request (BatchClassifyRequest): Request containing list of messages
        user_info (dict): Authenticated user information from JWT

    Returns:
        dict: Batch classification results

    Raises:
        HTTPException: If batch processing fails or authentication fails
    """
    try:
        messages = request.messages

        print(f'Processing batch of {len(messages)} messages')

        # Process all messages
        results = []
        for message in messages:
            try:
                result = await agent.process_message(message)
                results.append(result)
            except Exception as error:
                results.append({
                    'intent': 'unknown',
                    'confidence': 0.0,
                    'entities': {},
                    'response': 'Error processing message',
                    'reasoning': {},
                    'error': str(error)
                })

        return {
            'results': results,
            'count': len(results),
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }

    except Exception as error:
        print(f'Error processing batch: {str(error)}')
        raise HTTPException(
            status_code=500,
            detail={
                'error': 'Batch processing failed',
                'message': str(error)
            }
        )


# Serve static files
# Mount static directories
base_dir = Path(__file__).parent.parent

# Serve Models directory
if (base_dir / 'Models').exists():
    app.mount('/Models', StaticFiles(directory=str(base_dir / 'Models')), name='models')


@app.get("/")
async def root():
    """
    Root endpoint - serve the frontend.
    GET /

    Returns:
        FileResponse: index.html file
    """
    index_path = base_dir / 'frontend' / 'index.html'
    if index_path.exists():
        return FileResponse(str(index_path))
    return JSONResponse(
        status_code=404,
        content={'error': 'Frontend not found', 'message': 'index.html not found'}
    )


# Serve static files directly from frontend directory
@app.get("/{file_path:path}")
async def serve_static(file_path: str):
    """
    Serve static files (CSS, JS, etc.) from frontend directory.
    This must be defined AFTER all API routes.
    """
    # Skip API routes
    if file_path.startswith('api/'):
        raise HTTPException(status_code=404, detail="Not found")

    # Try frontend directory first
    frontend_path = base_dir / 'frontend' / file_path
    if frontend_path.exists() and frontend_path.is_file():
        return FileResponse(str(frontend_path))

    # Fallback to root directory for backward compatibility
    root_path = base_dir / file_path
    if root_path.exists() and root_path.is_file():
        return FileResponse(str(root_path))

    raise HTTPException(status_code=404, detail="Not found")


# 404 handler
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Handle 404 errors."""
    return JSONResponse(
        status_code=404,
        content={
            'error': 'Not found',
            'message': f'Route {request.method} {request.url.path} not found'
        }
    )


# Generic error handler
@app.exception_handler(Exception)
async def generic_error_handler(request: Request, exc: Exception):
    """Handle generic errors."""
    print(f'Server error: {str(exc)}')
    return JSONResponse(
        status_code=500,
        content={
            'error': 'Internal server error',
            'message': str(exc)
        }
    )


def print_banner(port: int):
    """Print server startup banner."""
    print('')
    print('═══════════════════════════════════════════════════════════')
    print('  Intent Identifier Server')
    print('═══════════════════════════════════════════════════════════')
    print(f'  Server running on: http://localhost:{port}')
    print(f'  API endpoint:      http://localhost:{port}/api/classify')
    print(f'  Health check:      http://localhost:{port}/api/health')
    print('═══════════════════════════════════════════════════════════')
    print('')
    print('Available endpoints:')
    print('  GET  /                      - Frontend interface')
    print('  GET  /api/health            - Health check')
    print('  GET  /api/categories        - Get intent categories')
    print('  POST /api/classify          - Classify single message')
    print('  POST /api/classify-batch    - Classify multiple messages')
    print('')
    print('Press Ctrl+C to stop the server')
    print('')


if __name__ == '__main__':
    import uvicorn

    port = int(os.getenv('PORT', 3000))

    print_banner(port)

    uvicorn.run(
        'server:app',
        host='0.0.0.0',
        port=port,
        reload=False,
        log_level='info'
    )
