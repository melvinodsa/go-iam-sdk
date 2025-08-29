import React from 'react';

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


export interface Setup {
  client_added: boolean
  client_id: string
}

export interface DashboardMeResponse {
  success: boolean
  message: string
  data: {
    setup: Setup
    user: User
  }
}

export interface MeResponse {
  success: boolean
  message: string
  data: User
}


export interface VerifyResponse {
  success: boolean
  message: string
  data: {
    access_token: string
  }
}