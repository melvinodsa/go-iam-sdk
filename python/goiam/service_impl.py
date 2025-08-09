import requests

from .models import AuthCallbackResponse, Resource, ResourceResponse, User, UserResponse
from .service import Service


class ServiceImpl(Service):
    """Implementation of the Go IAM SDK service"""

    def __init__(self, base_url: str, client_id: str, secret: str):
        """
        Initialize the service with configuration

        Args:
            base_url: Base URL of the Go IAM server
            client_id: Client ID for authentication
            secret: Client secret for authentication
        """
        self.base_url = base_url.rstrip("/")
        self.client_id = client_id
        self.secret = secret
        self.session = requests.Session()

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
        url = f"{self.base_url}/auth/v1/verify"
        params = {"code": code}

        try:
            response = self.session.get(
                url, params=params, auth=(self.client_id, self.secret)
            )

            if response.status_code != 200:
                raise Exception(
                    f"Failed to verify code: {response.status_code} {response.reason}"
                )

            auth_response = AuthCallbackResponse(response.json())

            if not auth_response.success:
                raise Exception(f"Failed to verify code: {auth_response.message}")

            if not auth_response.data:
                raise Exception("No access token received")

            return auth_response.data.access_token

        except requests.RequestException as e:
            raise Exception(f"Request failed: {str(e)}")
        except Exception as e:
            raise Exception(f"Verification failed: {str(e)}")

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
        url = f"{self.base_url}/me/v1/me"
        headers = {"Authorization": f"Bearer {token}"}

        try:
            response = self.session.get(url, headers=headers)

            if response.status_code != 200:
                raise Exception(
                    f"Failed to fetch user information: {response.status_code} {response.reason}"
                )

            user_response = UserResponse(response.json())

            if not user_response.success:
                raise Exception(
                    f"Failed to fetch user information: {user_response.message}"
                )

            if not user_response.data:
                raise Exception("No user data received")

            return user_response.data

        except requests.RequestException as e:
            raise Exception(f"Request failed: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to fetch user: {str(e)}")

    def create_resource(self, resource: Resource, token: str) -> None:
        """
        Create a new resource

        Args:
            resource: Resource object to create
            token: Bearer token for authentication

        Raises:
            Exception: If creation fails
        """
        url = f"{self.base_url}/resource/v1/"
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

        try:
            response = self.session.post(url, json=resource.to_dict(), headers=headers)

            if response.status_code != 200:
                raise Exception(
                    f"Failed to create resource: {response.status_code} {response.reason}"
                )

            resource_response = ResourceResponse(response.json())

            if not resource_response.success:
                raise Exception(
                    f"Failed to create resource: {resource_response.message}"
                )

        except requests.RequestException as e:
            raise Exception(f"Request failed: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to create resource: {str(e)}")


def new_service(base_url: str, client_id: str, secret: str) -> Service:
    """
    Create a new instance of the Go IAM service

    Args:
        base_url: Base URL of the Go IAM server
        client_id: Client ID for authentication
        secret: Client secret for authentication

    Returns:
        Service instance
    """
    return ServiceImpl(base_url, client_id, secret)
