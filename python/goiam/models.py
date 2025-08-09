from typing import Any, Dict, Optional


class User:
    def __init__(self, data: Dict[str, Any]):
        self.id: str = data.get("id", "")
        self.project_id: str = data.get("project_id", "")
        self.name: str = data.get("name", "")
        self.email: str = data.get("email", "")
        self.phone: str = data.get("phone", "")
        self.enabled: bool = data.get("enabled", False)
        self.profile_pic: str = data.get("profile_pic", "")
        self.expiry: Optional[str] = data.get("expiry")
        self.roles: Dict[str, "UserRole"] = {
            k: UserRole(v) for k, v in data.get("roles", {}).items()
        }
        self.resources: Dict[str, "UserResource"] = {
            k: UserResource(v) for k, v in data.get("resources", {}).items()
        }
        self.policies: Dict[str, str] = data.get("policies", {})
        self.created_at: Optional[str] = data.get("created_at")
        self.created_by: str = data.get("created_by", "")
        self.updated_at: Optional[str] = data.get("updated_at")
        self.updated_by: str = data.get("updated_by", "")


class UserPolicy:
    def __init__(self, data: Dict[str, Any]):
        self.name: str = data.get("name", "")
        self.mapping: UserPolicyMapping = UserPolicyMapping(data.get("mapping", {}))


class UserPolicyMapping:
    def __init__(self, data: Dict[str, Any]):
        self.arguments: Dict[str, UserPolicyMappingValue] = {
            k: UserPolicyMappingValue(v) for k, v in data.get("arguments", {}).items()
        }


class UserPolicyMappingValue:
    def __init__(self, data: Dict[str, Any]):
        self.static: str = data.get("static", "")


class UserRole:
    def __init__(self, data: Dict[str, Any]):
        self.id: str = data.get("id", "")
        self.name: str = data.get("name", "")


class UserResource:
    def __init__(self, data: Dict[str, Any]):
        self.id: str = data.get("id", "")
        self.key: str = data.get("key", "")
        self.name: str = data.get("name", "")


class Resource:
    def __init__(
        self,
        id: str = "",
        name: str = "",
        description: str = "",
        key: str = "",
        enabled: bool = True,
        project_id: str = "",
        created_by: str = "",
        updated_by: str = "",
        created_at: Optional[str] = None,
        updated_at: Optional[str] = None,
        deleted_at: Optional[str] = None,
    ):
        self.id = id
        self.name = name
        self.description = description
        self.key = key
        self.enabled = enabled
        self.project_id = project_id
        self.created_at = created_at
        self.created_by = created_by
        self.updated_at = updated_at
        self.updated_by = updated_by
        self.deleted_at = deleted_at

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "key": self.key,
            "enabled": self.enabled,
            "project_id": self.project_id,
            "created_at": self.created_at,
            "created_by": self.created_by,
            "updated_at": self.updated_at,
            "updated_by": self.updated_by,
            "deleted_at": self.deleted_at,
        }


class AuthVerifyCodeResponse:
    def __init__(self, data: Dict[str, Any]):
        self.access_token: str = data.get("access_token", "")


class AuthCallbackResponse:
    def __init__(self, data: Dict[str, Any]):
        self.success: bool = data.get("success", False)
        self.message: str = data.get("message", "")
        self.data: Optional[AuthVerifyCodeResponse] = None
        if data.get("data"):
            self.data = AuthVerifyCodeResponse(data["data"])


class UserResponse:
    def __init__(self, data: Dict[str, Any]):
        self.success: bool = data.get("success", False)
        self.message: str = data.get("message", "")
        self.data: Optional[User] = None
        if data.get("data"):
            self.data = User(data["data"])


class ResourceResponse:
    def __init__(self, data: Dict[str, Any]):
        self.success: bool = data.get("success", False)
        self.message: str = data.get("message", "")
        self.data: Optional[Resource] = None
        if data.get("data"):
            self.data = Resource(**data["data"])
