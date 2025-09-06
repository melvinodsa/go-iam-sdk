import axios, { AxiosInstance } from 'axios';

export interface User {
  id: string;
  project_id: string;
  name: string;
  email: string;
  phone: string;
  enabled: boolean;
  profile_pic: string;
  linked_client_id?: string;
  expiry?: string;
  roles: Record<string, UserRole>;
  resources: Record<string, UserResource>;
  policies: Record<string, UserPolicy>;
  created_at?: string;
  created_by: string;
  updated_at?: string;
  updated_by: string;
}

export interface UserPolicy {
  name: string;
  mapping?: UserPolicyMapping;
}

export interface UserPolicyMapping {
  arguments?: Record<string, UserPolicyMappingValue>;
}

export interface UserPolicyMappingValue {
  static?: string;
}

export interface UserRole {
  id: string;
  name: string;
}

export interface UserResource {
  role_ids: { [key: string]: boolean };
  policy_ids: { [key: string]: boolean };
  key: string;
  name: string;
}

export interface Resource {
  id: string;
  name: string;
  description: string;
  key: string;
  enabled: boolean;
  project_id: string;
  created_at?: string;
  created_by: string;
  updated_at?: string;
  updated_by: string;
  deleted_at?: string;
}

export class GoIamSdk {
  private client: AxiosInstance;

  constructor(
    baseURL: string,
    private clientId: string,
    private secret: string
  ) {
    this.client = axios.create({
      baseURL,
    });
  }

  async verify(code: string): Promise<string> {
    try {
      const response = await this.client.get('/auth/v1/verify', {
        params: { code },
        auth: {
          username: this.clientId,
          password: this.secret,
        },
      });
      return response.data.data.accessToken;
    } catch (error) {
      const err = error as any;
      throw new Error(
        `Failed to verify code: ${err.response?.data?.message || err.message}`
      );
    }
  }

  async me(token: string): Promise<User> {
    try {
      const response = await this.client.get('/me/v1/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    } catch (error) {
      const err = error as any;
      throw new Error(
        `Failed to fetch user information: ${err.response?.data?.message || err.message}`
      );
    }
  }

  async createResource(resource: Resource, token: string): Promise<void> {
    try {
      await this.client.post('/resource/v1/', resource, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      const err = error as any;
      throw new Error(
        `Failed to create resource: ${err.response?.data?.message || err.message}`
      );
    }
  }
}
