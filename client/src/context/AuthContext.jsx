import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api') + '/auth';

const decodeTokenPayload = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check for token on initial load
        const token = localStorage.getItem('token');
        if (token) {
            const payload = decodeTokenPayload(token);
            if (payload) {
                // Attach token and user details to state
                setUser({
                    token,
                    id: payload.user.id,
                    role: payload.user.role
                });
            } else {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        const payload = decodeTokenPayload(token);
        setUser({
            token,
            id: payload.user.id,
            role: payload.user.role
        });
    };

    const logout = async () => {
        // OPTIONAL: Notify backend of logout for session logging
        try {
            if (user) {
                await axios.post(`${API_BASE_URL}/logout`, { userId: user.id });
            }
        } catch (error) {
            console.error("Logout notification failed:", error);
        }

        localStorage.removeItem('token');
        setUser(null);
        window.location.href = "/login.html"; // Redirect after clearing state
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;