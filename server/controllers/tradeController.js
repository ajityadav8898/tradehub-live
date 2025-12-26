const User = require("../models/User");
const Trade = require("../models/Trade");
const Portfolio = require("../models/Portfolio");
const marketDataService = require("../services/MarketDataService");
const yahooFinance = require('yahoo-finance2').default; // Use default import

// --- Helper: Check Market Hours (IST 9:15 AM - 3:30 PM) ---
const isMarketOpen = () => {
    // Get current time in IST
    const now = new Date();
    // UTC time
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    // IST offset is GMT +5:30
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(utcTime + istOffset);

    const day = istTime.getDay(); // 0 = Sun, 6 = Sat
    const hour = istTime.getHours();
    const minute = istTime.getMinutes();

    // 1. Weekend Check (Sat/Sun)
    if (day === 0 || day === 6) return false;

    // 2. Holiday Check (Simple static list for now)
    const dateStr = istTime.toISOString().split('T')[0]; // YYYY-MM-DD
    const HOLIDAYS = [
        "2024-12-25", // Christmas
        "2025-01-01", // New Year
        "2025-01-26", // Republic Day
        "2025-08-15", // Independence Day
        "2025-10-02", // Gandhi Jayanti
        "2025-12-25"  // Christmas Next Year
    ];
    if (HOLIDAYS.includes(dateStr)) return false;

    // 3. Time Check (09:15 - 15:30)
    const currentTimeVal = hour * 60 + minute;
    const marketOpenVal = 9 * 60 + 15;   // 09:15
    const marketCloseVal = 15 * 60 + 30; // 15:30

    return currentTimeVal >= marketOpenVal && currentTimeVal <= marketCloseVal;
};

// @desc    Search for symbols (Global Search)
// @access  Private
exports.searchSymbols = async (req, res) => {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Query required" });

    try {
        const results = await yahooFinance.search(query);
        // Return results (filtered for active/valid if possible)
        const filtered = results.quotes.filter(q => q.isYahooFinance !== false);
        res.json(filtered);
    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ message: "Search failed" });
    }
};

// @desc    Place a trade (Buy/Sell)
// @access  Private
exports.placeTrade = async (req, res) => {
    // 1. Market Hours Check
    if (!isMarketOpen()) {
        return res.status(403).json({
            message: "Market is Closed. Trading hours: Mon-Fri 9:15 AM - 3:30 PM IST."
        });
    }

    const { symbol, instrument, action, quantity, orderType, limitPrice } = req.body;
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Initialize balance if missing
        if (user.virtualBalance === undefined || user.virtualBalance === null || isNaN(user.virtualBalance)) {
            user.virtualBalance = 1000000;
            await user.save();
        }

        const qty = Number(quantity);
        if (isNaN(qty) || qty <= 0) {
            return res.status(400).json({ message: "Invalid quantity" });
        }

        // --- PRICE AUTHORITY ---
        let executionPrice = 0;
        if (orderType === 'LIMIT') {
            // For LIMIT orders in this demo, we can just execute if current price <= limit (Buy) or >= limit (Sell).
            // But for simplicity/MVP, we'll treat LIMIT as "Execute at this price if valid".
            // Ideally we'd add to an "Open Orders" book.
            // Let's stick to MKT orders for "Real" feel (Instant exec).
            // If LIMIT provided, we use it, but typically we should check against market.
            // For now, let's use Market Price for MARKET orders.
            executionPrice = Number(limitPrice);
        } else {
            // MARKET ORDER: Get price from Server Service
            executionPrice = marketDataService.getPrice(symbol);
            if (!executionPrice || executionPrice <= 0) {
                return res.status(500).json({ message: "Market Closed or Price Unavailable" });
            }
        }

        const totalCost = qty * executionPrice;

        if (action === "BUY") {
            if (user.virtualBalance < totalCost) {
                return res.status(400).json({ message: `Insufficient balance. Need ₹${totalCost.toFixed(2)}` });
            }

            // 1. Deduct Balance
            user.virtualBalance -= totalCost;
            await user.save();

            // 2. Update/Create Portfolio
            let portfolioItem = await Portfolio.findOne({ userId, symbol });
            if (portfolioItem) {
                // Weighted Average Price
                const totalValue = portfolioItem.averagePrice * portfolioItem.quantity + totalCost;
                const totalQty = portfolioItem.quantity + qty;
                portfolioItem.averagePrice = totalValue / totalQty;
                portfolioItem.quantity = totalQty;
                await portfolioItem.save();
            } else {
                await Portfolio.create({
                    userId,
                    symbol,
                    instrument: instrument || "Equity",
                    quantity: qty,
                    averagePrice: executionPrice,
                });
            }
        } else if (action === "SELL") {
            const portfolioItem = await Portfolio.findOne({ userId, symbol });
            if (!portfolioItem || portfolioItem.quantity < qty) {
                return res.status(400).json({ message: "Insufficient holdings to sell" });
            }

            // 1. Add Balance
            user.virtualBalance += totalCost;
            await user.save();

            // 2. Update Portfolio
            portfolioItem.quantity -= qty;
            if (portfolioItem.quantity <= 0) {
                await Portfolio.deleteOne({ _id: portfolioItem._id });
            } else {
                await portfolioItem.save();
            }
        }

        // 3. Record Trade
        const trade = await Trade.create({
            userId,
            symbol,
            instrument: instrument || "Equity",
            action,
            quantity: qty,
            price: executionPrice,
            orderType: orderType || "MARKET",
            status: "EXECUTED",
        });

        res.json({
            message: `Order Executed @ ${executionPrice.toFixed(2)}`,
            trade,
            balance: user.virtualBalance,
            executionPrice
        });

    } catch (error) {
        console.error("Trade Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get user's portfolio and balance
// @access  Private
exports.getPortfolio = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("virtualBalance");
        const portfolio = await Portfolio.find({ userId: req.user.id });
        res.json({ balance: user.virtualBalance, portfolio });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get user's trade history
// @access  Private
exports.getHistory = async (req, res) => {
    try {
        const trades = await Trade.find({ userId: req.user.id }).sort({ timestamp: -1 });
        res.json(trades);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Reset virtual balance
// @access  Private
exports.resetAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        user.virtualBalance = 1000000;
        await user.save();

        await Portfolio.deleteMany({ userId: req.user.id });
        await Trade.deleteMany({ userId: req.user.id });

        res.json({ message: "Account reset successfully", balance: 1000000 });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
