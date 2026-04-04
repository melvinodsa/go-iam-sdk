package golang

import "context"

type Service interface {
	Verify(ctx context.Context, code string) (string, error)
	Me(ctx context.Context, token string) (*User, error)
	ListProjects(ctx context.Context, token string) ([]Project, error)
	CreateProject(ctx context.Context, project *Project, token string) error
	UpdateProject(ctx context.Context, id string, project *Project, token string) error
	CreateResource(ctx context.Context, resource *Resource, token string) error
	DeleteResource(ctx context.Context, resourceID string, token string) error
}
