const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const UserActivity = require("../models/UserActivity");
const Session = require("../models/Session");

// ✅ User Signup function
exports.signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        // const hashedPassword = await bcrypt.hash(password, 10); // REMOVED: User model handles hashing
        const newUser = new User({ username, email, password }); // Pass plain password
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server error", details: error.message });
    }
};

// ✅ User Login function
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body; // Frontend sends email, not username
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const payload = { user: { id: user._id, role: user.role } };
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: "1h" },
            (err, token) => {
                if (err) throw err;
                res.json({ token, userRole: user.role });
            }
        );

        const newSession = new Session({
            userId: user._id,
            username: user.username,
        });
        await newSession.save();

        const userActivity = new UserActivity({
            userId: user._id,
            username: user.username,
            action: "login",
        });
        await userActivity.save();

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error", details: error.message });
    }
};

// ✅ Corrected User Logout function
exports.logout = async (req, res) => {
    try {
        const { id, username } = req.user; // Get user data from JWT via middleware

        const userActivity = new UserActivity({
            userId: id,
            username: username,
            action: "logout",
        });
        await userActivity.save();

        // Update the last active session with a logout time
        await Session.findOneAndUpdate(
            { userId: id, logoutTime: null },
            { logoutTime: new Date() }
        );

        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Logout Error:", error);
        res.status(500).json({ message: "Server error", details: error.message });
    }
};