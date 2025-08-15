import { GoIamClient } from '../client';
import { GoIamConfig } from '../types';

// Mock fetch for tests
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
// @ts-ignore - Override global fetch for testing
window.fetch = mockFetch;

describe('GoIamClient', () => {
  let client: GoIamClient;
  let config: GoIamConfig;
  let mockStorage: any;

  beforeEach(() => {
    config = {
      baseUrl: 'https://api.example.com',
      clientId: 'test-client-id',
      redirectUrl: 'https://app.example.com/callback',
    };

    mockStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };

    client = new GoIamClient(config, mockStorage);
    mockFetch.mockClear();
  });

  describe('getAuthUrl', () => {
    it('should generate correct auth URL', () => {
      const authUrl = client.getAuthUrl();
      const expected =
        'https://api.example.com/auth/v1/login?client_id=test-client-id&redirect_url=https%3A%2F%2Fapp.example.com%2Fcallback';
      expect(authUrl).toBe(expected);
    });

    it('should handle special characters in URLs', () => {
      const clientWithSpecialChars = new GoIamClient({
        ...config,
        redirectUrl: 'https://app.example.com/callback?param=value&other=test',
      });

      const authUrl = clientWithSpecialChars.getAuthUrl();
      expect(authUrl).toContain(
        'redirect_url=https%3A%2F%2Fapp.example.com%2Fcallback%3Fparam%3Dvalue%26other%3Dtest'
      );
    });
  });

  describe('fetchUserProfile', () => {
    it('should fetch user profile successfully', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        roles: ['user'],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockUser),
      } as Response);

      const user = await client.fetchUserProfile();

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/me/v1',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(user).toEqual(mockUser);
    });

    it('should handle API errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('HTTP 401: Unauthorized'));

      await expect(client.fetchUserProfile()).rejects.toThrow('Unauthorized');
    });
  });

  describe('storage operations', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
    };

    it('should store user data', () => {
      client.storeUser(mockUser);

      expect(mockStorage.setItem).toHaveBeenCalledWith('goiam_user', JSON.stringify(mockUser));
    });

    it('should retrieve user data', () => {
      mockStorage.getItem.mockReturnValue(JSON.stringify(mockUser));

      const user = client.getStoredUser();

      expect(mockStorage.getItem).toHaveBeenCalledWith('goiam_user');
      expect(user).toEqual(mockUser);
    });

    it('should return null for invalid JSON', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      mockStorage.getItem.mockReturnValue('invalid-json');

      const user = client.getStoredUser();

      expect(user).toBeNull();

      // Restore console.error
      consoleSpy.mockRestore();
    });

    it('should clear user data', () => {
      client.clearStoredUser();

      expect(mockStorage.removeItem).toHaveBeenCalledWith('goiam_user');
    });
  });

  describe('hasRequiredRoles', () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      roles: ['user', 'admin'],
    };

    it('should return true when user has all required roles', () => {
      const result = client.hasRequiredRoles(mockUser, ['user']);
      expect(result).toBe(true);
    });

    it('should return true when no roles required', () => {
      const result = client.hasRequiredRoles(mockUser, []);
      expect(result).toBe(true);
    });

    it('should return false when user lacks required roles', () => {
      const result = client.hasRequiredRoles(mockUser, ['super-admin']);
      expect(result).toBe(false);
    });

    it('should return false when user has no roles', () => {
      const userWithoutRoles = { ...mockUser, roles: undefined };
      const result = client.hasRequiredRoles(userWithoutRoles, ['user']);
      expect(result).toBe(false);
    });
  });
});
