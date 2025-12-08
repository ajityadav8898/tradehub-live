const mongoose = require("mongoose");

const userActivitySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, required: true },
    action: { type: String, enum: ["login", "logout"], required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("UserActivity", userActivitySchema);
