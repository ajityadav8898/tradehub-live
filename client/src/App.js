import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import LoginSessionPage from './pages/LoginSessionPage';
import PrivateRoute from './components/PrivateRoute';
import TutorialsPage from './tutorials/pages/TutorialsPage';
import TradingViewChart from './pages/TradingViewChart';

// Import Ebooks Pages
import AdminEbooks from "./pages/AdminEbooks.jsx";
import UserEbooks from "./pages/UserEbooks.jsx";
import AdminChatPage from "./pages/AdminChatPage";

import PaperTradePage from './pages/PaperTradePage';

import TradingViewGuide from "./pages/TradingViewGuide";
import ContactPage from "./pages/ContactPage";

function App() {
    return (
        <Router>
            <Routes>
                {/* PUBLIC ROUTES */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/tutorials" element={<TradingViewGuide />} />
                <Route path="/tradingview-guide" element={<TradingViewGuide />} />
                <Route path="/charts" element={<TradingViewChart />} />

                {/* PUBLIC EBOOKS ROUTE */}
                <Route path="/ebooks" element={<UserEbooks />} />
                <Route path="/paper-trade" element={<PaperTradePage />} />
                <Route path="/contact" element={<ContactPage />} />

                {/* USER PROTECTED ROUTES */}
                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            {/* Placeholder for the user dashboard component */}
                            <h1>User Dashboard</h1>
                        </PrivateRoute>
                    }
                />

                {/* ADMIN PROTECTED ROUTES */}
                <Route
                    path="/admin"
                    element={
                        <PrivateRoute requiredRole="admin">
                            <AdminPage />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/admin-chat"
                    element={
                        <PrivateRoute requiredRole="admin">
                            <AdminChatPage />
                        </PrivateRoute>
                    }
                />

                {/* ADMIN EBOOKS ROUTE */}
                <Route
                    path="/admin-ebooks"
                    element={
                        <PrivateRoute requiredRole="admin">
                            <AdminEbooks />
                        </PrivateRoute>
                    }
                />

                {/* Other Admin Protected Routes */}
                <Route
                    path="/login-session"
                    element={
                        <PrivateRoute requiredRole="admin">
                            <LoginSessionPage />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </Router>
    );
}
export default App;
