import React, { useState, useEffect } from "react";
import AdminChatbox from "../components/Chat/AdminChatbox";
import axios from "axios";

// Environment-aware URL
const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:5001/api").replace(/\/$/, "");

const AdminChatPage = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);

    // Fetch unique users who have chatted
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get(`${API_URL}/chat/users`);
                setUsers(response.data);
                if (response.data.length > 0 && !selectedUser) {
                    setSelectedUser(response.data[0].userId); // Select first user ID
                }
            } catch (error) {
                console.error("Error fetching chat users:", error);
            }
        };

        fetchUsers();
        // Poll for new users every 10 seconds? Or depend on socket events?
        // Poll for simplicity for now
        const interval = setInterval(fetchUsers, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            height: "100vh",
            backgroundColor: "#1e1e1e",
            color: "white",
            display: "flex",
            flexDirection: "row", // Changed to row for sidebar
            overflow: "hidden"
        }}>
            {/* Sidebar - User List */}
            <div style={{
                width: "250px",
                borderRight: "1px solid #333",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#111"
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
                            onClick={() => setSelectedUser(user.userId)}
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

            {/* Main Chat Area */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                {/* Header */}
                <div style={{ padding: "15px 20px", borderBottom: "1px solid #333", backgroundColor: "#191919" }}>
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
