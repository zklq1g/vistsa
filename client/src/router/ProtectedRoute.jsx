import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { ShieldAlert } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isLoggedIn, user } = useAuthStore();
    const location = useLocation();

    if (!isLoggedIn) {
        // Redirect to login but save the attempted URL
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Role not allowed (e.g. member trying to access /admin)
        return (
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', height: '100vh', padding: '20px',
                textAlign: 'center', backgroundColor: 'var(--c-bg)'
            }}>
                <ShieldAlert size={64} style={{ color: '#f85149', marginBottom: '16px' }} />
                <h1 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Access Denied</h1>
                <p style={{ color: 'var(--c-text-muted)', marginBottom: '24px', maxWidth: '400px' }}>
                    You do not have the required permissions ({allowedRoles.join(' or ')}) to view this page.
                </p>
                <Link to="/dashboard" style={{
                    padding: '10px 20px', backgroundColor: 'var(--c-accent)',
                    color: 'white', textDecoration: 'none', borderRadius: 'var(--r-md)',
                    fontWeight: 500
                }}>
                    Return to Dashboard
                </Link>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
