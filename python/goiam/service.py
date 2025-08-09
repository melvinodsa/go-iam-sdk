from abc import ABC, abstractmethod

from .models import Resource, User


class Service(ABC):
    """Abstract base class for Go IAM SDK service"""

    @abstractmethod
    def verify(self, code: str) -> str:
        """
        Verify authentication code and return access token

        Args:
            code: Authentication code to verify

        Returns:
            Access token string

        Raises:
            Exception: If verification fails
        """
        pass

    @abstractmethod
    def me(self, token: str) -> User:
        """
        Get current user information

        Args:
            token: Bearer token for authentication

        Returns:
            User object with user information

        Raises:
            Exception: If request fails
        """
        pass

    @abstractmethod
    def create_resource(self, resource: Resource, token: str) -> None:
        """
        Create a new resource

        Args:
            resource: Resource object to create
            token: Bearer token for authentication

        Raises:
            Exception: If creation fails
        """
        pass
