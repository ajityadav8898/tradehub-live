const express = require("express");
const router = express.Router();
const { auth: protect } = require("../middleware/authMiddleware");
const tradeController = require("../controllers/tradeController");

// @route   POST /api/trade/place
// @desc    Place a trade (Buy/Sell)
router.post("/place", protect, tradeController.placeTrade);

// @route   GET /api/trade/portfolio
// @desc    Get user's portfolio and balance
router.get("/portfolio", protect, tradeController.getPortfolio);

// @route   GET /api/trade/history
// @desc    Get user's trade history
router.get("/history", protect, tradeController.getHistory);

// @route   POST /api/trade/reset
// @desc    Reset virtual balance and clear data
router.post("/reset", protect, tradeController.resetAccount);

// @route   GET /api/trade/search
// @desc    Search for new symbols
router.get("/search", protect, tradeController.searchSymbols);

module.exports = router;
