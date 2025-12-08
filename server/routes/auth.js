const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { auth } = require("../middleware/authMiddleware"); // Import auth middleware

// --- Helper function to generate JWT ---
const generateToken = (id, role) => {
    const payload = {
        user: { id, role }
    };
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1d', // Token validity: 1 day
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ email });
        if (user) {
            // Log this specific condition
            console.log(`DEBUG: Registration failed for email ${email}: User already exists.`);
            return res.status(400).json({ msg: "User already exists" });
        }

        user = new User({ username, email, password }); 
        await user.save();

        const token = generateToken(user.id, user.role);
        console.log(`DEBUG: User registered successfully: ${username}`);

        res.status(201).json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
        // CRITICAL DEBUG: Print the full error stack
        console.error("CRITICAL ERROR during registration:", err.message, err.stack);
        res.status(500).send("Server error during registration");
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Find User
        let user = await User.findOne({ email });
        if (!user) {
            console.log(`DEBUG: Login failed for email ${email}: User not found.`);
            return res.status(400).json({ msg: "Invalid Credentials" });
        }
        
        // 2. Compare Password
        const isMatch = await user.matchPassword(password); 
        if (!isMatch) {
            console.log(`DEBUG: Login failed for user ${user.username}: Password mismatch.`);
            return res.status(400).json({ msg: "Invalid Credentials" });
        }

        // 3. Generate Token
        const token = generateToken(user.id, user.role);
        console.log(`DEBUG: User logged in successfully: ${user.username}`);

        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
        // CRITICAL DEBUG: Print the full error stack
        console.error("CRITICAL ERROR during login:", err.message, err.stack);
        res.status(500).send("Server error during login");
    }
});

// @route   GET /api/auth/user
// @desc    Get logged in user details
// @access  Private (Requires JWT)
router.get("/user", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        res.json(user);
    } catch (err) {
        console.error("CRITICAL ERROR fetching user data:", err.message);
        res.status(500).send("Server Error fetching user data");
    }
});

module.exports = router;