const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Path adjusted to centralized models directory

// Middleware to verify JWT token
const auth = (req, res, next) => {
    // Get the token from the request header (standard practice)
    const token = req.header("x-auth-token");

    // Check if the token exists
    if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }

    // Verify the token
    try {
        // You MUST have a JWT_SECRET defined in your server/.env file
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach the user information from the token payload to the request
        req.user = decoded.user;
        next(); // Proceed to the next middleware or route handler
    } catch (err) {
        res.status(401).json({ msg: "Token is not valid" });
    }
};

// Middleware to check if the authenticated user is an admin
const isAdmin = async (req, res, next) => {
    // This relies on req.user being populated by the 'auth' middleware
    if (!req.user || !req.user.id) {
        return res.status(401).json({ msg: "Authentication required" });
    }
    
    try {
        const user = await User.findById(req.user.id);
        if (user && user.role === "admin") {
            next(); // Allow access
        } else {
            return res.status(403).json({ msg: "Access denied: Not an admin" });
        }
    } catch (err) {
        res.status(500).json({ msg: "Server error" });
    }
};

module.exports = { auth, isAdmin };