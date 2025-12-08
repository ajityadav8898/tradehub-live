const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { auth } = require("../middleware/authMiddleware");

// Route for user signup
router.post("/signup", authController.signup);

// Route for user login
router.post("/login", authController.login);

// Corrected route for user logout
// It now requires a valid token to log the event
router.post("/logout", auth, authController.logout);

module.exports = router;