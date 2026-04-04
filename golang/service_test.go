package golang

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestVerify(t *testing.T) {
	handler := func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Query().Get("code") == "valid-code" {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"success":true,"data":{"access_token":"test-token"}}`))
		} else {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"success":false,"message":"Invalid code"}`))
		}
	}

	ts := httptest.NewServer(http.HandlerFunc(handler))
	defer ts.Close()

	service := NewService(ts.URL, "client-id", "secret")

	t.Run("Valid Code", func(t *testing.T) {
		token, err := service.Verify(context.Background(), "valid-code")
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if token != "test-token" {
			t.Fatalf("expected token to be 'test-token', got %v", token)
		}
	})

	t.Run("Invalid Code", func(t *testing.T) {
		_, err := service.Verify(context.Background(), "invalid-code")
		if err == nil {
			t.Fatal("expected an error, got none")
		}
	})
}

func TestMe(t *testing.T) {
	handler := func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") == "Bearer valid-token" {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"success":true,"data":{"id":"user-id","name":"Test User"}}`))
		} else {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"success":false,"message":"Invalid token"}`))
		}
	}

	ts := httptest.NewServer(http.HandlerFunc(handler))
	defer ts.Close()

	service := NewService(ts.URL, "client-id", "secret")

	t.Run("Valid Token", func(t *testing.T) {
		user, err := service.Me(context.Background(), "valid-token")
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if user.Id != "user-id" {
			t.Fatalf("expected user ID to be 'user-id', got %v", user.Id)
		}
	})

	t.Run("Invalid Token", func(t *testing.T) {
		_, err := service.Me(context.Background(), "invalid-token")
		if err == nil {
			t.Fatal("expected an error, got none")
		}
	})
}

func TestCreateResource(t *testing.T) {
	handler := func(w http.ResponseWriter, r *http.Request) {
		fmt.Println("Came here")
		if r.Header.Get("Authorization") == "Bearer valid-token" {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"success":true,"data":{"id":"resource-id","name":"Test Resource"}}`))
		} else {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"success":false,"message":"Invalid token"}`))
		}
	}

	ts := httptest.NewServer(http.HandlerFunc(handler))
	defer ts.Close()

	service := NewService(ts.URL, "client-id", "secret")

	t.Run("Valid Token", func(t *testing.T) {
		resource := &Resource{
			ID:   "resource-id",
			Name: "Test Resource",
		}
		err := service.CreateResource(context.Background(), resource, "valid-token")
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})

	t.Run("Invalid Token", func(t *testing.T) {
		resource := &Resource{
			ID:   "resource-id",
			Name: "Test Resource",
		}
		err := service.CreateResource(context.Background(), resource, "invalid-token")
		if err == nil {
			t.Fatal("expected an error, got none")
		}
	})
}

func TestDeleteResource(t *testing.T) {
	handler := func(w http.ResponseWriter, r *http.Request) {
		if r.Header.Get("Authorization") == "Bearer valid-token" {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"success":true,"message":"Resource deleted successfully"}`))
		} else {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"success":false,"message":"Invalid token"}`))
		}
	}

	ts := httptest.NewServer(http.HandlerFunc(handler))
	defer ts.Close()

	service := NewService(ts.URL, "client-id", "secret")

	t.Run("Valid Token", func(t *testing.T) {
		err := service.DeleteResource(context.Background(), "resource-123", "valid-token")
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})

	t.Run("Invalid Token", func(t *testing.T) {
		err := service.DeleteResource(context.Background(), "resource-123", "invalid-token")
		if err == nil {
			t.Fatal("expected an error, got none")
		}
	})

	t.Run("Non-existent Resource", func(t *testing.T) {
		// Override handler for this test to return 404
		notFoundHandler := func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusNotFound)
			w.Write([]byte(`{"success":false,"message":"Resource not found"}`))
		}

		notFoundServer := httptest.NewServer(http.HandlerFunc(notFoundHandler))
		defer notFoundServer.Close()

		notFoundService := NewService(notFoundServer.URL, "client-id", "secret")
		err := notFoundService.DeleteResource(context.Background(), "non-existent", "valid-token")
		if err == nil {
			t.Fatal("expected an error, got none")
		}
	})
}

func TestListProjects(t *testing.T) {
	handler := func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			t.Fatalf("expected GET method, got %s", r.Method)
		}
		if r.URL.Path != "/project/v1/" {
			t.Fatalf("expected path /project/v1/, got %s", r.URL.Path)
		}
		if r.Header.Get("Authorization") == "Bearer valid-token" {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"success":true,"data":[{"id":"project-id","name":"Test Project","description":"Project description","tags":["internal","prod"]}]}`))
		} else {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"success":false,"message":"Invalid token"}`))
		}
	}

	ts := httptest.NewServer(http.HandlerFunc(handler))
	defer ts.Close()

	service := NewService(ts.URL, "client-id", "secret")

	t.Run("Valid Token", func(t *testing.T) {
		projects, err := service.ListProjects(context.Background(), "valid-token")
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
		if len(projects) != 1 {
			t.Fatalf("expected 1 project, got %d", len(projects))
		}
		if projects[0].Id != "project-id" {
			t.Fatalf("expected project ID to be 'project-id', got %v", projects[0].Id)
		}
	})

	t.Run("Invalid Token", func(t *testing.T) {
		_, err := service.ListProjects(context.Background(), "invalid-token")
		if err == nil {
			t.Fatal("expected an error, got none")
		}
	})
}

func TestCreateProject(t *testing.T) {
	handler := func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			t.Fatalf("expected POST method, got %s", r.Method)
		}
		if r.URL.Path != "/project/v1/" {
			t.Fatalf("expected path /project/v1/, got %s", r.URL.Path)
		}

		var payload Project
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("expected valid project payload, got %v", err)
		}
		if payload.Name != "Test Project" || payload.Description != "Project description" {
			t.Fatalf("unexpected project payload: %+v", payload)
		}
		if len(payload.Tags) != 2 || payload.Tags[0] != "internal" || payload.Tags[1] != "prod" {
			t.Fatalf("unexpected project tags: %+v", payload.Tags)
		}

		if r.Header.Get("Authorization") == "Bearer valid-token" {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"success":true,"data":{"id":"project-id","name":"Test Project","description":"Project description","tags":["internal","prod"]}}`))
		} else {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"success":false,"message":"Invalid token"}`))
		}
	}

	ts := httptest.NewServer(http.HandlerFunc(handler))
	defer ts.Close()

	service := NewService(ts.URL, "client-id", "secret")
	project := &Project{
		Id:          "project-id",
		Name:        "Test Project",
		Description: "Project description",
		Tags:        []string{"internal", "prod"},
	}

	t.Run("Valid Token", func(t *testing.T) {
		err := service.CreateProject(context.Background(), project, "valid-token")
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})

	t.Run("Invalid Token", func(t *testing.T) {
		err := service.CreateProject(context.Background(), project, "invalid-token")
		if err == nil {
			t.Fatal("expected an error, got none")
		}
	})
}

func TestUpdateProject(t *testing.T) {
	handler := func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPut {
			t.Fatalf("expected PUT method, got %s", r.Method)
		}
		if r.URL.Path != "/project/v1/project-id" {
			t.Fatalf("expected path /project/v1/project-id, got %s", r.URL.Path)
		}

		var payload Project
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			t.Fatalf("expected valid project payload, got %v", err)
		}
		if payload.Name != "Updated Project" || payload.Description != "Updated description" {
			t.Fatalf("unexpected project payload: %+v", payload)
		}
		if len(payload.Tags) != 1 || payload.Tags[0] != "updated" {
			t.Fatalf("unexpected project tags: %+v", payload.Tags)
		}

		if r.Header.Get("Authorization") == "Bearer valid-token" {
			w.WriteHeader(http.StatusOK)
			w.Write([]byte(`{"success":true,"data":{"id":"project-id","name":"Updated Project","description":"Updated description","tags":["updated"]}}`))
		} else {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte(`{"success":false,"message":"Invalid token"}`))
		}
	}

	ts := httptest.NewServer(http.HandlerFunc(handler))
	defer ts.Close()

	service := NewService(ts.URL, "client-id", "secret")
	project := &Project{
		Id:          "project-id",
		Name:        "Updated Project",
		Description: "Updated description",
		Tags:        []string{"updated"},
	}

	t.Run("Valid Token", func(t *testing.T) {
		err := service.UpdateProject(context.Background(), "project-id", project, "valid-token")
		if err != nil {
			t.Fatalf("expected no error, got %v", err)
		}
	})

	t.Run("Invalid Token", func(t *testing.T) {
		err := service.UpdateProject(context.Background(), "project-id", project, "invalid-token")
		if err == nil {
			t.Fatal("expected an error, got none")
		}
	})
}
