import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaSmile, FaPaperclip, FaMicrophone } from "react-icons/fa";
import Switch from "@mui/material/Switch"; // Retain for dark mode toggle if user desires, or remove if forced. Let's keep it but styling overrides it.
import EmojiPicker from "emoji-picker-react";
import io from "socket.io-client";
import axios from "axios";
import "./UserChatbox.css";

// Connect to the unified backend
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5001";
const socket = io(SOCKET_URL);

const UserChatbox = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    // Dark mode is default false for this theme
    const [darkMode, setDarkMode] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const inputRef = useRef(null);
    const fileInputRef = useRef(null); // Ref for file upload

    // .... (Existing Logic) ....
    // Use a stable dummy ID for now, or get from Auth Context
    const userId = localStorage.getItem("userId") || "guest_user";

    // Fetch messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get(`${SOCKET_URL}/api/chat/${userId}`);
                if (response.data) {
                    setMessages(response.data);
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        fetchMessages();

        // Set user ID on socket connection
        socket.emit("set_user_id", userId);

        socket.on("connect", () => {
            console.log("✅ User connected to Chat Socket");
        });

        socket.on("receive_message", (data) => {
            console.log("📩 Message received:", data);
            setMessages((prev) => {
                // Prevent duplicates
                const isDuplicate = prev.some(
                    (msg) => msg.text === data.text && msg.sender === data.sender && Math.abs(new Date(msg.timestamp) - new Date(data.timestamp)) < 1000
                );
                if (!isDuplicate) {
                    return [...prev, data];
                }
                return prev;
            });
        });

        return () => {
            socket.off("connect");
            socket.off("receive_message");
        };
    }, [userId]);

    const sendMessage = () => {
        if (input.trim() !== "") {
            const messageData = {
                text: input,
                message: input,
                sender: "user",
                userId: userId
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
            // Upload to backend
            const res = await axios.post(`${SOCKET_URL}/api/chat/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if (res.data.url) {
                const messageData = {
                    text: "", // Empty text for file-only messages, or file name
                    attachment: {
                        url: res.data.url, // e.g. /uploads/filename.png
                        type: res.data.type // 'image', 'audio', 'file'
                    },
                    sender: "user",
                    userId: userId
                };
                socket.emit("send_message", messageData);
                setMessages((prev) => [...prev, { ...messageData, timestamp: new Date() }]);
            }
        } catch (error) {
            console.error("Upload failed", error);
            alert("File upload failed!");
        }
    };

    // --- Voice Recording Logic ---
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const handleMicClick = async () => {
        if (!isRecording) {
            // Start Recording
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorderRef.current = new MediaRecorder(stream);
                audioChunksRef.current = [];

                mediaRecorderRef.current.ondataavailable = (event) => {
                    audioChunksRef.current.push(event.data);
                };

                mediaRecorderRef.current.onstop = async () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    // Create a File object from Blob
                    const audioFile = new File([audioBlob], "voice_message.webm", { type: "audio/webm" });

                    // Re-use upload logic
                    const formData = new FormData();
                    formData.append("file", audioFile);

                    try {
                        const res = await axios.post(`${SOCKET_URL}/api/chat/upload`, formData, {
                            headers: { "Content-Type": "multipart/form-data" }
                        });

                        if (res.data.url) {
                            const messageData = {
                                text: "",
                                attachment: {
                                    url: res.data.url,
                                    type: 'audio'
                                },
                                sender: "user",
                                userId: userId
                            };
                            socket.emit("send_message", messageData);
                            setMessages((prev) => [...prev, { ...messageData, timestamp: new Date() }]);
                        }

                    } catch (error) {
                        console.error("Audio upload failed", error);
                    }
                };

                mediaRecorderRef.current.start();
                setIsRecording(true);
            } catch (err) {
                console.error("Error accessing microphone:", err);
                alert("Microphone access denied or not available.");
            }
        } else {
            // Stop Recording
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <div className="chat-root-container">
            <div className={`chat-container whatsapp-theme ${darkMode ? "dark" : "light"}`}>
                <div className="chat-header">
                    <div className="header-info">
                        <div className="avatar">
                            <img src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png" alt="Support" />
                        </div>
                        <div className="user-details">
                            <h3>Support Team</h3>
                            <span className="status">Online</span>
                        </div>
                    </div>
                    {/* Toggle Switch */}
                    <div style={{ marginRight: '10px' }}>
                        <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
                    </div>
                </div>

                <div className="chat-box">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message-wrapper ${msg.sender}`}>
                            <div className={`message ${msg.sender}`}>
                                {/* Text Content */}
                                {msg.text && <p style={{ margin: 0 }}>{msg.text}</p>}

                                {/* Attachment Content */}
                                {msg.attachment && msg.attachment.type === 'image' && (
                                    <img
                                        src={`${SOCKET_URL}${msg.attachment.url}`}
                                        alt="attachment"
                                        style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '5px' }}
                                    />
                                )}
                                {msg.attachment && msg.attachment.type === 'audio' && (
                                    <div style={{ marginTop: '5px' }}>
                                        <audio controls src={`${SOCKET_URL}${msg.attachment.url}`} style={{ maxWidth: '200px' }} />
                                    </div>
                                )}
                                {msg.attachment && msg.attachment.type === 'file' && (
                                    <div style={{ marginTop: '5px' }}>
                                        <a href={`${SOCKET_URL}${msg.attachment.url}`} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>
                                            📄 Download File
                                        </a>
                                    </div>
                                )}

                                <span className="timestamp">{new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    ))}
                    <div style={{ float: "left", clear: "both" }}></div>
                </div>

                {showEmojiPicker && (
                    <div className="emoji-picker">
                        <EmojiPicker onEmojiClick={handleEmojiClick} theme="light" />
                    </div>
                )}

                <div className="chat-input-area">
                    <button className="icon-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                        <FaSmile />
                    </button>

                    <button className="icon-btn" onClick={handleAttachClick}>
                        <FaPaperclip />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                    />

                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        ref={inputRef}
                    />

                    {/* Mic Icon handles record start/stop */}
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

export default UserChatbox;
