const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    symbol: { type: String, required: true },
    instrument: { type: String, enum: ["Stock", "Index", "Option", "Future", "Equity", "Options", "Futures", "Mutual Funds"], required: true },
    quantity: { type: Number, required: true },
    averagePrice: { type: Number, required: true },
    stopLoss: { type: Number, default: 0 },
});

// Compound index to ensure one entry per symbol+instrument per user
portfolioSchema.index({ userId: 1, symbol: 1, instrument: 1 }, { unique: true });

module.exports = mongoose.models.Portfolio || mongoose.model("Portfolio", portfolioSchema);
