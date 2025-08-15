import React from 'react';

/**
 * Configuration interface for GoIAM client
 */
export interface GoIamConfig {
  /** Base URL of the GoIAM server */
  baseUrl: string;
  /** Client ID for authentication */
  clientId: string;
  /** Redirect URL after authentication */
  redirectUrl: string;
  /** Storage key for user data (optional, defaults to 'goiam_user') */
  storageKey?: string;
  /** API timeout in milliseconds (optional, defaults to 10000) */
  timeout?: number;
}

/**
 * User profile data structure
 */
export interface User {
  /** Unique identifier for the user */
  id: string;
  /** User's email address */
  email: string;
  /** User's display name */
  name?: string;
  /** User's username */
  username?: string;
  /** User's profile picture URL */
  avatar?: string;
  /** User's roles */
  roles?: string[];
  /** Additional user metadata */
  metadata?: Record<string, any>;
  /** Timestamp when the user was created */
  createdAt?: string;
  /** Timestamp when the user was last updated */
  updatedAt?: string;
}

/**
 * Authentication state interface
 */
export interface AuthState {
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Whether authentication is being checked */
  isLoading: boolean;
  /** Current user data */
  user: User | null;
  /** Any authentication error */
  error: string | null;
}

/**
 * GoIAM context value interface
 */
export interface GoIamContextValue extends AuthState {
  /** Login function that redirects to auth URL */
  login: () => void;
  /** Logout function that clears user data */
  logout: () => void;
  /** Function to refresh user data */
  refreshUser: () => Promise<void>;
  /** GoIAM configuration */
  config: GoIamConfig;
}

/**
 * Props for GoIamProvider component
 */
export interface GoIamProviderProps {
  /** GoIAM configuration */
  config: GoIamConfig;
  /** Child components */
  children: React.ReactNode;
  /** Custom loading component */
  loadingComponent?: React.ComponentType;
}

/**
 * Props for AuthGuard component
 */
export interface AuthGuardProps {
  /** Child components to render when authenticated */
  children: React.ReactNode;
  /** Component to render when not authenticated */
  fallback?: React.ComponentType;
  /** Redirect to login if not authenticated */
  redirectToLogin?: boolean;
  /** Required roles for access */
  requiredRoles?: string[];
  /** Component to render when user doesn't have required roles */
  unauthorizedComponent?: React.ComponentType;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T = any> {
  /** Response data */
  data: T;
  /** Response status */
  status: number;
  /** Response message */
  message?: string;
}

/**
 * Error response structure
 */
export interface ApiError {
  /** Error message */
  message: string;
  /** Error code */
  code?: string;
  /** HTTP status code */
  status?: number;
  /** Additional error details */
  details?: Record<string, any>;
}

/**
 * Hook return type for useGoIam
 */
export interface UseGoIamReturn extends GoIamContextValue {}

/**
 * Storage interface for user data persistence
 */
export interface Storage {
  /** Get item from storage */
  getItem: (key: string) => string | null;
  /** Set item in storage */
  setItem: (key: string, value: string) => void;
  /** Remove item from storage */
  removeItem: (key: string) => void;
}
