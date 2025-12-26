import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaSmile } from "react-icons/fa";
import { Switch } from "@mui/material";
import EmojiPicker from "emoji-picker-react";
import io from "socket.io-client";
import axios from "axios"; // Add axios for HTTP requests
import "./AdminChatbox.css";

// Use environment variable for the chat backend port
const socket = io(process.env.REACT_APP_CHAT_API); // Updated to use environment variable

const AdminChatbox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);

  // Fetch messages from MongoDB when the component mounts
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const userId = "defaultUserId"; // Replace with actual user ID from your auth system
        const response = await axios.get(`${process.env.REACT_APP_CHAT_API}/get-messages/${userId}`); // Updated to use environment variable
        // Filter out the default message for admin
        const filteredMessages = response.data.filter(msg => msg.text !== "Wait for the admin or support team reply");
        setMessages(filteredMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // Set user ID on connection (for admin, you might use a different userId or role)
    socket.emit("set_user_id", "defaultUserId"); // Adjust as needed for admin

    socket.on("connect", () => {
      console.log("✅ Admin connected to Socket.IO");
    });

    socket.on("receive_message", (data) => {
      console.log("📩 Message received:", data);
      // Filter out the default message for admin
      if (data.text !== "Wait for the admin or support team reply") {
        setMessages((prev) => {
          const isDuplicate = prev.some(
            (msg) => msg.text === data.text && msg.sender === data.sender
          );
          if (!isDuplicate) {
            return [...prev, data];
          }
          return prev;
        });
      }
    });

    return () => {
      socket.off("connect");
      socket.off("receive_message");
    };
  }, []);

  const sendMessage = () => {
    if (input.trim() !== "") {
      const messageData = { 
        text: input, 
        sender: "admin", 
        userId: "defaultUserId" // Include userId
      };
      socket.emit("send_message", messageData); // Send message to user
      setMessages((prev) => [...prev, messageData]); // Show message instantly
      setInput("");
    }
  };

  const handleEmojiClick = (emojiObject) => {
    const cursorPosition = inputRef.current.selectionStart;
    const textBeforeCursor = input.substring(0, cursorPosition);
    const textAfterCursor = input.substring(cursorPosition);

    setInput(textBeforeCursor + emojiObject.emoji + textAfterCursor);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && input.trim() !== "") {
      sendMessage();
    }
  };

  return (
    <div className="admin-mobile-container">
      <div className={`admin-chat-container ${darkMode ? "dark" : "light"}`}>
        <div className="admin-chat-header">
          <h2>👨‍💻 Admin Support</h2>
          <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
        </div>

        <div className="admin-chat-box">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>

        {showEmojiPicker && (
          <div className="admin-emoji-picker">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        <div className="admin-chat-input">
          <button className="admin-emoji-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            <FaSmile />
          </button>
          <input
            type="text"
            placeholder="Reply to user..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress} // Add this to detect Enter key
            ref={inputRef}
          />
          <button onClick={sendMessage}>
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminChatbox;