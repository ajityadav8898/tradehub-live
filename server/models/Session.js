const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    username: { type: String, required: true },
    loginTime: { type: Date, default: Date.now },
    logoutTime: { type: Date, default: null }
});

module.exports = mongoose.model("Session", sessionSchema);