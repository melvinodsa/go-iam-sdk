import React from 'react';
import { useGoIam } from './context';
import { AuthGuardProps } from './types';

/**
 * Default component for unauthenticated users
 */
const DefaultUnauthenticatedComponent = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '16px',
      color: '#666',
    }}
  >
    <h2 style={{ marginBottom: '16px', color: '#333' }}>Authentication Required</h2>
    <p>Please log in to access this content.</p>
  </div>
);

/**
 * Default component for users without required roles
 */
const DefaultUnauthorizedComponent = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      fontSize: '16px',
      color: '#666',
    }}
  >
    <h2 style={{ marginBottom: '16px', color: '#333' }}>Access Denied</h2>
    <p>You don't have the required permissions to access this content.</p>
  </div>
);

/**
 * AuthGuard component that protects routes based on authentication and roles
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback: FallbackComponent = DefaultUnauthenticatedComponent,
  redirectToLogin = false,
  requiredRoles = [],
  unauthorizedComponent: UnauthorizedComponent = DefaultUnauthorizedComponent,
}) => {
  const { isAuthenticated, isLoading, user, login } = useGoIam();

  // Show loading state
  if (isLoading) {
    return (
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
        Checking authentication...
      </div>
    );
  }

  // Handle unauthenticated users
  if (!isAuthenticated) {
    if (redirectToLogin) {
      // Automatically redirect to login
      React.useEffect(() => {
        login();
      }, [login]);

      return (
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
          Redirecting to login...
        </div>
      );
    }

    // Show fallback component
    return <FallbackComponent />;
  }

  // Check role-based authorization
  if (requiredRoles.length > 0 && user) {
    const userRoles = user.roles || [];
    const hasRequiredRoles = requiredRoles.every(role => userRoles.includes(role));

    if (!hasRequiredRoles) {
      return <UnauthorizedComponent />;
    }
  }

  // User is authenticated and authorized
  return <>{children}</>;
};

/**
 * Higher-order component version of AuthGuard
 */
export const withAuthGuard = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  guardOptions: Omit<AuthGuardProps, 'children'> = {}
) => {
  const AuthGuardedComponent: React.FC<P> = props => (
    <AuthGuard {...guardOptions}>
      <WrappedComponent {...props} />
    </AuthGuard>
  );

  AuthGuardedComponent.displayName = `withAuthGuard(${WrappedComponent.displayName || WrappedComponent.name})`;

  return AuthGuardedComponent;
};
