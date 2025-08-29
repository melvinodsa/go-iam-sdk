# GoIAM React SDK

A React SDK for integrating with Go-IAM (Identity and Access Management) server. This package provides React hooks and utilities for handling authentication in your React applications using [Hookstate](https://hookstate.js.org/) for optimal performance and minimal re-renders.

## Installation

```bash
npm install @goiam/react
```

or

```bash
yarn add @goiam/react
```

## Features

- 🔐 **Easy Authentication**: Simple integration with Go-IAM server
- � **High Performance**: Built with Hookstate for minimal re-renders
- 🎯 **Resource-Based Access Control**: Support for resource-based authorization
- 🪝 **Simple Hook API**: Easy access to authentication state and methods
- 💾 **Persistent Storage**: Automatic user data storage and retrieval
- 🔄 **Auto Refresh**: Automatic user profile updates with smart caching
- 📱 **TypeScript Support**: Full TypeScript support with comprehensive types
- ⚡ **PKCE Support**: Secure OAuth2 PKCE flow implementation

## Quick Start

### 1. Basic Setup

No provider needed! Just start using the hook:

```tsx
import React from 'react';
import { useGoIam } from '@goiam/react';

function LoginButton() {
  const { user, login, logout, loadedState } = useGoIam();

  if (!loadedState) {
    return <div>Loading...</div>;
  }

  if (user) {
    return (
      <div>
        <p>Welcome, {user.name || user.email}!</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return <button onClick={login}>Login</button>;
}
```

### 2. Configure Your App

Set up the base URL and client ID:

```tsx
import React, { useEffect } from 'react';
import { useGoIam } from '@goiam/react';

function App() {
  const { setBaseUrl, setClientId, dashboardMe } = useGoIam();

  useEffect(() => {
    // Configure the SDK
    setBaseUrl('https://your-goiam-server.com');
    setClientId('your-client-id');

    // Load user data on app start
    dashboardMe();
  }, [setBaseUrl, setClientId, dashboardMe]);

  return <div>Your App Content</div>;
}
```

### 3. Handle Authentication Callback

Complete authentication after redirect from GoIAM server:

```tsx
import React, { useEffect } from 'react';
import { useGoIam } from '@goiam/react';

function CallbackScreen() {
  const { user, verify, loadedState, verifying } = useGoIam();

  useEffect(() => {
    // Extract parameters from URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const codeChallenge = localStorage.getItem('code_challenge'); // Stored during login

    if (code && codeChallenge && !user && !verifying) {
      // Complete authentication
      verify(codeChallenge, code);
    }
  }, [verify, user, verifying]);

  if (verifying) {
    return <div>Completing authentication...</div>;
  }

  if (!loadedState) {
    return <div>Loading...</div>;
  }

  if (user) {
    return (
      <div>
        <p>Welcome back, {user.name || user.email}!</p>
        <a href="/">Go to Dashboard</a>
      </div>
    );
  }

  return <div>Authentication failed. Please try again.</div>;
}
```

### 4. Resource-Based Access Control

Check user permissions:

```tsx
import React from 'react';
import { useGoIam } from '@goiam/react';

function AdminPanel() {
  const { user, hasRequiredResources } = useGoIam();

  if (!user) {
    return <div>Please log in to access this area.</div>;
  }

  if (!hasRequiredResources(['admin', 'user_management'])) {
    return <div>You don't have permission to access this area.</div>;
  }

  return (
    <div>
      <h2>Admin Panel</h2>
      <p>Welcome to the admin area!</p>
    </div>
  );
}
```

### 5. Using AuthGuard for Route Protection

Protect your routes with the AuthGuard component:

```tsx
import React from 'react';
import { AuthGuard } from '@goiam/react';

// Basic route protection
function ProtectedRoute() {
  return (
    <AuthGuard>
      <div>This content is only visible to authenticated users!</div>
    </AuthGuard>
  );
}

// Auto-redirect to login
function AutoRedirectRoute() {
  return (
    <AuthGuard redirectToLogin={true}>
      <div>Protected content with auto redirect</div>
    </AuthGuard>
  );
}

// Resource-based protection
function AdminRoute() {
  return (
    <AuthGuard requiredResources={['admin']}>
      <div>Admin-only content</div>
    </AuthGuard>
  );
}

// Custom fallback components
function CustomFallbackRoute() {
  const CustomLogin = () => (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h3>🔒 Login Required</h3>
      <p>Please sign in to continue</p>
    </div>
  );

  const CustomUnauthorized = () => (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h3>⛔ Access Denied</h3>
      <p>You need admin permissions</p>
    </div>
  );

  return (
    <AuthGuard
      requiredResources={['admin']}
      fallback={CustomLogin}
      unauthorizedComponent={CustomUnauthorized}
    >
      <div>Protected admin content</div>
    </AuthGuard>
  );
}
```

#### Using the withAuthGuard HOC

For component-based protection:

```tsx
import React from 'react';
import { withAuthGuard } from '@goiam/react';

// Basic component protection
const ProtectedComponent = () => <div>This component is protected!</div>;

export const GuardedComponent = withAuthGuard(ProtectedComponent);

// With guard options
const AdminComponent = () => <div>Admin dashboard content</div>;

export const GuardedAdminComponent = withAuthGuard(AdminComponent, {
  requiredResources: ['admin'],
  redirectToLogin: true,
});

// Usage in your app
function App() {
  return (
    <div>
      <GuardedComponent />
      <GuardedAdminComponent />
    </div>
  );
}
```

#### AuthGuard Props

| Prop                    | Type            | Default                           | Description                                               |
| ----------------------- | --------------- | --------------------------------- | --------------------------------------------------------- |
| `children`              | `ReactNode`     | -                                 | Content to render when authenticated and authorized       |
| `fallback`              | `ComponentType` | `DefaultUnauthenticatedComponent` | Component to show when user is not authenticated          |
| `redirectToLogin`       | `boolean`       | `false`                           | Automatically redirect to login page if not authenticated |
| `requiredResources`     | `string[]`      | `[]`                              | Array of required resource permissions                    |
| `unauthorizedComponent` | `ComponentType` | `DefaultUnauthorizedComponent`    | Component to show when user lacks required resources      |

## API Reference

### useGoIam Hook

The main hook to access authentication state and methods. Built with Hookstate for optimal performance.

```tsx
const {
  // State
  user, // User | undefined: Current user data
  loadedState, // boolean: Whether initial data load is complete
  clientAvailable, // boolean: Whether client is properly configured
  verifying, // boolean: Whether verification is in progress
  loadingMe, // boolean: Whether user data is being fetched
  verified, // boolean: Whether user has verified their account
  err, // string: Any error message
  baseUrl, // string: Current base URL
  clientId, // string: Current client ID
  loginPageUrl, // string: Login page URL
  callbackPageUrl, // string: Callback page URL

  // Actions
  login, // () => void: Redirect to login
  logout, // () => void: Clear user data and logout
  verify, // (codeChallenge: string, code: string) => Promise<void>: Complete authentication
  dashboardMe, // (dontUpdateTime?: boolean) => Promise<void>: Fetch user dashboard data
  me, // () => Promise<void>: Fetch user profile
  hasRequiredResources, // (resources: string[]) => boolean: Check user permissions

  // Configuration
  setBaseUrl, // (url: string) => void: Set API base URL
  setClientId, // (id: string) => void: Set client ID
  setLoginPageUrl, // (url: string) => void: Set login page URL
  setCallbackPageUrl, // (url: string) => void: Set callback page URL
  setLoadingMe, // (loading: boolean) => void: Set loading state
} = useGoIam();
```

### Key Methods

#### `dashboardMe(dontUpdateTime?: boolean)`

Fetches user dashboard data including setup information and user profile. Includes smart caching - skips API call if data was fetched recently (within 5 minutes) unless `dontUpdateTime` is true.

```tsx
// Standard fetch with caching
await dashboardMe();

// Force fetch, bypass cache
await dashboardMe(true);
```

#### `verify(codeChallenge: string, code: string)`

Completes the OAuth2 PKCE authentication flow with the authorization code and code challenge.

```tsx
const codeChallenge = localStorage.getItem('code_challenge');
const code = new URLSearchParams(window.location.search).get('code');
await verify(codeChallenge, code);
```

#### `hasRequiredResources(resources: string[])`

Checks if the current user has all the specified resources/permissions.

```tsx
// Check single resource
const canAdmin = hasRequiredResources(['admin']);

// Check multiple resources (user must have ALL)
const canManageUsers = hasRequiredResources(['admin', 'user_management']);
```

### User Data Structure

```tsx
interface User {
  id: string;
  name: string;
  email: string;
  profile_pic: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  enabled: boolean;
  expiry: string;
  resources: Record<string, Resource>; // Resource permissions
  roles: Record<string, Role>; // User roles
}

interface Resource {
  id: string;
  key: string;
  name: string;
}

interface Role {
  id: string;
  name: string;
}
```

## Authentication Flow

1. **Initialization**: Hook checks for stored user data and validates with API
2. **Configuration**: Set base URL and client ID using `setBaseUrl()` and `setClientId()`
3. **Login**: User clicks login → generates PKCE challenge → redirects to GoIAM auth URL
4. **Callback**: After successful authentication, user returns to your app with authorization code
5. **Verification**: Call `verify()` with code challenge and authorization code
6. **Profile Fetch**: SDK automatically fetches and stores user profile data
7. **State Management**: Authentication state is maintained globally with Hookstate

## Smart Caching

The SDK includes intelligent caching to reduce API calls:

- **Dashboard data**: Cached for 5 minutes, automatically skips refetch if recently updated
- **Local storage sync**: User data persisted automatically and synced on app load
- **Timestamp tracking**: Tracks when data was last updated to make caching decisions

```tsx
// Will use cache if data fetched within last 5 minutes
await dashboardMe();

// Forces fresh fetch, ignores cache
await dashboardMe(true);
```

## Error Handling

The SDK provides comprehensive error handling through the `err` state:

```tsx
function MyComponent() {
  const { err, loadedState } = useGoIam();

  if (err) {
    return <div>Authentication error: {err}</div>;
  }

  if (!loadedState) {
    return <div>Loading...</div>;
  }

  // Render authenticated content
}
```

## Advanced Usage

### Custom Configuration

Set different URLs for login and callback pages:

```tsx
function App() {
  const { setLoginPageUrl, setCallbackPageUrl } = useGoIam();

  useEffect(() => {
    setLoginPageUrl('/custom-login');
    setCallbackPageUrl('/auth/callback');
  }, [setLoginPageUrl, setCallbackPageUrl]);
}
```

### Manual State Management

Control loading states manually if needed:

```tsx
function CustomLoader() {
  const { setLoadingMe, loadingMe } = useGoIam();

  const handleCustomLoad = async () => {
    setLoadingMe(true);
    try {
      // Custom loading logic
    } finally {
      setLoadingMe(false);
    }
  };

  return (
    <div>
      {loadingMe && <div>Loading...</div>}
      <button onClick={handleCustomLoad}>Load Data</button>
    </div>
  );
}
```

### Resource-Based Conditional Rendering

```tsx
function ConditionalContent() {
  const { hasRequiredResources } = useGoIam();

  return (
    <div>
      {hasRequiredResources(['view_dashboard']) && <DashboardWidget />}

      {hasRequiredResources(['admin', 'user_management']) && <AdminTools />}

      {hasRequiredResources(['billing']) ? (
        <BillingSection />
      ) : (
        <div>Upgrade to access billing features</div>
      )}
    </div>
  );
}
```

## TypeScript Support

The SDK is built with TypeScript and provides comprehensive type definitions:

```tsx
import { useGoIam } from '@goiam/react';
import type { User } from '@goiam/react';

// Type-safe user handling
const handleUser = (user: User) => {
  console.log(`Welcome ${user.name}!`);
  console.log('User resources:', Object.keys(user.resources));
};

// Type-safe hook usage
const MyComponent = () => {
  const {
    user,
    hasRequiredResources,
    setBaseUrl,
  }: {
    user: User | undefined;
    hasRequiredResources: (resources: string[]) => boolean;
    setBaseUrl: (url: string) => void;
  } = useGoIam();

  return <div>Typed component</div>;
};
```

## Examples

### Complete App Setup

```tsx
import React, { useEffect } from 'react';
import { useGoIam } from '@goiam/react';

function App() {
  return (
    <div>
      <AuthSetup />
      <Router />
    </div>
  );
}

function AuthSetup() {
  const { setBaseUrl, setClientId, dashboardMe } = useGoIam();

  useEffect(() => {
    // Configure SDK
    setBaseUrl(process.env.REACT_APP_GOIAM_URL!);
    setClientId(process.env.REACT_APP_CLIENT_ID!);

    // Load initial user data
    dashboardMe();
  }, [setBaseUrl, setClientId, dashboardMe]);

  return null;
}

function Router() {
  const { user, loadedState } = useGoIam();

  if (!loadedState) {
    return <div>Loading app...</div>;
  }

  return <div>{user ? <Dashboard /> : <LoginPage />}</div>;
}

function Dashboard() {
  const { user, logout, hasRequiredResources } = useGoIam();

  return (
    <div>
      <header>
        <h1>Welcome, {user?.name}!</h1>
        <button onClick={logout}>Logout</button>
      </header>

      <main>
        {hasRequiredResources(['admin']) && <AdminPanel />}
        {hasRequiredResources(['billing']) && <BillingSection />}
        <UserProfile />
      </main>
    </div>
  );
}

function LoginPage() {
  const { login } = useGoIam();

  return (
    <div>
      <h1>Please log in</h1>
      <button onClick={login}>Login with GoIAM</button>
    </div>
  );
}
```

### Callback Handler

```tsx
import React, { useEffect, useState } from 'react';
import { useGoIam } from '@goiam/react';

function CallbackPage() {
  const { verify, verifying, user } = useGoIam();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const codeChallenge = localStorage.getItem('code_challenge');

        if (!code) {
          setError('No authorization code received');
          return;
        }

        if (!codeChallenge) {
          setError('No code challenge found in storage');
          return;
        }

        await verify(codeChallenge, code);

        // Clean up
        localStorage.removeItem('code_challenge');

        // Redirect to app
        window.location.href = '/dashboard';
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleCallback();
  }, [verify]);

  if (error) {
    return (
      <div>
        <h2>Authentication Error</h2>
        <p>{error}</p>
        <a href="/login">Try Again</a>
      </div>
    );
  }

  if (verifying) {
    return <div>Completing authentication...</div>;
  }

  if (user) {
    return <div>Authentication successful! Redirecting...</div>;
  }

  return <div>Processing...</div>;
}
```

## Performance Benefits

### Why Hookstate?

This SDK uses [Hookstate](https://hookstate.js.org/) instead of React Context for several performance advantages:

- **Minimal Re-renders**: Only components that use specific state properties re-render when those properties change
- **Global State**: No provider wrapper needed - state is globally accessible
- **Selective Subscriptions**: Components automatically subscribe only to the state they actually use
- **Optimized Updates**: Fine-grained reactivity ensures optimal performance even with complex state

### Performance Comparison

```tsx
// ❌ With React Context - entire context re-renders
const { user, isLoading, error, config, methods } = useGoIam(); // Re-renders on ANY change

// ✅ With Hookstate - only re-renders when `user` changes
const { user } = useGoIam(); // Only re-renders when user changes

// ✅ Multiple selective subscriptions
const UserName = () => {
  const { user } = useGoIam(); // Only subscribes to user
  return <span>{user?.name}</span>;
};

const LoadingSpinner = () => {
  const { loadingMe } = useGoIam(); // Only subscribes to loadingMe
  return loadingMe ? <Spinner /> : null;
};
```

## Upgrade Guide

### From React Context Version

If you're upgrading from a previous React Context-based version:

**Before (Context):**

```tsx
// Old provider setup
<GoIamProvider config={config}>
  <App />
</GoIamProvider>;

// Old hook usage
const { isAuthenticated, isLoading } = useGoIam();
```

**After (Hookstate):**

```tsx
// No provider needed!
<App />;

// New hook usage with different property names
const { user, loadedState } = useGoIam();
const isAuthenticated = !!user;
const isLoading = !loadedState;
```

**Key Changes:**

- Remove `GoIamProvider` wrapper
- `isAuthenticated` → check `!!user`
- `isLoading` → check `!loadedState`
- `refreshUser()` → `dashboardMe()` or `me()`
- `getAccessToken()` → `verify()`
- `requiredRoles` → `hasRequiredResources()`

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
npm run test:coverage
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## Troubleshooting

### Common Issues

**Q: User data not persisting across browser sessions**
A: The SDK automatically saves user data to localStorage. Ensure your app domain allows localStorage access.

**Q: Authentication redirects not working**
A: Verify your `callbackPageUrl` matches the redirect URI configured in your GoIAM server.

**Q: Resource checks always return false**
A: Ensure you've called `dashboardMe()` to load user data with resources after authentication.

**Q: App stuck in loading state**
A: Check browser console for errors and ensure `setBaseUrl()` and `setClientId()` are called before `dashboardMe()`.

### Debug Mode

Enable debug logging in development:

```tsx
// The SDK logs debug information to console.debug()
// Open browser DevTools and enable "Verbose" log level to see:
// - API call timing
// - Cache hit/miss decisions
// - User data updates
// - Authentication flow steps
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [GitHub Repository](https://github.com/melvinodsa/go-iam-sdk)
- **Issues**: [GitHub Issues](https://github.com/melvinodsa/go-iam-sdk/issues)
- **Email**: melvinodsa@gmail.com

## Changelog

### 0.3.0 (Latest)

- **BREAKING**: Migrated from React Context to Hookstate for better performance
- **BREAKING**: Removed `GoIamProvider` - no provider wrapper needed
- **BREAKING**: API changes: `isAuthenticated` → `!!user`, `isLoading` → `!loadedState`
- **NEW**: Smart caching with 5-minute API call throttling
- **NEW**: Resource-based access control with `hasRequiredResources()`
- **NEW**: PKCE OAuth2 flow support
- **NEW**: Comprehensive TypeScript types
- **IMPROVED**: Minimal re-renders with selective state subscriptions
- **IMPROVED**: Better error handling and debug logging
- **IMPROVED**: Automatic localStorage persistence and sync

### 0.2.0

- Added AuthGuard component
- Enhanced TypeScript support
- Improved error handling

### 0.1.0

- Initial release
- Basic authentication flow
- Context provider and hook
- TypeScript support
