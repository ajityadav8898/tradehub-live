import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaSmile } from "react-icons/fa";
import { Switch } from "@mui/material";
import EmojiPicker from "emoji-picker-react";
import io from "socket.io-client";
import axios from "axios"; // Add axios for HTTP requests
import "./UserChatbox.css";

// Use environment variable for the chat backend port
const socket = io(process.env.REACT_APP_CHAT_API); // Updated to use environment variable

const UserChatbox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [hasSentFirstMessage, setHasSentFirstMessage] = useState(false);
  const inputRef = useRef(null);

  // Fetch messages from MongoDB when the component mounts
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const userId = "defaultUserId"; // Replace with actual user ID from your auth system
        const response = await axios.get(`${process.env.REACT_APP_CHAT_API}/get-messages/${userId}`); // Updated to use environment variable
        if (response.data.length > 0) {
          setMessages(response.data);
          // Check if user has already sent a message to set hasSentFirstMessage
          const userMessages = response.data.filter(msg => msg.sender === "user");
          setHasSentFirstMessage(userMessages.length > 0);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();

    // Set user ID on connection
    socket.emit("set_user_id", "defaultUserId");

    socket.on("connect", () => {
      console.log("✅ User connected to Socket.IO");
    });

    socket.on("receive_message", (data) => {
      console.log("📩 Message received:", data);
      setMessages((prev) => {
        const isDuplicate = prev.some(
          (msg) => msg.text === data.text && msg.sender === data.sender
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
  }, []);

  const sendMessage = () => {
    if (input.trim() !== "") {
      const messageData = { 
        text: input, 
        sender: "user", 
        userId: "defaultUserId" // Include userId
      };
      socket.emit("send_message", messageData); // Send message to backend
      setMessages((prev) => {
        const updatedMessages = [...prev, messageData];
        // If this is the first user message, the default message will be handled by the backend
        return updatedMessages;
      });
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
    <div className="mobile-container">
      <div className={`chat-container ${darkMode ? "dark" : "light"}`}>
        <div className="chat-header">
          <h2>📊 TradeHub Support</h2>
          <Switch checked={darkMode} onChange={() => setDarkMode(!darkMode)} />
        </div>

        <div className="chat-box">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
        </div>

        {showEmojiPicker && (
          <div className="emoji-picker">
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}

        <div className="chat-input">
          <button className="emoji-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
            <FaSmile />
          </button>
          <input
            type="text"
            placeholder="Type your query..."
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

export default UserChatbox;