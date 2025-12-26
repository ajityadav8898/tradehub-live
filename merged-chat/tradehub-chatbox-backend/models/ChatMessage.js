const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
    userId: { type: String, required: true },  // User's unique ID
    message: { type: String, required: true },
    sender: { type: String, enum: ["user", "admin"], required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
