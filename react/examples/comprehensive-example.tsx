import React from 'react';

// === IMPORT OPTIONS ===
// Option 1: For local development (current setup)
import {
    GoIamProvider,
    useGoIam,
    AuthGuard,
    withAuthGuard,
    createGoIamConfig
} from '../src/index';

// Option 2: For production use (when package is published)
// import {
//     GoIamProvider,
//     useGoIam,
//     AuthGuard,
//     withAuthGuard,
//     createGoIamConfig
// } from '@goiam/react';

// === CONFIGURATION ===
const config = createGoIamConfig({
    baseUrl: 'https://your-goiam-server.com',
    clientId: 'your-client-id',
    redirectUrl: 'https://your-app.com/callback',
});

// === COMPONENTS ===

// Simple Login/Logout Component
function AuthButton() {
    const { isAuthenticated, user, login, logout, isLoading } = useGoIam();

    if (isLoading) {
        return <div className="loading">Checking authentication...</div>;
    }

    if (isAuthenticated && user) {
        return (
            <div className="user-info">
                <h3>Welcome!</h3>
                <p><strong>Name:</strong> {user.name || 'Not provided'}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>ID:</strong> {user.id}</p>
                {user.roles && user.roles.length > 0 && (
                    <p><strong>Roles:</strong> {user.roles.join(', ')}</p>
                )}
                <button onClick={logout} className="btn btn-secondary">
                    Logout
                </button>
            </div>
        );
    }

    return (
        <div className="login-prompt">
            <h3>Please log in</h3>
            <p>You need to authenticate to access this application.</p>
            <button onClick={login} className="btn btn-primary">
                Login with GoIAM
            </button>
        </div>
    );
}

// Protected Dashboard Component
function Dashboard() {
    const { user } = useGoIam();

    return (
        <div className="dashboard">
            <h2>Dashboard</h2>
            <p>Welcome to your dashboard, {user?.name || user?.email}!</p>
            <p>This content is only visible to authenticated users.</p>
        </div>
    );
}

// Admin-only Component
function AdminPanel() {
    const { user } = useGoIam();

    return (
        <div className="admin-panel">
            <h2>Admin Panel</h2>
            <p>Welcome, Administrator {user?.name || user?.email}!</p>
            <p>This content is only visible to users with admin role.</p>
            <div className="admin-actions">
                <button className="btn">Manage Users</button>
                <button className="btn">System Settings</button>
                <button className="btn">View Logs</button>
            </div>
        </div>
    );
}

// HOC Example
const ProtectedDashboard = withAuthGuard(Dashboard, {
    redirectToLogin: true
});

// Custom Loading Component
function CustomLoader() {
    return (
        <div className="custom-loader">
            <div className="spinner"></div>
            <p>Loading your profile...</p>
        </div>
    );
}

// Custom Unauthorized Component
function AccessDenied() {
    return (
        <div className="access-denied">
            <h2>🚫 Access Denied</h2>
            <p>You don't have permission to view this content.</p>
            <p>Please contact your administrator if you believe this is an error.</p>
        </div>
    );
}

// Main Application Component
function App() {
    return (
        <div className="app">
            <header className="app-header">
                <h1>GoIAM React SDK Example</h1>
                <AuthButton />
            </header>

            <main className="app-main">
                <section className="section">
                    <h2>Public Content</h2>
                    <p>This content is visible to everyone.</p>
                </section>

                <section className="section">
                    <h2>Protected Content</h2>
                    <AuthGuard
                        fallback={() => (
                            <div className="auth-required">
                                <p>🔒 Please log in to view this content.</p>
                            </div>
                        )}
                    >
                        <Dashboard />
                    </AuthGuard>
                </section>

                <section className="section">
                    <h2>Admin-Only Content</h2>
                    <AuthGuard
                        requiredRoles={['admin']}
                        unauthorizedComponent={AccessDenied}
                        fallback={() => (
                            <div className="auth-required">
                                <p>🔒 Please log in to view this content.</p>
                            </div>
                        )}
                    >
                        <AdminPanel />
                    </AuthGuard>
                </section>

                <section className="section">
                    <h2>Auto-Redirect Protected Content</h2>
                    <AuthGuard redirectToLogin={true}>
                        <div className="protected-content">
                            <h3>Auto-Protected Area</h3>
                            <p>If you're not logged in, you'll be redirected automatically.</p>
                        </div>
                    </AuthGuard>
                </section>

                <section className="section">
                    <h2>HOC Example</h2>
                    <ProtectedDashboard />
                </section>
            </main>
        </div>
    );
}

// Root Component with Provider
export default function ExampleApp() {
    return (
        <GoIamProvider
            config={config}
            loadingComponent={CustomLoader}
        >
            <App />
        </GoIamProvider>
    );
}

// === USAGE NOTES ===
/*
To use this example:

1. Install dependencies:
   npm install react react-dom

2. Update the config object with your actual GoIAM server details

3. For local development:
   - Keep the import from '../src/index'
   - Make sure the React SDK is built: npm run build

4. For production:
   - Change import to '@goiam/react'
   - Install the package: npm install @goiam/react

5. Add CSS classes for styling:
   .loading, .user-info, .login-prompt, .dashboard, .admin-panel,
   .custom-loader, .access-denied, .app, .app-header, .app-main,
   .section, .auth-required, .protected-content, .btn, .spinner

Example CSS:
```css
.btn {
  padding: 8px 16px;
  margin: 4px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.section {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.access-denied {
  text-align: center;
  color: #dc3545;
}
```
*/
