# GoIAM React SDK

A React SDK for integrating with Go-IAM (Identity and Access Management) server. This package provides React components, hooks, and utilities for handling authentication in your React applications.

## Installation

```bash
npm install @goiam/react
# or
yarn add @goiam/react
```

## Features

- 🔐 **Easy Authentication**: Simple integration with Go-IAM server
- 🛡️ **Auth Guard Component**: Protect routes and components based on authentication status
- 🎯 **Role-Based Access Control**: Support for role-based authorization
- 📦 **React Context Provider**: Centralized authentication state management
- 🪝 **Custom Hooks**: Easy access to authentication state and methods
- 💾 **Persistent Storage**: Automatic user data storage and retrieval
- 🔄 **Auto Refresh**: Automatic user profile updates
- 📱 **TypeScript Support**: Full TypeScript support with comprehensive types

## Quick Start

### 1. Setup the Provider

Wrap your application with the `GoIamProvider`:

```tsx
import React from 'react';
import { GoIamProvider, createGoIamConfig } from '@goiam/react';
import App from './App';

const config = createGoIamConfig({
  baseUrl: 'https://your-goiam-server.com',
  clientId: 'your-client-id',
  redirectUrl: 'https://your-app.com/callback',
});

function Root() {
  return (
    <GoIamProvider config={config}>
      <App />
    </GoIamProvider>
  );
}

export default Root;
```

### 2. Use the Auth Hook

Access authentication state and methods:

```tsx
import React from 'react';
import { useGoIam } from '@goiam/react';

function LoginButton() {
  const { isAuthenticated, user, login, logout, isLoading } = useGoIam();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated && user) {
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

### 3. Protect Routes with Auth Guard

Use the `AuthGuard` component to protect routes:

```tsx
import React from 'react';
import { AuthGuard } from '@goiam/react';
import Dashboard from './Dashboard';

function ProtectedDashboard() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}

// With automatic redirect to login
function AutoRedirectDashboard() {
  return (
    <AuthGuard redirectToLogin={true}>
      <Dashboard />
    </AuthGuard>
  );
}

// With role-based access control
function AdminDashboard() {
  return (
    <AuthGuard requiredRoles={['admin']}>
      <Dashboard />
    </AuthGuard>
  );
}
```

## API Reference

### GoIamProvider

The main provider component that manages authentication state.

#### Props

| Prop               | Type            | Required | Description                    |
| ------------------ | --------------- | -------- | ------------------------------ |
| `config`           | `GoIamConfig`   | Yes      | Configuration object for GoIAM |
| `children`         | `ReactNode`     | Yes      | Child components               |
| `loadingComponent` | `ComponentType` | No       | Custom loading component       |

#### GoIamConfig

```tsx
interface GoIamConfig {
  baseUrl: string; // GoIAM server base URL
  clientId: string; // Your client ID
  redirectUrl: string; // Callback URL after authentication
  storageKey?: string; // Storage key for user data (default: 'goiam_user')
  timeout?: number; // API timeout in milliseconds (default: 10000)
}
```

### useGoIam Hook

Custom hook to access authentication state and methods.

```tsx
const {
  isAuthenticated, // boolean: Whether user is authenticated
  isLoading, // boolean: Whether auth state is being determined
  user, // User | null: Current user data
  error, // string | null: Any authentication error
  login, // () => void: Redirect to login
  logout, // () => void: Clear user data and logout
  refreshUser, // () => Promise<void>: Refresh user data from API
  config, // GoIamConfig: Current configuration
} = useGoIam();
```

### AuthGuard Component

Component to protect routes based on authentication and roles.

#### Props

| Prop                    | Type            | Required | Description                             |
| ----------------------- | --------------- | -------- | --------------------------------------- |
| `children`              | `ReactNode`     | Yes      | Components to render when authorized    |
| `fallback`              | `ComponentType` | No       | Component for unauthenticated users     |
| `redirectToLogin`       | `boolean`       | No       | Auto-redirect to login (default: false) |
| `requiredRoles`         | `string[]`      | No       | Required roles for access               |
| `unauthorizedComponent` | `ComponentType` | No       | Component for unauthorized users        |

#### Example Usage

```tsx
// Basic protection
<AuthGuard>
  <ProtectedContent />
</AuthGuard>

// With custom fallback
<AuthGuard fallback={CustomLoginComponent}>
  <ProtectedContent />
</AuthGuard>

// With role-based access
<AuthGuard
  requiredRoles={['admin', 'moderator']}
  unauthorizedComponent={AccessDenied}
>
  <AdminPanel />
</AuthGuard>

// Auto-redirect to login
<AuthGuard redirectToLogin={true}>
  <Dashboard />
</AuthGuard>
```

### withAuthGuard HOC

Higher-order component version of AuthGuard:

```tsx
import { withAuthGuard } from '@goiam/react';

const ProtectedComponent = withAuthGuard(MyComponent, {
  requiredRoles: ['admin'],
  redirectToLogin: true,
});
```

### GoIamClient

Low-level client for direct API interactions:

```tsx
import { GoIamClient } from '@goiam/react';

const client = new GoIamClient(config);

// Get authentication URL
const authUrl = client.getAuthUrl();

// Fetch user profile
const user = await client.fetchUserProfile();

// Storage operations
client.storeUser(user);
const storedUser = client.getStoredUser();
client.clearStoredUser();

// Check roles
const hasAccess = client.hasRequiredRoles(user, ['admin']);
```

## User Data Structure

```tsx
interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  avatar?: string;
  roles?: string[];
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}
```

## Authentication Flow

1. **Initialization**: Provider checks for stored user data and validates with API
2. **Login**: User clicks login button → redirects to GoIAM auth URL
3. **Callback**: After successful authentication, user returns to your app
4. **Profile Fetch**: SDK automatically fetches and stores user profile
5. **State Management**: Authentication state is maintained across app

## Error Handling

The SDK provides comprehensive error handling:

```tsx
function MyComponent() {
  const { error, isLoading } = useGoIam();

  if (error) {
    return <div>Authentication error: {error}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Render authenticated content
}
```

## Advanced Configuration

### Custom Storage

Provide custom storage implementation:

```tsx
const customStorage = {
  getItem: (key: string) => sessionStorage.getItem(key),
  setItem: (key: string, value: string) => sessionStorage.setItem(key, value),
  removeItem: (key: string) => sessionStorage.removeItem(key),
};

const client = new GoIamClient(config, customStorage);
```

### Custom Loading Component

```tsx
const CustomLoader = () => (
  <div className="custom-loader">
    <spinner />
    Loading your profile...
  </div>
);

<GoIamProvider config={config} loadingComponent={CustomLoader}>
  <App />
</GoIamProvider>;
```

## TypeScript Support

The SDK is built with TypeScript and provides comprehensive type definitions:

```tsx
import type { GoIamConfig, User, AuthState, GoIamContextValue } from '@goiam/react';

// Type-safe configuration
const config: GoIamConfig = {
  baseUrl: 'https://api.example.com',
  clientId: 'client-id',
  redirectUrl: 'https://app.example.com/callback',
};

// Type-safe user handling
const handleUser = (user: User) => {
  console.log(`Welcome ${user.name}!`);
};
```

## Examples

Complete usage examples are available in the `examples/` directory:

- **`basic-usage.tsx`** - Basic setup and usage patterns
- **`comprehensive-example.tsx`** - Advanced usage with all features

### Running Examples Locally

The examples use relative imports for local development. To test them as if they were using the published package:

```bash
# Create a local npm link
make link-local

# Or build and pack locally
make pack-local
```

### Import Variations

**For Local Development:**

```tsx
import { GoIamProvider, useGoIam, AuthGuard } from '../src/index';
```

**For Published Package:**

```tsx
import { GoIamProvider, useGoIam, AuthGuard } from '@goiam/react';
```

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

### 0.1.0

- Initial release
- Basic authentication flow
- AuthGuard component
- Context provider and hook
- TypeScript support
