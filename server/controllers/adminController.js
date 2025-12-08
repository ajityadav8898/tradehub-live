const Session = require("../models/Session");
const UserActivity = require("../models/UserActivity");

// ✅ GET all user login sessions
exports.getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.find().sort({ loginTime: -1 });
        res.json(sessions);
    } catch (error) {
        console.error("Error fetching sessions:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ GET all user activity logs
exports.getActivityLog = async (req, res) => {
    try {
        const activities = await UserActivity.find().sort({ timestamp: -1 });
        res.json(activities);
    } catch (err) {
        console.error("Error fetching activity log:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ POST to terminate a user session
exports.terminateSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await Session.findById(sessionId);

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        session.logoutTime = new Date();
        await session.save();

        res.json({ message: "Session terminated successfully" });
    } catch (error) {
        console.error("Error terminating session:", error);
        res.status(500).json({ message: "Server error" });
    }
};