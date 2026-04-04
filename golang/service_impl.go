package golang

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

type serviceImpl struct {
	baseURL  string
	clientID string
	secret   string
}

// NewService creates a new instance of the service with the provided base URL, client ID, and secret.
// It returns a Service interface that can be used to interact with the API.
func NewService(baseURL, clientID, secret string) Service {
	return &serviceImpl{
		baseURL:  baseURL,
		clientID: clientID,
		secret:   secret,
	}
}

// Verify sends a verification request with the provided code and returns the access token if successful.
func (s *serviceImpl) Verify(ctx context.Context, code string) (string, error) {
	url := fmt.Sprintf("%s/auth/v1/verify?code=%s", s.baseURL, code)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return "", fmt.Errorf("error creating request: %w", err)
	}

	req.SetBasicAuth(s.clientID, s.secret)
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("error making request: %w", err)
	}
	defer resp.Body.Close()

	var statusError error
	if resp.StatusCode != http.StatusOK {
		statusError = fmt.Errorf("failed to verify code: %s", resp.Status)
	}

	result := AuthCallbackResponse{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		if statusError != nil {
			return "", fmt.Errorf("%w: %s", statusError, err)
		}
		return "", fmt.Errorf("error decoding response: %w", err)
	}

	if !result.Success {
		return "", fmt.Errorf("failed to verify code: %s. Status: %s", result.Message, resp.Status)
	}

	return result.Data.AccessToken, nil
}

// Me retrieves the user information associated with the provided token.
func (s *serviceImpl) Me(ctx context.Context, token string) (*User, error) {
	url := fmt.Sprintf("%s/me/v1/", s.baseURL)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("error creating request: %w", err)
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error making request: %w", err)
	}
	defer resp.Body.Close()

	var statusError error
	if resp.StatusCode != http.StatusOK {
		statusError = fmt.Errorf("failed to fetch user information: %s", resp.Status)
	}

	var user UserResponse
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		if statusError != nil {
			return nil, fmt.Errorf("%w: %s", statusError, err)
		}
		return nil, fmt.Errorf("error decoding response: %w", err)
	}

	if !user.Success {
		return nil, fmt.Errorf("failed to fetch user information: %s. Status: %s", user.Message, resp.Status)
	}

	return user.Data, nil
}

// ListProjects fetches all projects available to the caller.
func (s *serviceImpl) ListProjects(ctx context.Context, token string) ([]Project, error) {
	url := fmt.Sprintf("%s/project/v1/", s.baseURL)
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return nil, fmt.Errorf("error creating request: %w", err)
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error making request: %w", err)
	}
	defer resp.Body.Close()

	var statusError error
	if resp.StatusCode != http.StatusOK {
		statusError = fmt.Errorf("failed to list projects: %s", resp.Status)
	}

	result := ProjectsResponse{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		if statusError != nil {
			return nil, fmt.Errorf("%w: %s", statusError, err)
		}
		return nil, fmt.Errorf("error decoding response: %w", err)
	}

	if !result.Success {
		return nil, fmt.Errorf("failed to list projects: %s. Status: %s", result.Message, resp.Status)
	}

	return result.Data, nil
}

// CreateProject creates a new project with the provided details and token.
func (s *serviceImpl) CreateProject(ctx context.Context, project *Project, token string) error {
	if project == nil {
		return fmt.Errorf("project cannot be nil")
	}

	url := fmt.Sprintf("%s/project/v1/", s.baseURL)
	body, err := json.Marshal(project)
	if err != nil {
		return fmt.Errorf("error marshalling project: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, strings.NewReader(string(body)))
	if err != nil {
		return fmt.Errorf("error creating request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("error making request: %w", err)
	}
	defer resp.Body.Close()

	var statusError error
	if resp.StatusCode != http.StatusOK {
		statusError = fmt.Errorf("failed to create project: %s", resp.Status)
	}

	result := ProjectResponse{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		if statusError != nil {
			return fmt.Errorf("%w: %s", statusError, err)
		}
		return fmt.Errorf("error decoding response: %w", err)
	}
	if !result.Success {
		return fmt.Errorf("failed to create project: %s. Status: %s", result.Message, resp.Status)
	}

	if result.Data != nil {
		*project = *result.Data
	}

	return nil
}

// UpdateProject updates an existing project by ID using the provided details and token.
func (s *serviceImpl) UpdateProject(ctx context.Context, id string, project *Project, token string) error {
	if project == nil {
		return fmt.Errorf("project cannot be nil")
	}

	url := fmt.Sprintf("%s/project/v1/%s", s.baseURL, id)
	body, err := json.Marshal(project)
	if err != nil {
		return fmt.Errorf("error marshalling project: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPut, url, strings.NewReader(string(body)))
	if err != nil {
		return fmt.Errorf("error creating request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("error making request: %w", err)
	}
	defer resp.Body.Close()

	var statusError error
	if resp.StatusCode != http.StatusOK {
		statusError = fmt.Errorf("failed to update project: %s", resp.Status)
	}

	result := ProjectResponse{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		if statusError != nil {
			return fmt.Errorf("%w: %s", statusError, err)
		}
		return fmt.Errorf("error decoding response: %w", err)
	}
	if !result.Success {
		return fmt.Errorf("failed to update project: %s. Status: %s", result.Message, resp.Status)
	}

	if result.Data != nil {
		*project = *result.Data
	}

	return nil
}

// CreateResource creates a new resource with the provided details and token.
// It returns an error if the creation fails. Resource argument will be updated with the created resource details.
func (s *serviceImpl) CreateResource(ctx context.Context, resource *Resource, token string) error {
	url := fmt.Sprintf("%s/resource/v1/", s.baseURL)
	body, err := json.Marshal(resource)
	if err != nil {
		return fmt.Errorf("error marshalling resource: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, strings.NewReader(string(body)))
	if err != nil {
		return fmt.Errorf("error creating request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("error making request: %w", err)
	}
	defer resp.Body.Close()

	var statusError error
	if resp.StatusCode != http.StatusOK {
		statusError = fmt.Errorf("failed to fetch user information: %s", resp.Status)
	}

	result := ResourceResponse{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		if statusError != nil {
			return fmt.Errorf("%w: %s", statusError, err)
		}
		return fmt.Errorf("error decoding response: %w", err)
	}
	if !result.Success {
		return fmt.Errorf("failed to create resource: %s. Status: %s", result.Message, resp.Status)
	}

	return nil
}

// DeleteResource deletes a resource with the provided ID and token.
// It returns an error if the deletion fails.
func (s *serviceImpl) DeleteResource(ctx context.Context, resourceID string, token string) error {
	url := fmt.Sprintf("%s/resource/v1/%s", s.baseURL, resourceID)
	req, err := http.NewRequestWithContext(ctx, http.MethodDelete, url, nil)
	if err != nil {
		return fmt.Errorf("error creating request: %w", err)
	}

	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("error making request: %w", err)
	}
	defer resp.Body.Close()

	var statusError error
	if resp.StatusCode != http.StatusOK {
		statusError = fmt.Errorf("failed to delete resource: %s", resp.Status)
	}

	result := ResourceResponse{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		if statusError != nil {
			return fmt.Errorf("%w: %s", statusError, err)
		}
		return fmt.Errorf("error decoding response: %w", err)
	}

	if !result.Success {
		return fmt.Errorf("failed to delete resource: %s. Status: %s", result.Message, resp.Status)
	}

	return nil
}
