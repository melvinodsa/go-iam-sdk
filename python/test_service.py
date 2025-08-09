import unittest
from unittest.mock import Mock, patch

from goiam.models import Resource
from goiam.service_impl import ServiceImpl


class TestServiceImpl(unittest.TestCase):

    def setUp(self):
        self.service = ServiceImpl(
            base_url="https://go-iam.example.com",
            client_id="test-client-id",
            secret="test-secret",
        )

    @patch("goiam.service_impl.requests.Session.get")
    def test_verify_success(self, mock_get):
        # Mock successful response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "success": True,
            "data": {"access_token": "test-token"},
        }
        mock_get.return_value = mock_response

        token = self.service.verify("valid-code")

        self.assertEqual(token, "test-token")
        mock_get.assert_called_once()

    @patch("goiam.service_impl.requests.Session.get")
    def test_verify_failure(self, mock_get):
        # Mock failure response
        mock_response = Mock()
        mock_response.status_code = 401
        mock_response.reason = "Unauthorized"
        mock_get.return_value = mock_response

        with self.assertRaises(Exception) as context:
            self.service.verify("invalid-code")

        self.assertIn("Failed to verify code", str(context.exception))

    @patch("goiam.service_impl.requests.Session.get")
    def test_me_success(self, mock_get):
        # Mock successful response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "success": True,
            "data": {"id": "user-id", "name": "Test User", "email": "test@example.com"},
        }
        mock_get.return_value = mock_response

        user = self.service.me("valid-token")

        self.assertEqual(user.id, "user-id")
        self.assertEqual(user.name, "Test User")
        self.assertEqual(user.email, "test@example.com")

    @patch("goiam.service_impl.requests.Session.get")
    def test_me_failure(self, mock_get):
        # Mock failure response
        mock_response = Mock()
        mock_response.status_code = 401
        mock_response.reason = "Unauthorized"
        mock_get.return_value = mock_response

        with self.assertRaises(Exception) as context:
            self.service.me("invalid-token")

        self.assertIn("Failed to fetch user information", str(context.exception))

    @patch("goiam.service_impl.requests.Session.post")
    def test_create_resource_success(self, mock_post):
        # Mock successful response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "success": True,
            "message": "Resource created successfully",
        }
        mock_post.return_value = mock_response

        resource = Resource(
            id="resource-id", name="Test Resource", description="A test resource"
        )

        # Should not raise an exception
        self.service.create_resource(resource, "valid-token")
        mock_post.assert_called_once()

    @patch("goiam.service_impl.requests.Session.post")
    def test_create_resource_failure(self, mock_post):
        # Mock failure response
        mock_response = Mock()
        mock_response.status_code = 401
        mock_response.reason = "Unauthorized"
        mock_post.return_value = mock_response

        resource = Resource(id="resource-id", name="Test Resource")

        with self.assertRaises(Exception) as context:
            self.service.create_resource(resource, "invalid-token")

        self.assertIn("Failed to create resource", str(context.exception))


if __name__ == "__main__":
    unittest.main()
