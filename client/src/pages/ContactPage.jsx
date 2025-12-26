import React from "react";
import UserChatbox from "../components/Chat/UserChatbox";
import Navbar from "../components/Navbar";
import "../styles/Ebooks.css"; // Reuse Ebooks styling for consistent header

const ContactPage = () => {
    return (
        <>
            <Navbar />
            <div
                className="user-container"
                style={{
                    maxWidth: '100%',
                    paddingLeft: 0,
                    paddingRight: 0,
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    // Override padding-top from .user-container (120px) if needed, 
                    // but 120px is good for Navbar clearance. 
                    // We just need to ensure the bottom doesn't overflow.
                    paddingBottom: 0,
                    backgroundColor: '#000000' // Pitch black background
                }}
            >
                {/* Header removed as per request */}
                <div style={{ flex: 1, overflow: 'hidden', width: '100%', display: 'flex' }}>
                    <UserChatbox />
                </div>
            </div>
        </>
    );
};

export default ContactPage;
