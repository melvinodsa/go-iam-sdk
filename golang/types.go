package golang

import "time"

type UserResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    *User  `json:"data,omitempty"`
}

type User struct {
	Id             string                  `json:"id"`
	ProjectId      string                  `json:"project_id"`
	Name           string                  `json:"name"`
	Email          string                  `json:"email"`
	Phone          string                  `json:"phone"`
	Enabled        bool                    `json:"enabled"`
	ProfilePic     string                  `json:"profile_pic"`
	LinkedClientId string                  `json:"linked_client_id,omitempty"`
	Expiry         *time.Time              `json:"expiry"`
	Roles          map[string]UserRole     `json:"roles"`
	Resources      map[string]UserResource `json:"resources"`
	Policies       map[string]UserPolicy   `json:"policies"`
	CreatedAt      *time.Time              `json:"created_at"`
	CreatedBy      string                  `json:"created_by"`
	UpdatedAt      *time.Time              `json:"updated_at"`
	UpdatedBy      string                  `json:"updated_by"`
}

type UserPolicy struct {
	Name    string            `json:"name"`
	Mapping UserPolicyMapping `json:"mapping,omitempty"`
}

type UserPolicyMapping struct {
	Arguments map[string]UserPolicyMappingValue `json:"arguments,omitempty"`
}

type UserPolicyMappingValue struct {
	Static string `json:"static,omitempty"`
}

type UserRole struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

type UserResource struct {
	RoleIds   map[string]bool `json:"role_ids"`
	PolicyIds map[string]bool `json:"policy_ids"`
	Key       string          `json:"key"`
	Name      string          `json:"name"`
}

type AuthVerifyCodeResponse struct {
	AccessToken string `json:"access_token"`
}

type AuthCallbackResponse struct {
	Success bool                    `json:"success"`
	Message string                  `json:"message"`
	Data    *AuthVerifyCodeResponse `json:"data"`
}

type Resource struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Key         string     `json:"key"`
	Enabled     bool       `json:"enabled"`
	ProjectId   string     `json:"project_id"`
	CreatedAt   *time.Time `json:"created_at"`
	CreatedBy   string     `json:"created_by"`
	UpdatedAt   *time.Time `json:"updated_at"`
	UpdatedBy   string     `json:"updated_by"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty"`
}

type ResourceResponse struct {
	Success bool      `json:"success"`
	Message string    `json:"message"`
	Data    *Resource `json:"data,omitempty"`
}

// Project represents a project in the Go IAM system.
// Projects provide multi-tenant isolation, ensuring that users, clients,
// and other resources are scoped to specific organizational units.
type Project struct {
	Id          string     `json:"id"`          // Unique identifier for the project
	Name        string     `json:"name"`        // Display name of the project
	Tags        []string   `json:"tags"`        // Tags for categorizing the project
	Description string     `json:"description"` // Description of the project's purpose
	CreatedAt   *time.Time `json:"created_at"`  // Timestamp when project was created
	CreatedBy   string     `json:"created_by"`  // ID of the user who created this project
	UpdatedAt   *time.Time `json:"updated_at"`  // Timestamp when project was last updated
	UpdatedBy   string     `json:"updated_by"`  // ID of the user who last updated this project
}

// ProjectResponse represents an API response containing a single project.
type ProjectResponse struct {
	Success bool     `json:"success"`        // Indicates if the operation was successful
	Message string   `json:"message"`        // Human-readable message about the operation
	Data    *Project `json:"data,omitempty"` // The project data (present only on success)
}

// ProjectsResponse represents an API response containing a list of projects.
type ProjectsResponse struct {
	Success bool      `json:"success"`        // Indicates if the operation was successful
	Message string    `json:"message"`        // Human-readable message about the operation
	Data    []Project `json:"data,omitempty"` // Array of project data
}
