const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
    sender: { type: String, required: true }, // 'user' or 'admin'
    userId: { type: String, required: true }, // The user's ID (guest_user or actual ID)
    text: { type: String }, // Text content (optional if file exists)
    attachment: {
        url: { type: String },
        type: { type: String } // 'image', 'audio', 'file'
    },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
});

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
