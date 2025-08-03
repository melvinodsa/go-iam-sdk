package golang

import (
	"context"
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
