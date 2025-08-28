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
  /** Unique identifier for the project to which user belongs */
  project_id: string;
  /** User's email address */
  email: string;
  /** User's display name */
  name?: string;
  /** User's phone number */
  phone?: string;
  /** Whether the user is enabled */
  enabled: boolean;
  /** User's profile picture URL */
  profile_pic?: string;
  /** User's account expiry date */
  expiry?: string;
  /** User's roles */
  roles: Record<string, UserRole>;
  /** User's resources */
  resources: Record<string, UserResource>;
  /** User's policies */
  policies: Record<string, UserPolicy>;
  /** User's creation timestamp */
  created_at?: string;
  /** User's creator */
  created_by: string;
  /** User's last updated timestamp */
  updated_at?: string;
  /** User's last updater */
  updated_by: string;
}

export interface UserPolicy {
  /** Name of the policy */
  name: string;
  /** Policy mapping */
  mapping: UserPolicyMapping;
}

export interface UserPolicyMapping {
  /** Mapping of policy arguments */
  arguments: Record<string, UserPolicyMappingValue>;
}

export interface UserPolicyMappingValue {
  /** Static value for the policy argument */
  static: string;
}

export interface UserRole {
  /** Unique identifier for the role */
  id: string;
  /** Name of the role */
  name: string;
}

export interface UserResource {
  /** Mapping of role IDs to their enabled status */
  role_ids: { [key: string]: boolean };
  /** Mapping of policy IDs to their enabled status */
  policy_ids: { [key: string]: boolean };
  /** Name of the resource */
  name: string;
  /** Key of the resource */
  key: string;
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
  /** hasRequiredResources checks if the user has the required resources */
  hasRequiredResources: (resources: string[]) => boolean;
  /** Get access token using authorization code and code challenge */
  getAccessToken: (codeChallenge: string, code: string) => Promise<string | null>;
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
  /** Required resources for access */
  requiredResources?: string[];
  /** Component to render when user doesn't have required resources */
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
export interface UseGoIamReturn extends GoIamContextValue { }

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
