import { GoIamConfig, User, ApiResponse, Storage } from './types';

/**
 * GoIAM Client class for handling authentication and API calls
 */
export class GoIamClient {
  private config: GoIamConfig;
  private storage: Storage;

  constructor(config: GoIamConfig, storage?: Storage) {
    this.config = {
      storageKey: 'goiam_user',
      timeout: 10000,
      ...config,
    };

    // Use provided storage or default to localStorage
    this.storage = storage || {
      getItem: (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return null;
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      },
      removeItem: (key: string) => {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      },
    };
  }

  /**
   * Generate authentication URL
   * @returns Complete authentication URL
   */
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_url: this.config.redirectUrl,
    });

    return `${this.config.baseUrl}/auth/v1/login?${params.toString()}`;
  }

  /**
   * Redirect to authentication URL
   */
  redirectToAuth(): void {
    if (typeof window !== 'undefined') {
      window.location.href = this.getAuthUrl();
    }
  }

  /**
   * Fetch user profile from /me/v1 endpoint
   * @returns Promise resolving to user data
   */
  async fetchUserProfile(): Promise<User> {
    try {
      const response = await this.makeApiCall<User>('/me/v1', {
        method: 'GET',
      });

      return response.data;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * Store user data in local storage
   * @param user User data to store
   */
  storeUser(user: User): void {
    try {
      const userData = JSON.stringify(user);
      this.storage.setItem(this.config.storageKey!, userData);
    } catch (error) {
      console.error('Failed to store user data:', error);
    }
  }

  /**
   * Retrieve user data from local storage
   * @returns User data or null if not found
   */
  getStoredUser(): User | null {
    try {
      const userData = this.storage.getItem(this.config.storageKey!);
      if (userData) {
        return JSON.parse(userData) as User;
      }
      return null;
    } catch (error) {
      console.error('Failed to retrieve user data:', error);
      return null;
    }
  }

  /**
   * Clear user data from storage
   */
  clearStoredUser(): void {
    try {
      this.storage.removeItem(this.config.storageKey!);
    } catch (error) {
      console.error('Failed to clear user data:', error);
    }
  }

  /**
   * Fetch and store user profile
   * @returns Promise resolving to user data
   */
  async fetchAndStoreUser(): Promise<User> {
    const user = await this.fetchUserProfile();
    this.storeUser(user);
    return user;
  }

  /**
   * Check if user has required roles
   * @param user User object
   * @param requiredResources Array of required resources
   * @returns Boolean indicating if user has required resources
   */
  hasRequiredResources(user: User, requiredResources: string[]): boolean {
    if (!requiredResources || requiredResources.length === 0) {
      return true;
    }

    if (!user.resources || Object.keys(user.resources).length === 0) {
      return false;
    }

    return requiredResources.every(resource => user.resources[resource]);
  }

  /**
   * Make API call to GoIAM server
   * @param endpoint API endpoint
   * @param options Fetch options
   * @returns Promise resolving to API response
   */
  private async makeApiCall<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...defaultOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        data,
        status: response.status,
        message: data.message,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Handle API errors
   * @param error Error object
   * @returns Formatted API error
   */
  private handleApiError(error: any): Error {
    if (error.name === 'AbortError') {
      return new Error('Request timeout');
    }

    if (error instanceof Error) {
      const match = error.message.match(/HTTP (\d+): (.+)/);
      if (match) {
        return new Error(match[2]);
      }

      return error;
    }

    return new Error('An unknown error occurred');
  }
}
