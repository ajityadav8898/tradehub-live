const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    symbol: { type: String, required: true },
    instrument: { type: String, enum: ["Stock", "Index", "Option", "Future", "Equity", "Options", "Futures", "Mutual Funds", "Mutual Fund"], required: true },
    action: { type: String, enum: ["BUY", "SELL"], required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    orderType: { type: String, enum: ["MARKET", "LIMIT"], required: true },
    status: { type: String, enum: ["EXECUTED", "PENDING", "CANCELLED"], default: "EXECUTED" },
    stopLoss: { type: Number },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.models.Trade || mongoose.model("Trade", tradeSchema);
