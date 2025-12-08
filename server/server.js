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
const staticPath = path.join(__dirname, '..', 'client', 'public');
app.use(express.static(staticPath));

// --- 4. API ROUTING ---
app.use("/api/auth", authRoutes);
app.use("/api/ebooks", ebooksRoutes); 

// --- 5. CLIENT-SIDE ROUTING (Final Catch-all) ---
app.use((req, res, next) => {
    if (!req.path.startsWith('/api/') && req.accepts('html')) {
        return res.sendFile(path.join(staticPath, 'index.html'));
    }
    next();
});


// --- 6. SOCKET.IO SETUP (for Chat) ---
const io = new Server(server, {
    cors: corsOptions,
});

io.on("connection", (socket) => {
    console.log(`\n💬 A user connected for chat: ${socket.id}`);
    
    socket.on("disconnect", () => {
        console.log("User disconnected from chat");
    });
});

// --- 7. SERVER START ---
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`\n🚀 TradeHub Unified Backend Server listening on port ${PORT}`));