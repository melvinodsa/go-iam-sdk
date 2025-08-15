import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { GoIamClient } from './client';
import { GoIamContextValue, GoIamProviderProps, AuthState } from './types';

/**
 * GoIAM React Context
 */
const GoIamContext = createContext<GoIamContextValue | undefined>(undefined);

/**
 * Default loading component
 */
const DefaultLoadingComponent = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '16px',
      color: '#666',
    }}
  >
    Loading...
  </div>
);

/**
 * GoIAM Provider component that manages authentication state
 */
export const GoIamProvider: React.FC<GoIamProviderProps> = ({
  config,
  children,
  loadingComponent: LoadingComponent = DefaultLoadingComponent,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
  });

  const client = new GoIamClient(config);

  /**
   * Login function that redirects to auth URL
   */
  const login = useCallback(() => {
    client.redirectToAuth();
  }, [client]);

  /**
   * Logout function that clears user data
   */
  const logout = useCallback(() => {
    client.clearStoredUser();
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      error: null,
    });
  }, [client]);

  /**
   * Refresh user data from API
   */
  const refreshUser = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const user = await client.fetchAndStoreUser();

      setAuthState({
        isAuthenticated: true,
        isLoading: false,
        user,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch user profile';

      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: errorMessage,
      });
    }
  }, [client]);

  /**
   * Initialize authentication state on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First, check if user data exists in storage
        const storedUser = client.getStoredUser();

        if (storedUser) {
          // User found in storage, try to refresh from API
          try {
            const freshUser = await client.fetchUserProfile();
            client.storeUser(freshUser);

            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              user: freshUser,
              error: null,
            });
          } catch (apiError) {
            // API call failed, but we have stored user data
            console.warn('Failed to refresh user profile, using stored data:', apiError);

            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              user: storedUser,
              error: null,
            });
          }
        } else {
          // No stored user, try to fetch from API (user might be logged in)
          try {
            const user = await client.fetchAndStoreUser();

            setAuthState({
              isAuthenticated: true,
              isLoading: false,
              user,
              error: null,
            });
          } catch (apiError) {
            // No user found, not authenticated
            setAuthState({
              isAuthenticated: false,
              isLoading: false,
              user: null,
              error: null,
            });
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to initialize authentication';

        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          error: errorMessage,
        });
      }
    };

    initializeAuth();
  }, [client]);

  const contextValue: GoIamContextValue = {
    ...authState,
    login,
    logout,
    refreshUser,
    config,
  };

  // Show loading component while initializing
  if (authState.isLoading) {
    return <LoadingComponent />;
  }

  return <GoIamContext.Provider value={contextValue}>{children}</GoIamContext.Provider>;
};

/**
 * Custom hook to access GoIAM context
 * @returns GoIAM context value
 * @throws Error if used outside GoIamProvider
 */
export const useGoIam = (): GoIamContextValue => {
  const context = useContext(GoIamContext);

  if (context === undefined) {
    throw new Error('useGoIam must be used within a GoIamProvider');
  }

  return context;
};
