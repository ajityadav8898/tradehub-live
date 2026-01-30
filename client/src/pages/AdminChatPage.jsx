import React, { useState, useEffect } from "react";
import AdminChatbox from "../components/Chat/AdminChatbox";
import axios from "axios";

// Environment-aware URL
const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

const AdminChatPage = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Control sidebar visibility on mobile
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (!mobile) setIsSidebarOpen(true); // Always show sidebar on desktop
            else if (selectedUser) setIsSidebarOpen(false); // Hide sidebar on mobile if user selected
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check

        return () => window.removeEventListener('resize', handleResize);
    }, [selectedUser]);

    // Fetch unique users who have chatted
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${API_URL}/chat/users`);
                setUsers(response.data);
                // On desktop, auto-select first user if none selected
                if (window.innerWidth >= 768 && response.data.length > 0 && !selectedUser) {
                    setSelectedUser(response.data[0].userId);
                }
            } catch (error) {
                console.error("Error fetching chat users:", error);
            }
        };

        fetchUsers();
        const interval = setInterval(fetchUsers, 10000);
        return () => clearInterval(interval);
    }, [selectedUser]); // Add selectedUser dependencies to avoid overriding selection logic weirdly? No.

    const handleUserSelect = (userId) => {
        setSelectedUser(userId);
        if (isMobile) setIsSidebarOpen(false); // Close sidebar on mobile
    };

    return (
        <div style={{
            height: "100vh",
            backgroundColor: "#1e1e1e",
            color: "white",
            display: "flex",
            flexDirection: "row",
            overflow: "hidden",
            position: "relative"
        }}>
            {/* Sidebar - User List */}
            {isSidebarOpen && (
                <div style={{
                    width: isMobile ? "100%" : "300px", // Full width on mobile
                    borderRight: "1px solid #333",
                    display: "flex",
                    flexDirection: "column",
                    backgroundColor: "#111",
                    position: isMobile ? "absolute" : "relative",
                    zIndex: 10,
                    height: "100%"
                }}>
                    <div style={{ padding: "20px", borderBottom: "1px solid #333" }}>
                        <div style={{ marginBottom: '15px' }}>
                            <a href="/admin" style={{ color: '#aaa', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                                <i className="bi bi-arrow-left" style={{ marginRight: '5px' }}></i> Back to Dashboard
                            </a>
                        </div>
                        <h3 style={{ margin: 0, color: "#0adfaa" }}>Active Users</h3>
                    </div>
                    <div style={{ flex: 1, overflowY: "auto" }}>
                        {users.map(user => (
                            <div
                                key={user.userId}
                                onClick={() => handleUserSelect(user.userId)}
                                style={{
                                    padding: "15px 20px",
                                    cursor: "pointer",
                                    borderBottom: "1px solid #222",
                                    backgroundColor: selectedUser === user.userId ? "#2a2a2a" : "transparent",
                                    color: selectedUser === user.userId ? "#fff" : "#aaa",
                                    transition: "background 0.2s"
                                }}
                            >
                                <div style={{ fontWeight: "bold" }}>{user.username}</div>
                                <div style={{ fontSize: "12px", opacity: 0.7 }}>ID: {user.userId.substring(0, 8)}...</div>
                            </div>
                        ))}
                        {users.length === 0 && (
                            <div style={{ padding: "20px", opacity: 0.5, textAlign: "center" }}>
                                No active chats
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Main Chat Area */}
            <div style={{ flex: 1, display: isMobile && isSidebarOpen ? "none" : "flex", flexDirection: "column" }}>
                {/* Header */}
                <div style={{ padding: "15px 20px", borderBottom: "1px solid #333", backgroundColor: "#191919", display: 'flex', alignItems: 'center' }}>
                    {isMobile && (
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            style={{ background: 'transparent', border: 'none', color: 'white', marginRight: '15px', fontSize: '1.2rem', cursor: 'pointer' }}
                        >
                            <i className="bi bi-list"></i>
                        </button>
                    )}
                    <h2 style={{ margin: 0, fontSize: "1.2rem" }}>
                        {selectedUser ? `Chat with ${selectedUser}` : "Select a user"}
                    </h2>
                </div>

                {/* Chatbox Component (Pass selectedUser) */}
                <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
                    {selectedUser ? (
                        <AdminChatbox targetUserId={selectedUser} />
                    ) : (
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                            <p style={{ opacity: 0.5 }}>Select a user from the sidebar to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminChatPage;
