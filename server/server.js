const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

require("dotenv").config(); // To load environment variables

// --- 0. CRITICAL ENVIRONMENT VARIABLE CHECKS ---
if (!process.env.JWT_SECRET) {
    console.error("❌ FATAL ERROR: JWT_SECRET is not defined in the .env file!");
    process.exit(1);
}
if (!process.env.MONGO_URI) {
    console.error("❌ FATAL ERROR: MONGO_URI is not defined in the .env file!");
    process.exit(1);
}
// ------------------------------------------------

// --- Import Unified Routers ---
const authRoutes = require("./routes/auth");
const ebooksRoutes = require("./routes/ebooks");

const app = express();
const server = http.createServer(app);

// --- 1. DATABASE CONNECTION (FINAL STABILITY FIX APPLIED) ---
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            // FIX: Options for connection stability and resilience
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
        });
        console.log("✅ MongoDB Connected!");
    } catch (err) {
        console.error("❌ MongoDB Connection Failed:", err.message);
        // Do not exit, try to reconnect
        setTimeout(connectDB, 5000);
    }
};
connectDB();

// --- 2. CORS Configuration ---
const corsOptions = {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
};
app.use(cors(corsOptions));

// --- 3. Middleware (CRITICAL FIX FOR DATA PARSING AND AUTH STABILITY) ---
// FIX 1: Body parser for application/json requests
app.use(express.json());
// FIX 2: Body parser for application/x-www-form-urlencoded data (Required for Axios/Frontend reliability)
app.use(express.urlencoded({ extended: true }));
// The combination ensures data is always parsed correctly, eliminating 'undefined' errors.

// ✅ Serve Static Files
const staticPath = path.join(__dirname, '..', 'client', 'build');
app.use(express.static(staticPath));

// Serve Uploads Statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 4. API ROUTING ---
app.use("/api/auth", authRoutes);
app.use("/api/ebooks", ebooksRoutes);
// // app.use("/api/trade", require("./routes/tradeRoutes"));
app.use("/api/chat", require("./routes/chatRoutes"));

// --- Import Chat Model ---
const ChatMessage = require("./models/ChatMessage");

// --- 5. CLIENT-SIDE ROUTING (Final Catch-all) ---
app.use((req, res, next) => {
    if (!req.path.startsWith('/api/') && req.accepts('html')) {
        return res.sendFile(path.join(staticPath, 'index.html'));
    }
    next();
});


// --- 6. SOCKET.IO SETUP (for Chat & Market Data) ---
const io = new Server(server, {
    cors: corsOptions,
});

// Initialize Market Data Service (Starts Ticker)
// // const marketDataService = require("./services/MarketDataService");
// // marketDataService.init(io);

// Track connected users by userId
const connectedUsers = new Map(); // Map of socket.id to userId

io.on("connection", (socket) => {
    console.log(`\n💬 A user connected: ${socket.id}`);

    // Send initial prices immediately upon connection
    // // socket.emit("priceUpdate", marketDataService.currentPrices);

    // --- CHAT EVENTS ---
    socket.on("set_user_id", (userId) => {
        connectedUsers.set(socket.id, userId);
        console.log(`User ${userId} connected with socket ${socket.id}`);
    });

    socket.on("send_message", (data) => {
        console.log(`📨 SERVER RECEIVED MSG from ${data.sender}: ${data.text}`);
        const userId = data.userId || "defaultUserId";
        const messageData = {
            text: data.message || data.text, // Handle both formats
            message: data.message || data.text,
            sender: data.sender,
            userId: userId,
            timestamp: new Date()
        };

        // Save to DB
        const newMessage = new ChatMessage(messageData);
        newMessage.save().then(() => {
            console.log("✅ Message SAVED to DB. Broadcasting...");
            // Broadcast to everyone (admin needs to see it too)
            io.emit("receive_message", messageData);

            // Auto-reply logic (if user sent message)
            if (data.sender === "user") {
                // Check if user already got auto-reply in this session
                const userState = connectedUsers.get(socket.id) || {};
                if (!userState.hasReceivedDefault) {
                    console.log("🤖 Sending Auto-Reply...");
                    const autoReply = {
                        text: "Wait for the admin or support team reply",
                        message: "Wait for the admin or support team reply",
                        sender: "admin",
                        userId: userId,
                        timestamp: new Date()
                    };
                    const adminMsg = new ChatMessage(autoReply);
                    adminMsg.save().then(() => {
                        io.emit("receive_message", autoReply);
                        // Mark as replied
                        connectedUsers.set(socket.id, { ...userState, hasReceivedDefault: true });
                    });
                }
            }
        }).catch(err => console.error("❌ Chat Save Error:", err));
    });

    socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.id}`);
        connectedUsers.delete(socket.id);
    });
});

// --- 7. SERVER START ---
const PORT = 5001; // Hardcoded to prevent conflicts
server.listen(PORT, () => console.log(`\n🚀 TradeHub Unified Backend Server listening on port ${PORT}`));