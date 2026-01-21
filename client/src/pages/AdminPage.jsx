import React, { useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../styles/Admin.css';

const AdminPage = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        console.log("Admin panel loaded!");
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/'); // Redirect to home or login is handled by logout
    };

    return (
        <div className="admin-dashboard-container">
            <header className="admin-header">
                <div className="admin-header-content">
                    <div style={{ textAlign: 'left' }}>
                        <h1>TradeHub <span>Admin</span></h1>
                        <p>Welcome back. Manage your platform resources below.</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="admin-logout-btn"
                    >
                        <i className="bi bi-box-arrow-right"></i> Logout
                    </button>
                </div>
            </header>

            <div className="dashboard-grid">
                <Link to="/admin-ebooks" className="dashboard-card">
                    <i className="bi bi-book-half card-icon"></i>
                    <h3>Manage Ebooks</h3>
                    <p>Upload new PDF guides, delete outdated resources, and view current library statistics.</p>
                </Link>

                <Link to="/admin-chat" className="dashboard-card">
                    <i className="bi bi-chat-dots-fill card-icon"></i>
                    <h3>User Support</h3>
                    <p>Monitor live chat sessions, respond to user inquiries, and manage support tickets.</p>
                </Link>

                <Link to="/login-session" className="dashboard-card">
                    <i className="bi bi-shield-lock-fill card-icon"></i>
                    <h3>Session Manager</h3>
                    <p>View active user sessions, monitor security logs, and manage access controls.</p>
                </Link>
            </div>
        </div>
    );
};

export default AdminPage;