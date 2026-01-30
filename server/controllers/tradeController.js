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
    // if (!isMarketOpen()) {
    //     return res.status(403).json({
    //         message: "Market is Closed. Trading hours: Mon-Fri 9:15 AM - 3:30 PM IST."
    //     });
    // }
    // NOTE: Commented out Market Hours check for User Testing convenience as requested.

    const { symbol, instrument, action, quantity, orderType, limitPrice, stopLoss } = req.body;
    const userId = req.user.id;

    try {
        console.log("PlaceTrade Req:", req.body); // DEBUG LOG
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        console.log("User Balance before trade:", user.virtualBalance); // DEBUG LOG

        // Initialize balance if missing
        if (user.virtualBalance === undefined || user.virtualBalance === null || isNaN(user.virtualBalance)) {
            user.virtualBalance = 1000000;
            await user.save();
        }

        const qty = Number(quantity);
        if (isNaN(qty) || qty <= 0) {
            return res.status(400).json({ message: "Invalid quantity" });
        }

        if (orderType === 'LIMIT') {
            // --- LIMIT ORDER LOGIC ---
            // 1. Create Pending Trade
            const trade = await Trade.create({
                userId,
                symbol,
                instrument: instrument || "Equity",
                action,
                quantity: qty,
                price: Number(limitPrice),
                orderType: "LIMIT",
                status: "PENDING",
                stopLoss: stopLoss ? Number(stopLoss) : undefined
            });

            // 2. Reserve Funds for BUY
            if (action === "BUY") {
                const totalCost = qty * Number(limitPrice);
                if (user.virtualBalance < totalCost) {
                    return res.status(400).json({ message: `Insufficient balance for Limit Order. Need ₹${totalCost.toFixed(2)}` });
                }
                user.virtualBalance -= totalCost;
                await user.save();
            } else if (action === "SELL") {
                // For Sell Limit, ensure they own the stock
                const portfolioItem = await Portfolio.findOne({ userId, symbol });
                if (!portfolioItem || portfolioItem.quantity < qty) {
                    return res.status(400).json({ message: "Insufficient holdings to place Sell Limit" });
                }
                // We do NOT deduct stock yet, but we could "lock" it if we had that field. 
                // For now, we trust the validation at placement time and re-validate at execution.
            }

            return res.json({ message: "Limit Order Placed Successfully", balance: user.virtualBalance, trade });

        } else {
            // --- MARKET ORDER LOGIC (Immediate Execution) ---

            // ... (Existing calculation logic refactored for clarity)
            const executionPrice = req.body.price ? Number(req.body.price) : marketDataService.getPrice(symbol);
            const totalCost = qty * executionPrice;

            if (action === "BUY") {
                if (user.virtualBalance < totalCost) {
                    return res.status(400).json({ message: `Insufficient balance. Need ₹${totalCost.toFixed(2)}` });
                }
                user.virtualBalance -= totalCost;
                await user.save();

                let portfolioItem = await Portfolio.findOne({ userId, symbol });
                if (portfolioItem) {
                    const totalValue = portfolioItem.averagePrice * portfolioItem.quantity + totalCost;
                    const totalQty = portfolioItem.quantity + qty;
                    portfolioItem.averagePrice = totalValue / totalQty;
                    portfolioItem.quantity = totalQty;
                    await portfolioItem.save();
                } else {
                    await Portfolio.create({
                        userId, symbol, instrument: instrument || "Equity", quantity: qty, averagePrice: executionPrice
                    });
                }
            } else if (action === "SELL") {
                const portfolioItem = await Portfolio.findOne({ userId, symbol });
                if (!portfolioItem || portfolioItem.quantity < qty) {
                    return res.status(400).json({ message: "Insufficient holdings to sell" });
                }
                user.virtualBalance += totalCost;
                await user.save();

                portfolioItem.quantity -= qty;
                if (portfolioItem.quantity <= 0) await Portfolio.deleteOne({ _id: portfolioItem._id });
                else await portfolioItem.save();
            }

            const trade = await Trade.create({
                userId, symbol, instrument: instrument || "Equity", action, quantity: qty, price: executionPrice, orderType: "MARKET", status: "EXECUTED", stopLoss
            });

            return res.json({ message: "Trade Executed Successfully", balance: user.virtualBalance, trade });
        }
    } catch (error) {
        console.error("Trade Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Execute a Pending Limit Order (Triggered by Frontend)
// @access  Private
exports.executeLimitOrder = async (req, res) => {
    try {
        const { tradeId, executionPrice } = req.body;
        const trade = await Trade.findById(tradeId);

        if (!trade) return res.status(404).json({ message: "Trade not found" });
        if (trade.status !== "PENDING") return res.status(400).json({ message: "Trade is not pending" });
        if (trade.userId.toString() !== req.user.id) return res.status(403).json({ message: "Unauthorized" });

        const user = await User.findById(req.user.id);
        const qty = trade.quantity;
        const price = Number(executionPrice);
        const totalCost = qty * price;

        if (trade.action === "BUY") {
            // Funds were already reserved at Limit Price.
            // Refund difference if Actual Price < Limit Price
            const reservedCost = qty * trade.price;
            const refund = reservedCost - totalCost;

            if (refund > 0) {
                user.virtualBalance += refund;
                await user.save();
            }

            let portfolioItem = await Portfolio.findOne({ userId: req.user.id, symbol: trade.symbol });
            if (portfolioItem) {
                const totalValue = portfolioItem.averagePrice * portfolioItem.quantity + totalCost;
                const totalQty = portfolioItem.quantity + qty;
                portfolioItem.averagePrice = totalValue / totalQty;
                portfolioItem.quantity = totalQty;
                await portfolioItem.save();
            } else {
                await Portfolio.create({
                    userId: req.user.id, symbol: trade.symbol, instrument: trade.instrument, quantity: qty, averagePrice: price
                });
            }

        } else if (trade.action === "SELL") {
            const portfolioItem = await Portfolio.findOne({ userId: req.user.id, symbol: trade.symbol });
            if (!portfolioItem || portfolioItem.quantity < qty) {
                trade.status = "CANCELLED";
                await trade.save();
                return res.status(400).json({ message: "Order Failed: Insufficient holdings at execution" });
            }

            portfolioItem.quantity -= qty;
            if (portfolioItem.quantity <= 0) await Portfolio.deleteOne({ _id: portfolioItem._id });
            else await portfolioItem.save();

            user.virtualBalance += totalCost;
            await user.save();
        }

        trade.status = "EXECUTED";
        trade.price = price;
        await trade.save();

        res.json({ message: "Limit Order Executed", balance: user.virtualBalance, trade });

    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Get user's portfolio and balance
// @access  Private
exports.getPortfolio = async (req, res) => {
    try {
        let user = await User.findById(req.user.id);
        console.log("GetPortfolio User:", req.user.id, "Balance:", user ? user.virtualBalance : "User Not Found"); // DEBUG LOG

        // Initialize or Recover if missing/zero (Safety fallback)
        if (user.virtualBalance === undefined || user.virtualBalance === null || user.virtualBalance === 0) {
            user.virtualBalance = 1000000;
            await user.save();
        }

        const portfolio = await Portfolio.find({ userId: req.user.id });
        res.json({ balance: Number(user.virtualBalance), portfolio });
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

// @desc    Update Stop Loss for a position
// @access  Private
exports.updateStopLoss = async (req, res) => {
    try {
        const { symbol, stopLoss } = req.body;

        let portfolioItem = await Portfolio.findOne({ userId: req.user.id, symbol });
        if (portfolioItem) {
            portfolioItem.stopLoss = Number(stopLoss);
            await portfolioItem.save();
        }
        res.json({ message: "Stop Loss Updated", stopLoss });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

// @desc    Search Symbols (Stub for API compatibility)
exports.searchSymbols = async (req, res) => {
    res.json({ message: "Search not implemented on backend yet, use frontend mock." });
};
