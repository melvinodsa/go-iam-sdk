import React from 'react';
import {
    GoIamProvider,
    useGoIam,
    AuthGuard,
    withAuthGuard,
    createGoIamConfig
} from '../src/index';

// Configuration
const config = createGoIamConfig({
    baseUrl: 'https://your-goiam-server.com',
    clientId: 'your-client-id',
    redirectUrl: 'https://your-app.com/callback',
});

// Login/Logout Component
function AuthButton() {
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

    return <button onClick={login}>Login with GoIAM</button>;
}

// Protected Dashboard Component
function Dashboard() {
    const { user, refreshUser } = useGoIam();

    return (
        <div>
            <h2>Dashboard</h2>
            <p>This is a protected area.</p>
            <div>
                <h3>User Profile:</h3>
                <pre>{JSON.stringify(user, null, 2)}</pre>
                <button onClick={refreshUser}>Refresh Profile</button>
            </div>
        </div>
    );
}

// Admin Panel Component (with role protection)
function AdminPanel() {
    return (
        <div>
            <h2>Admin Panel</h2>
            <p>This is an admin-only area.</p>
        </div>
    );
}

// Create HOC version
const ProtectedAdminPanel = withAuthGuard(AdminPanel, {
    requiredResources: ['@ui/admin/panel'],
    redirectToLogin: true,
});

// Custom Unauthorized Component
function AccessDenied() {
    return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h2>Access Denied</h2>
            <p>You don't have permission to view this page.</p>
            <p>Required roles: Admin</p>
        </div>
    );
}

// Custom Loading Component
function CustomLoader() {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
        }}>
            <div style={{ textAlign: 'center' }}>
                <div>🔄</div>
                <p>Loading your profile...</p>
            </div>
        </div>
    );
}

// Main App Component
function App() {
    const [currentPage, setCurrentPage] = React.useState('home');

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return (
                    <AuthGuard redirectToLogin={true}>
                        <Dashboard />
                    </AuthGuard>
                );

            case 'admin':
                return (
                    <AuthGuard
                        requiredResources={['@ui/admin']}
                        unauthorizedComponent={AccessDenied}
                    >
                        <AdminPanel />
                    </AuthGuard>
                );

            case 'admin-hoc':
                return <ProtectedAdminPanel />;

            default:
                return (
                    <div>
                        <h1>GoIAM React SDK Example</h1>
                        <AuthButton />
                    </div>
                );
        }
    };

    return (
        <div>
            <nav style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
                <button onClick={() => setCurrentPage('home')}>Home</button>
                <button onClick={() => setCurrentPage('dashboard')}>Dashboard</button>
                <button onClick={() => setCurrentPage('admin')}>Admin (Guard)</button>
                <button onClick={() => setCurrentPage('admin-hoc')}>Admin (HOC)</button>
            </nav>
            <main style={{ padding: '1rem' }}>
                {renderPage()}
            </main>
        </div>
    );
}

// Root Component with Provider
function Root() {
    return (
        <GoIamProvider config={config} loadingComponent={CustomLoader}>
            <App />
        </GoIamProvider>
    );
}

export default Root;

// Additional Examples:

// 1. Custom Storage Example
/*
const customStorage = {
  getItem: (key) => sessionStorage.getItem(key),
  setItem: (key, value) => sessionStorage.setItem(key, value),
  removeItem: (key) => sessionStorage.removeItem(key),
};

const clientWithCustomStorage = new GoIamClient(config, customStorage);
*/

// 2. Multiple Role Requirements Example
/*
function SuperAdminPanel() {
  return (
    <AuthGuard requiredRoles={['admin', 'super-admin']}>
      <div>Super admin content</div>
    </AuthGuard>
  );
}
*/

// 3. Conditional Rendering Based on Auth State
/*
function ConditionalContent() {
  const { isAuthenticated, user } = useGoIam();

  if (!isAuthenticated) {
    return <div>Please log in to see content</div>;
  }

  return (
    <div>
      <h2>Welcome {user?.name}</h2>
      {user?.roles?.includes('premium') && (
        <div>Premium content here</div>
      )}
    </div>
  );
}
*/

// 4. Error Handling Example
/*
function ErrorHandlingExample() {
  const { error, refreshUser } = useGoIam();

  if (error) {
    return (
      <div>
        <p>Authentication error: {error}</p>
        <button onClick={refreshUser}>Retry</button>
      </div>
    );
  }

  return <div>No errors</div>;
}
*/
