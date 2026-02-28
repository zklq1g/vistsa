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

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        // Role not allowed (e.g. member trying to access /admin)
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
