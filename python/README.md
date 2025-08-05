# 🔐 goiam-python

[![PyPI version](https://badge.fury.io/py/goiam-python.svg)](https://badge.fury.io/py/goiam-python)
[![Python versions](https://img.shields.io/pypi/pyversions/goiam-python.svg)](https://pypi.org/project/goiam-python/)

Python SDK for Go IAM - A lightweight Identity and Access Management server.

## Installation

```bash
pip install goiam-python
# or
poetry add goiam-python
# or
pipenv install goiam-python
```

## Usage

### Initialize the SDK

```python
from goiam import new_service

service = new_service(
    base_url="https://go-iam.example.com",
    client_id="your-client-id",
    secret="your-secret"
)
```

### Verify Authentication Code

```python
try:
    token = service.verify("auth-code")
    print(f"Access Token: {token}")
except Exception as error:
    print(f"Failed to verify code: {error}")
```

### Fetch Current User Information

```python
try:
    user = service.me(token)
    print(f"User: {user.name} ({user.email})")
except Exception as error:
    print(f"Failed to fetch user information: {error}")
```

### Create a Resource

```python
from goiam import Resource

resource = Resource(
    id="resource-id",
    name="Resource Name",
    description="Resource Description",
    key="resource-key",
    enabled=True,
    project_id="project-id",
    created_by="creator",
    updated_by="updater"
)

try:
    service.create_resource(resource, token)
    print("Resource created successfully")
except Exception as error:
    print(f"Failed to create resource: {error}")
```

## Classes

The SDK provides the following main classes:

### User

```python
class User:
    id: str
    project_id: str
    name: str
    email: str
    phone: str
    enabled: bool
    profile_pic: str
    expiry: Optional[str]
    roles: Dict[str, UserRole]
    resources: Dict[str, UserResource]
    policies: Dict[str, str]
    created_at: Optional[str]
    created_by: str
    updated_at: Optional[str]
    updated_by: str
```

### Resource

```python
class Resource:
    def __init__(self,
                 id: str = '',
                 name: str = '',
                 description: str = '',
                 key: str = '',
                 enabled: bool = True,
                 project_id: str = '',
                 created_by: str = '',
                 updated_by: str = '',
                 created_at: Optional[str] = None,
                 updated_at: Optional[str] = None,
                 deleted_at: Optional[str] = None):
        # ...
```

## Error Handling

The SDK methods raise exceptions with descriptive messages. It's recommended to wrap API calls in try-except blocks:

```python
try:
    result = service.verify("code")
    # Handle success
except Exception as error:
    print(f"API Error: {error}")
    # Handle error
```

## Testing

Run the tests using:

```bash
python -m pytest python/test_service.py
# or
python -m unittest python/test_service.py
```

## Related Projects

> ✅ Admin UI: [go-iam-ui](https://github.com/melvinodsa/go-iam-ui)  
> 🐳 Docker Setup: [go-iam-docker](https://github.com/melvinodsa/go-iam-docker)  
> 🔐 Backend: [go-iam](https://github.com/melvinodsa/go-iam)  
> 📦 SDK: [go-iam-sdk](https://github.com/melvinodsa/go-iam-sdk)  
> 🚀 Examples: [go-iam-examples](https://github.com/melvinodsa/go-iam-examples)

## License

MIT
