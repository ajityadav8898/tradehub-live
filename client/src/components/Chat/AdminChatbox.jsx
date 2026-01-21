import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaSmile, FaPaperclip, FaMicrophone } from "react-icons/fa";
import Switch from "@mui/material/Switch";
import EmojiPicker from "emoji-picker-react";
import io from "socket.io-client";
import axios from "axios";
import "./AdminChatbox.css";

// Connect to Unified Backend
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5001";
const socket = io(SOCKET_URL);

const AdminChatbox = ({ targetUserId }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [darkMode, setDarkMode] = useState(false); // Default false for this theme
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null);

    // Recording State
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // Admin monitoring a specific user (received via prop)

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`${SOCKET_URL}/api/chat/${targetUserId}`);
                setMessages(response.data);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();

        // Admin identifying self
        socket.emit("set_user_id", "admin_user");

        socket.on("connect", () => {
            console.log("✅ Admin connected to Socket.IO");
        });

        socket.on("receive_message", (data) => {
            console.log("📩 Admin received:", data);
            // Filter updates for the target user (or show all)
            if (data.userId === targetUserId || data.sender === "user" || data.sender === "admin") {
                setMessages((prev) => {
                    const isDuplicate = prev.some(
                        (msg) => msg.text === data.text && msg.sender === data.sender && Math.abs(new Date(msg.timestamp) - new Date(data.timestamp)) < 1000
                    );
                    if (!isDuplicate) return [...prev, data];
                    return prev;
                });
            }
        });

        return () => {
            socket.off("connect");
            socket.off("receive_message");
        };
    }, [targetUserId]);

    const sendMessage = () => {
        if (input.trim() !== "") {
            const messageData = {
                text: input,
                message: input,
                sender: "admin",
                userId: targetUserId // Reply to this user
            };

            socket.emit("send_message", messageData);

            // Optimistic update
            setMessages((prev) => [...prev, { ...messageData, timestamp: new Date() }]);
            setInput("");
            setShowEmojiPicker(false);
        }
    };

    const handleEmojiClick = (emojiObject) => {
        setInput(prev => prev + emojiObject.emoji);
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && input.trim() !== "") {
            sendMessage();
        }
    };

    // --- File Upload Logic ---
    const handleAttachClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post(`${SOCKET_URL}/api/chat/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.url) {
                const messageData = {
                    text: "",
                    attachment: {
                        url: res.data.url,
                        type: res.data.type
                    },
                    sender: "admin",
                    userId: targetUserId
                };
                socket.emit("send_message", messageData);
                setMessages((prev) => [...prev, { ...messageData, timestamp: new Date() }]);
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("File upload failed!");
        }
    };

    // --- Voice Recording Stub (or implementation if Admin wants it too) ---
    // For now, mirroring UserChatbox logic for Admin
    const handleMicClick = async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = [];
                mediaRecorderRef.current.ondataavailable = (e) => audioChunksRef.current.push(e.data);
                mediaRecorderRef.current.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    const audioFile = new File([audioBlob], "admin_voice.webm", { type: "audio/webm" });
                    const formData = new FormData();
                    formData.append("file", audioFile);

                    try {
                        const res = await axios.post(`${SOCKET_URL}/api/chat/upload`, formData, { headers: { "Content-Type": "multipart/form-data" } });
                        if (res.data.url) {
                            const messageData = {
                                text: "",
                                attachment: { url: res.data.url, type: 'audio' },
                                sender: "admin",
                                userId: targetUserId
                            };
                            socket.emit("send_message", messageData);
                            setMessages((prev) => [...prev, { ...messageData, timestamp: new Date() }]);
                        }
                    } catch (err) { console.error(err); }
                };
                mediaRecorderRef.current.start();
                setIsRecording(true);
            } catch (err) { alert("Mic access denied"); }
        } else {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="admin-chat-root">
            <div className={`admin-chat-container ${darkMode ? "dark" : "light"}`}>
                <div className="admin-chat-header">
                    <div className="header-info">
                        <div className="avatar admin-avatar">{(targetUserId || "GU").substring(0, 2).toUpperCase()}</div>
                        <div className="user-details">
                            <h3>{targetUserId || "Select User"}</h3>
                            <span className="status">Active Now</span>
                        </div>
                    </div>
                    {/* Dark Mode Toggle */}
                    <div style={{ marginRight: '10px' }}>
                        <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                    </div>
                </div>

                <div className="admin-chat-box">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message-wrapper ${msg.sender === 'admin' ? 'user' : 'admin'}`}>
                            <div className={`message ${msg.sender === 'admin' ? 'user' : 'admin'}`}>
                                {msg.text && <p style={{ margin: 0 }}>{msg.text}</p>}

                                {msg.attachment && msg.attachment.type === 'image' && (
                                    <img src={`${SOCKET_URL}${msg.attachment.url}`} alt="att" style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '5px' }} />
                                )}
                                {msg.attachment && msg.attachment.type === 'audio' && (
                                    <div style={{ marginTop: '5px' }}><audio controls src={`${SOCKET_URL}${msg.attachment.url}`} style={{ maxWidth: '200px' }} /></div>
                                )}
                                {msg.attachment && msg.attachment.type === 'file' && (
                                    <div style={{ marginTop: '5px' }}><a href={`${SOCKET_URL}${msg.attachment.url}`} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>📄 Download</a></div>
                                )}

                                <span className="timestamp">{new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    ))}
                    <div style={{ float: "left", clear: "both" }}></div>
                </div>

                {showEmojiPicker && (
                    <div className="admin-emoji-picker">
                        <EmojiPicker onEmojiClick={handleEmojiClick} theme="light" />
                    </div>
                )}

                <div className="admin-chat-input-area">
                    <button className="icon-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                        <FaSmile />
                    </button>

                    <button className="icon-btn" onClick={handleAttachClick}>
                        <FaPaperclip />
                    </button>
                    <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />

                    <input
                        type="text"
                        placeholder="Reply to user..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        ref={inputRef}
                    />

                    {input.trim() === "" ? (
                        <button className={`icon-btn ${isRecording ? 'recording' : ''}`} onClick={handleMicClick} style={{ color: isRecording ? 'red' : 'inherit' }}>
                            <FaMicrophone />
                        </button>
                    ) : (
                        <button className="send-btn" onClick={sendMessage}>
                            <FaPaperPlane />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminChatbox;
