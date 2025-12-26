const ChatMessage = require("../models/ChatMessage");

// @desc    Get chat history for a user
// @access  Public (or Private depending on needs, simplifying for now as per original)
exports.getMessages = async (req, res) => {
    const { userId } = req.params;
    try {
        const messages = await ChatMessage.find({ userId }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Error fetching messages" });
    }
};
