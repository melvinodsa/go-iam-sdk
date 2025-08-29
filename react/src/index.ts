

// Main exports
export { useGoIam } from './state';
export { AuthGuard, withAuthGuard } from './AuthGuard';

// Type exports
export type {
  User,
  VerifyResponse,
  DashboardMeResponse,
  MeResponse,
  AuthGuardProps,
  ApiResponse,
  ApiError,
  Storage,
} from './types';

// Constants
export const DEFAULT_STORAGE_KEY = 'goiam_user';
export const DEFAULT_TIMEOUT = 10000;
