package golang

import "context"

type Service interface {
	Verify(ctx context.Context, code string) (string, error)
	Me(ctx context.Context, token string) (*User, error)
	CreateResource(ctx context.Context, resource *Resource, token string) error
}
