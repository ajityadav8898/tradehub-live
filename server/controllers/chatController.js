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
// @desc    Get list of unique users who have chatted
exports.getUsers = async (req, res) => {
    try {
        const userIds = await ChatMessage.distinct("userId");
        const User = require("../models/User"); // Import User model

        // Map userId to username if possible
        const users = await Promise.all(userIds.map(async (id) => {
            let username = id; // Default to ID
            // Check if ID is a valid ObjectId (real user) vs "guest_user"
            if (id.match(/^[0-9a-fA-F]{24}$/)) {
                const user = await User.findById(id).select("username");
                if (user) username = user.username;
            } else if (id === "guest_user") {
                username = "Guest User";
            }
            return { userId: id, username };
        }));

        res.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Error fetching users" });
    }
};
