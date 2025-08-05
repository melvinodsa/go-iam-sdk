"""
Go IAM Python SDK

A lightweight Python SDK for integrating with Go IAM server.
Provides methods for authentication, user management, and resource creation.
"""

from .service import Service
from .service_impl import ServiceImpl, new_service
from .models import User, Resource, UserRole, UserResource

__version__ = "0.0.1"
__all__ = [
    "Service",
    "ServiceImpl", 
    "new_service",
    "User",
    "Resource", 
    "UserRole",
    "UserResource"
]
