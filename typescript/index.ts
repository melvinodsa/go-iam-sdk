import axios, { AxiosInstance } from 'axios';

export interface User {
    id: string;
    projectId: string;
    name: string;
    email: string;
    phone: string;
    enabled: boolean;
    profilePic: string;
    expiry?: string;
    roles: Record<string, UserRole>;
    resources: Record<string, UserResource>;
    policies: Record<string, string>;
    createdAt?: string;
    createdBy: string;
    updatedAt?: string;
    updatedBy: string;
}

export interface UserRole {
    id: string;
    name: string;
}

export interface UserResource {
    id: string;
    key: string;
    name: string;
}

export interface Resource {
    id: string;
    name: string;
    description: string;
    key: string;
    enabled: boolean;
    projectId: string;
    createdAt?: string;
    createdBy: string;
    updatedAt?: string;
    updatedBy: string;
    deletedAt?: string;
}

export class GoIamSdk {
    private client: AxiosInstance;

    constructor(baseURL: string, private clientId: string, private secret: string) {
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
            throw new Error(`Failed to verify code: ${error.response?.data?.message || error.message}`);
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
            throw new Error(`Failed to fetch user information: ${error.response?.data?.message || error.message}`);
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
            throw new Error(`Failed to create resource: ${error.response?.data?.message || error.message}`);
        }
    }
}
