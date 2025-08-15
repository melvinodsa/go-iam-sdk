// Type imports
import type { GoIamConfig } from './types';

// Main exports
export { GoIamProvider, useGoIam } from './context';
export { AuthGuard, withAuthGuard } from './AuthGuard';
export { GoIamClient } from './client';

// Type exports
export type {
    GoIamConfig,
    User,
    AuthState,
    GoIamContextValue,
    GoIamProviderProps,
    AuthGuardProps,
    UseGoIamReturn,
    ApiResponse,
    ApiError,
    Storage,
} from './types';

// Utility functions
export const createGoIamConfig = (config: Partial<GoIamConfig> & Pick<GoIamConfig, 'baseUrl' | 'clientId' | 'redirectUrl'>): GoIamConfig => ({
    storageKey: 'goiam_user',
    timeout: 10000,
    ...config,
});

// Constants
export const DEFAULT_STORAGE_KEY = 'goiam_user';
export const DEFAULT_TIMEOUT = 10000;
