const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { isAdmin } = require("../middleware/authMiddleware");

// All admin routes are protected by the `isAdmin` middleware
router.get("/sessions", isAdmin, adminController.getAllSessions);
router.get("/activity-log", isAdmin, adminController.getActivityLog);
router.post("/terminate-session/:sessionId", isAdmin, adminController.terminateSession);

module.exports = router;