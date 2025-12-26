import React from "react";
import AdminChatbox from "../components/Chat/AdminChatbox";

const AdminChatPage = () => {
    return (
        <div style={{
            height: "100vh",
            backgroundColor: "#1e1e1e",
            color: "white",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            paddingTop: "0px"
        }}>
            {/* Header Area */}
            <div style={{ padding: "20px", flexShrink: 0 }}>
                <h1 style={{ textAlign: "center", marginBottom: "10px" }}>Support Tickets</h1>
                <p style={{ textAlign: "center", opacity: 0.6, marginBottom: '10px' }}>Responding to Guest User (ID: guest_user)</p>
            </div>

            {/* Chat Area - Fills remaining space */}
            <div style={{ flex: 1, overflow: "hidden", width: "100%", display: "flex" }}>
                <AdminChatbox />
            </div>
        </div>
    );
};

export default AdminChatPage;
