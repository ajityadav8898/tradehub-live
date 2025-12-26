const express = require("express");
const ChatMessage = require("../models/ChatMessage");

const router = express.Router();

// Save a message to the database
router.post("/send-message", async (req, res) => {
    try {
        const { userId, message, sender } = req.body;
        const newMessage = new ChatMessage({ userId, message, sender });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: "Error saving message" });
    }
});

// Get all messages for a user (no filtering for user, but filter for admin if needed)
router.get("/get-messages/:userId", async (req, res) => {
    try {
        const messages = await ChatMessage.find({ userId: req.params.userId }).sort("timestamp");
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ error: "Error fetching messages" });
    }
});

module.exports = router;