const yahooFinance = require('yahoo-finance2').default; // Use default import for CommonJS

const WATCHLIST = [
    { symbol: "NIFTY 50" },
    { symbol: "BANKNIFTY" },
    { symbol: "RELIANCE" },
    { symbol: "TCS" },
    { symbol: "HDFCBANK" },
    { symbol: "INFY" },
    { symbol: "SBIN" },
    { symbol: "ITC" },
    { symbol: "ADANIENT" },
    { symbol: "TATAMOTORS" },
    { symbol: "BAJFINANCE" },
    { symbol: "MARUTI" },
];

const SYMBOL_MAP = {
    "NIFTY 50": "^NSEI",
    "BANKNIFTY": "^NSEBANK",
    "RELIANCE": "RELIANCE.NS",
    "TCS": "TCS.NS",
    "HDFCBANK": "HDFCBANK.NS",
    "INFY": "INFY.NS",
    "SBIN": "SBIN.NS",
    "ITC": "ITC.NS",
    "ADANIENT": "ADANIENT.NS",
    "TATAMOTORS": "TATAMOTORS.NS",
    "BAJFINANCE": "BAJFINANCE.NS",
    "MARUTI": "MARUTI.NS"
};

class MarketDataService {
    constructor() {
        this.currentPrices = {};
        this.io = null;
        this.interval = null;
        this.isFetching = false; // Prevent overlapping fetches

        // Initialize with rough base prices just in case
        this.currentPrices = {
            "NIFTY 50": 22000,
            "BANKNIFTY": 47000,
            "RELIANCE": 2900,
            "TCS": 4000,
            "HDFCBANK": 1450,
            "INFY": 1600,
            "SBIN": 750,
            "ITC": 430,
            "ADANIENT": 3200,
            "TATAMOTORS": 980,
            "BAJFINANCE": 6500,
            "MARUTI": 12000
        };
    }

    init(ioInstance) {
        this.io = ioInstance;
        console.log("✅ Market Data Service Initialized (Live Feed)");
        this.startTicker();
    }

    startTicker() {
        if (this.interval) clearInterval(this.interval);

        console.log("📈 Live Market Ticker Started (5s Interval)");
        // Fetch immediately on start
        this.fetchLivePrices();

        this.interval = setInterval(() => {
            this.fetchLivePrices();
        }, 5000); // Polling every 5 seconds to avoid rate limits
    }

    async fetchLivePrices() {
        if (this.isFetching) return;
        this.isFetching = true;

        try {
            const symbolsToFetch = Object.values(SYMBOL_MAP);

            // Yahoo Finance quote combination
            const results = await yahooFinance.quote(symbolsToFetch);

            if (results && Array.isArray(results)) {
                results.forEach(quote => {
                    // Find internal symbol for this Yahoo ticker
                    const internalSymbol = Object.keys(SYMBOL_MAP).find(key => SYMBOL_MAP[key] === quote.symbol);
                    if (internalSymbol) {
                        this.currentPrices[internalSymbol] = quote.regularMarketPrice;
                    }
                });

                // Broadcast
                if (this.io) {
                    this.io.emit("priceUpdate", this.currentPrices);
                    // console.log("📡 Prices Broadcasted");
                }
            }
        } catch (error) {
            console.error("❌ Market Data Fetch Error:", error.message);
        } finally {
            this.isFetching = false;
        }
    }

    getPrice(symbol) {
        return this.currentPrices[symbol] || 0;
    }
}

module.exports = new MarketDataService();
