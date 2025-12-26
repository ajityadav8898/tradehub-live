const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app); // Create an HTTP server

// Enable CORS and JSON parsing
app.use(express.json());

// ✅ CORS Configuration
const allowedOrigins = [
    "http://127.0.0.1:5555",
    "http://localhost:5555",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
];

const corsOptions = {
    origin: function (origin, callback) {
        console.log("Request Origin:", origin);
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.error("Blocked Origin:", origin);
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"], // Allow for API and Socket.io
    allowedHeaders: ["Content-Type"],
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI || "mongodb+srv://ajityadav8898:Yajit%408898@cluster0.r4giw.mongodb.net/tradehub-chatbox")
    .then(() => console.log("✅ MongoDB Connected Successfully!"))
    .catch(err => console.log("❌ MongoDB Connection Error:", err));

// Define a Mongoose Schema for Chat Messages
const chatSchema = new mongoose.Schema({
    userId: String, // User's ID
    message: String, // Message content
    sender: String, // "user" or "admin"
    timestamp: { type: Date, default: Date.now }
});

// Create a Model from the Schema
const ChatMessage = mongoose.model("ChatMessage", chatSchema);

// **Socket.io Setup**
const io = new Server(server, {
    cors: {
        origin: allowedOrigins, // Use the allowedOrigins array directly for Socket.io
        methods: ["GET", "POST"],
        credentials: true
    },
});

// Track connected users by userId (simplified for this example)
const connectedUsers = new Map(); // Map of socket.id to userId

// **Handle Socket.io Connections**
io.on("connection", (socket) => {
    console.log(`✅ A user connected: ${socket.id}`);

    // Store userId when a user connects (assuming userId is sent on connection)
    socket.on("set_user_id", (userId) => {
        connectedUsers.set(socket.id, userId);
        console.log(`User ${userId} connected with socket ${socket.id}`);
    });

    socket.on("send_message", (data) => {
        console.log(`📨 Message received from ${data.sender}: ${data.text}`);
        const userId = data.userId || "defaultUserId";
        const messageData = {
            text: data.text,
            sender: data.sender,
            userId: userId
        };

        // Save the message to MongoDB
        const newMessage = new ChatMessage(messageData);
        newMessage.save().then(() => {
            // Broadcast the message to all connected clients except the sender
            socket.broadcast.emit("receive_message", messageData);

            // If the sender is a user, send the default admin message only to the user (not the admin)
            if (data.sender === "user" && !connectedUsers.get(socket.id)?.hasReceivedDefault) {
                const defaultAdminMessage = {
                    text: "Wait for the admin or support team reply",
                    sender: "admin",
                    userId: userId
                };

                const adminMessage = new ChatMessage(defaultAdminMessage);
                adminMessage.save().then(() => {
                    // Emit the default message only to the user (not broadcast to all)
                    const userSocket = Array.from(connectedUsers.entries())
                        .find(([_, uid]) => uid === userId)?.[0];
                    if (userSocket) {
                        io.to(userSocket).emit("receive_message", defaultAdminMessage);
                    }
                    // Mark that this user has received the default message
                    connectedUsers.get(socket.id).hasReceivedDefault = true;
                }).catch((error) => {
                    console.error("Error saving admin message:", error);
                });
            }
        }).catch((error) => {
            console.error("Error saving user message:", error);
        });
    });

    socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.id}`);
        connectedUsers.delete(socket.id);
    });
});

// **API Route to Get All Messages**
app.get("/get-messages/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const messages = await ChatMessage.find({ userId }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: "Error fetching messages" });
    }
});

// **Start the Server**
const PORT = process.env.CHAT_PORT || 5002; // Use CHAT_PORT for specificity
server.listen(PORT, () => {
    console.log(`🚀 Chat Server running on port ${PORT}`);
});