import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isLoggedIn, user } = useAuthStore();
    const location = useLocation();

    if (!isLoggedIn) {
        // Redirect to login but save the attempted URL
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const { normalizeRole } = useAuthStore.getState ? { normalizeRole: (r) => r?.toString().replace(/[\s_]/g, '').toUpperCase() } : {};
    const safeNormalize = (r) => r?.toString().replace(/[\s_]/g, '').toUpperCase() || '';

    const userRole = safeNormalize(user?.role);
    const normalizedAllowed = (allowedRoles || []).map(r => safeNormalize(r));

    if (allowedRoles && user && !normalizedAllowed.includes(userRole)) {
        // Prevent infinite loop: if already at /dashboard, don't redirect there again
        if (location.pathname === '/dashboard') {
            console.error("Access denied at dashboard root for role:", userRole);
            return (
                <div style={{ padding: '20px', color: 'white', textAlign: 'center' }}>
                    <h2>Access Denied</h2>
                    <p>Your role ({user.role}) is not authorized for this section.</p>
                </div>
            );
        }
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
