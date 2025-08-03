import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { GoIamSdk, User, Resource } from './index';

describe('GoIamSdk', () => {
    let mock: InstanceType<typeof MockAdapter>;
    let sdk: GoIamSdk;

    beforeEach(() => {
        mock = new MockAdapter(axios);
        sdk = new GoIamSdk('https://go-iam.example.com', 'client-id', 'secret');
    });

    afterEach(() => {
        mock.reset();
    });

    describe('verify', () => {
        it('should return access token for valid code', async () => {
            mock.onGet('/auth/v1/verify', { params: { code: 'valid-code' } }).reply(200, {
                data: { accessToken: 'test-token' },
            });

            const token = await sdk.verify('valid-code');
            expect(token).toBe('test-token');
        });

        it('should throw an error for invalid code', async () => {
            mock.onGet('/auth/v1/verify', { params: { code: 'invalid-code' } }).reply(401, {
                message: 'Invalid code',
            });

            await expect(sdk.verify('invalid-code')).rejects.toThrow('Failed to verify code: Invalid code');
        });
    });

    describe('me', () => {
        it('should return user information for valid token', async () => {
            mock.onGet('/me/v1/me').reply(200, {
                data: { id: 'user-id', name: 'Test User' },
            });

            const user: User = await sdk.me('valid-token');
            expect(user.id).toBe('user-id');
            expect(user.name).toBe('Test User');
        });

        it('should throw an error for invalid token', async () => {
            mock.onGet('/me/v1/me').reply(401, {
                message: 'Invalid token',
            });

            await expect(sdk.me('invalid-token')).rejects.toThrow('Failed to fetch user information: Invalid token');
        });
    });

    describe('createResource', () => {
        it('should create a resource for valid token', async () => {
            mock.onPost('/resource/v1/').reply(201);

            const resource: Resource = {
                id: 'resource-id',
                name: 'Test Resource',
                description: 'A test resource',
                key: 'test-key',
                enabled: true,
                projectId: 'project-id',
                createdBy: 'creator',
                updatedBy: 'updater',
            };

            await expect(sdk.createResource(resource, 'valid-token')).resolves.toBeUndefined();
        });

        it('should throw an error for invalid token', async () => {
            mock.onPost('/resource/v1/').reply(401, {
                message: 'Invalid token',
            });

            const resource: Resource = {
                id: 'resource-id',
                name: 'Test Resource',
                description: 'A test resource',
                key: 'test-key',
                enabled: true,
                projectId: 'project-id',
                createdBy: 'creator',
                updatedBy: 'updater',
            };

            await expect(sdk.createResource(resource, 'invalid-token')).rejects.toThrow('Failed to create resource: Invalid token');
        });
    });
});
