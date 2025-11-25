"""
JWT Authentication Middleware for Intent-Identifier
Validates JWT tokens from authentication-api

Phase 4: JWT Authentication
- Validates JWT signature using shared secret
- Checks token expiration
- Verifies token issuer
- Extracts user information
"""

import os
import jwt
from typing import Optional
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

load_dotenv()

# JWT Configuration
JWT_SECRET = os.getenv('JWT_SECRET')
JWT_ISSUER = os.getenv('JWT_ISSUER', 'auth-api')
AUTH_ENABLED = os.getenv('JWT_AUTH_ENABLED', 'false').lower() == 'true'


def extract_token(request: Request) -> Optional[str]:
    """
    Extract JWT token from Authorization header

    Args:
        request: FastAPI Request object

    Returns:
        JWT token or None if not found
    """
    auth_header = request.headers.get('authorization') or request.headers.get('Authorization')

    if not auth_header:
        return None

    # Support "Bearer <token>" format
    if auth_header.startswith('Bearer '):
        return auth_header[7:]

    # Support direct token
    return auth_header


def verify_token(token: str) -> dict:
    """
    Verify JWT token and extract user information

    Args:
        token: JWT token string

    Returns:
        Decoded token payload

    Raises:
        HTTPException: If token is invalid or expired
    """
    if not JWT_SECRET:
        raise HTTPException(
            status_code=500,
            detail={
                'error': 'Server configuration error',
                'message': 'JWT_SECRET is not configured',
                'code': 'CONFIG_ERROR'
            }
        )

    try:
        decoded = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=['HS256', 'HS384', 'HS512'],
            issuer=JWT_ISSUER
        )
        return decoded

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail={
                'error': 'Token expired',
                'message': 'Your session has expired. Please log in again.',
                'code': 'TOKEN_EXPIRED'
            }
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=403,
            detail={
                'error': 'Invalid token',
                'message': 'The provided token is invalid.',
                'code': 'INVALID_TOKEN'
            }
        )
    except jwt.ImmatureSignatureError:
        raise HTTPException(
            status_code=401,
            detail={
                'error': 'Token not yet valid',
                'message': 'This token is not yet valid.',
                'code': 'TOKEN_NOT_YET_VALID'
            }
        )
    except Exception as error:
        raise HTTPException(
            status_code=401,
            detail={
                'error': 'Authentication failed',
                'message': f'Token verification failed: {str(error)}',
                'code': 'AUTH_FAILED'
            }
        )


async def authenticate_request(request: Request):
    """
    Middleware to authenticate requests using JWT

    This can be used as a dependency in FastAPI routes

    Args:
        request: FastAPI Request object

    Returns:
        User information from JWT

    Raises:
        HTTPException: If authentication fails

    Example:
        @app.post("/api/classify")
        async def classify(request: Request, user_info = Depends(authenticate_request)):
            # user_info contains decoded JWT data
            pass
    """
    # Skip authentication if disabled (for backward compatibility)
    if not AUTH_ENABLED:
        # Return empty user info when auth is disabled
        return {
            'user_id': 'anonymous',
            'email': 'anonymous@localhost',
            'roles': [],
            'permissions': [],
            'auth_enabled': False
        }

    # Extract token from request
    token = extract_token(request)

    if not token:
        raise HTTPException(
            status_code=401,
            detail={
                'error': 'Authentication required',
                'message': 'No authentication token provided',
                'code': 'NO_TOKEN'
            }
        )

    # Verify and decode token
    decoded = verify_token(token)

    # Extract user information
    user_info = {
        'user_id': decoded.get('userId') or decoded.get('sub'),
        'email': decoded.get('email', 'unknown@example.com'),
        'roles': decoded.get('roles', []),
        'permissions': decoded.get('permissions', []),
        'token_issued_at': decoded.get('iat'),
        'token_expires_at': decoded.get('exp'),
        'auth_enabled': True
    }

    return user_info


async def optional_authentication(request: Request):
    """
    Optional authentication - validates token if present, allows request if not

    Args:
        request: FastAPI Request object

    Returns:
        User information or None if no token provided
    """
    # If auth is disabled, return None
    if not AUTH_ENABLED:
        return None

    token = extract_token(request)

    if not token:
        return None

    try:
        decoded = verify_token(token)
        return {
            'user_id': decoded.get('userId') or decoded.get('sub'),
            'email': decoded.get('email'),
            'roles': decoded.get('roles', []),
            'permissions': decoded.get('permissions', []),
            'auth_enabled': True
        }
    except HTTPException:
        # Token validation failed - continue as anonymous
        return None


# Export functions
__all__ = [
    'extract_token',
    'verify_token',
    'authenticate_request',
    'optional_authentication',
    'AUTH_ENABLED'
]
