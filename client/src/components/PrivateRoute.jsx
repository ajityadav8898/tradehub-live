import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Loading...</div>; // Show a loading indicator while checking auth
    }

    if (!user) {
        return <Navigate to="/login" replace />; // Redirect if not logged in
    }

    if (requiredRole && user.role !== requiredRole) {
        // Redirect if user is logged in but does not have the required role (e.g., non-admin trying to access /admin)
        return <Navigate to="/" replace />; 
    }

    return children;
};

export default PrivateRoute;