import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import TradingViewWidget from "./TradingViewWidget";
import "../../styles/PaperTrade.css";

axios.defaults.baseURL = "http://localhost:5000";

// --- Data Config (Static List, Price comes from Socket) ---
// --- Default Initial Watchlist ---
const INITIAL_WATCHLIST = [
  { symbol: "NIFTY 50", type: "Index", base: 22000 },
  { symbol: "BANKNIFTY", type: "Index", base: 47000 },
  { symbol: "RELIANCE", type: "Stock", base: 2500 },
  { symbol: "TCS", type: "Stock", base: 3500 },
  { symbol: "HDFCBANK", type: "Stock", base: 1500 },
  { symbol: "INFY", type: "Stock", base: 1400 },
  { symbol: "SBIN", type: "Stock", base: 600 },
  { symbol: "ITC", type: "Stock", base: 450 },
  { symbol: "ADANIENT", type: "Stock", base: 3000 },
  { symbol: "TATAMOTORS", type: "Stock", base: 950 },
  { symbol: "BAJFINANCE", type: "Stock", base: 7000 },
  { symbol: "MARUTI", type: "Stock", base: 11000 },
  { symbol: "ONGC", type: "Stock", base: 270 },
  { symbol: "POWERGRID", type: "Stock", base: 280 },
  { symbol: "TITAN", type: "Stock", base: 3600 },
  { symbol: "AXISBANK", type: "Stock", base: 1100 },
  { symbol: "WIPRO", type: "Stock", base: 480 },
  { symbol: "LICI", type: "Stock", base: 900 },
  { symbol: "COALINDIA", type: "Stock", base: 450 },
  { symbol: "ZOMATO", type: "Stock", base: 160 },
];

const PaperTradeApp = () => {
  // --- State ---
  // --- State ---
  const [balance, setBalance] = useState(0);
  const [portfolio, setPortfolio] = useState([]); // Holdings
  const [orders, setOrders] = useState([]); // History/Book

  // Watchlist & Market Data
  const [watchlist, setWatchlist] = useState(INITIAL_WATCHLIST);
  const [activeSymbol, setActiveSymbol] = useState(INITIAL_WATCHLIST[2]); // Default to RELIANCE
  const [livePrices, setLivePrices] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  // Search & Categories
  const [category, setCategory] = useState("All"); // All, Stock, Index
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // UI State
  const [bottomTab, setBottomTab] = useState("holdings"); // positions, holdings, orders
  const [orderAction, setOrderAction] = useState("BUY"); // BUY, SELL

  // Order Form
  const [qty, setQty] = useState(1);
  const [priceType, setPriceType] = useState("MARKET"); // MARKET, LIMIT
  const [limitPrice, setLimitPrice] = useState(0);

  const [loading, setLoading] = useState(true);

  // Socket Ref
  const socketRef = useRef();

  // --- Effect: Socket.io Connection ---
  useEffect(() => {
    // Connect to Backend
    socketRef.current = io("http://localhost:5000");

    socketRef.current.on("connect", () => {
      console.log("✅ Socket Connected to Market Feed");
      setIsConnected(true);
    });

    socketRef.current.on("priceUpdate", (prices) => {
      setLivePrices(prices);
      setLoading(false); // Data received, stop loading
    });

    socketRef.current.on("disconnect", () => {
      console.log("❌ Socket Disconnected");
      setIsConnected(false);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // --- Effect: Fetch User Data ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const config = { headers: { "x-auth-token": token } };

      const portRes = await axios.get("/api/trade/portfolio", config);
      setBalance(portRes.data.balance);
      setPortfolio(portRes.data.portfolio);

      const histRes = await axios.get("/api/trade/history", config);
      setOrders(histRes.data);
    } catch (err) {
      console.error(err);
      // Don't modify loading here, wait for socket
    }
  };

  // --- Search Logic ---
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length > 2) {
        try {
          const token = localStorage.getItem("token");
          const res = await axios.get(`/api/trade/search?query=${searchQuery}`, {
            headers: { "x-auth-token": token }
          });
          setSearchResults(res.data);
        } catch (err) {
          console.error("Search failed", err);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const addToWatchlist = (item) => {
    // Map Yahoo Finance result to internal structure
    const symbol = item.symbol.replace(".NS", "").replace(".BO", ""); // Clean symbol
    const newItem = {
      symbol: symbol,
      type: "Stock", // Default to Stock for search results
      base: item.regularMarketPrice || 0
    };

    // Prevent duplicates
    if (!watchlist.find(w => w.symbol === newItem.symbol)) {
      setWatchlist(prev => [newItem, ...prev]);
    }
    setActiveSymbol(newItem);
    setSearchQuery(""); // Clear search to show watchlist again
    setSearchResults([]);
  };

  // --- Handlers ---
  const handleOrder = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login");

    // SERVER SIDE PRICING: We do NOT send price for Market orders.
    // The server determines the execution price.

    // UI Validation only
    const estimatedPrice = livePrices[activeSymbol.symbol];
    if (priceType === 'LIMIT' && (!limitPrice || limitPrice <= 0)) {
      return alert("Please enter valid Limit Price");
    }

    try {
      const payload = {
        symbol: activeSymbol.symbol,
        instrument: activeSymbol.type === "Index" ? "Options" : "Equity",
        action: orderAction,
        quantity: Number(qty),
        orderType: priceType
      };

      if (priceType === 'LIMIT') {
        payload.limitPrice = Number(limitPrice);
      }

      await axios.post("/api/trade/place", payload, { headers: { "x-auth-token": token } });

      // alert("Order Placed Successfully"); // Removed for instant feel

      // OPTIONAL: Reset form
      // setQty(1);

      // Refresh Data
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Order Failed");
    }
  };

  // --- Handlers ---
  const handleExit = (pos) => {
    // 1. Find the symbol object (try watchlist first, else fallback)
    let target = watchlist.find(w => w.symbol === pos.symbol);
    if (!target) {
      target = { symbol: pos.symbol, type: "Stock", base: pos.averagePrice };
    }

    // 2. Set UI State
    setActiveSymbol(target);
    setOrderAction("SELL");
    setQty(pos.quantity);
    setPriceType("MARKET"); // Default to Market for exit

    // 3. Scroll to Order Panel (Mobile/Small screens) if needed
    // document.querySelector('.order-panel').scrollIntoView({ behavior: 'smooth' });
  };

  const handleReset = async () => {
    if (!window.confirm("Reset Virtual Account Balance to ₹10L?")) return;
    const token = localStorage.getItem("token");
    await axios.post("/api/trade/reset", {}, { headers: { "x-auth-token": token } });
    fetchData();
  };

  // --- Formatters ---
  const money = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  const num = (val) => new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

  // --- Render ---
  if (loading) return <div className="trade-app-root" style={{ alignItems: 'center', justifyContent: 'center' }}>Connecting to Market Feed...</div>;

  const currentPrice = livePrices[activeSymbol.symbol] || 0;
  // Use dynamic watchlist for base price
  const basePrice = watchlist.find(x => x.symbol === activeSymbol.symbol)?.base || 1;
  const isUp = currentPrice >= basePrice;
  const priceColor = isUp ? "text-green" : "text-red";
  const pctChange = ((currentPrice - basePrice) / basePrice) * 100;

  // Filter Watchlist
  const filteredWatchlist = watchlist.filter(item => {
    if (category === "All") return true;
    if (category === "Index") return item.type === "Index";
    if (category === "Stock") return item.type === "Stock";
    return true;
  });

  return (
    <div className="trade-app-root">

      {/* Top Ticker Bar */}
      <div className="indices-ticker">
        <div className="ticker-group">
          <div className="ticker-item">
            <span className="ticker-label">NIFTY 50</span>
            <span className={`ticker-value ${livePrices["NIFTY 50"] >= 22000 ? "text-green" : "text-red"}`}>
              {num(livePrices["NIFTY 50"])}
            </span>
          </div>
          <div className="ticker-item">
            <span className="ticker-label">BANKNIFTY</span>
            <span className={`ticker-value ${livePrices["BANKNIFTY"] >= 47000 ? "text-green" : "text-red"}`}>
              {num(livePrices["BANKNIFTY"])}
            </span>
          </div>
          <div className="ticker-item">
            <span className="ticker-label" style={{ fontSize: '0.7rem', opacity: 0.5 }}>
              {isConnected ? '🟢 LIVE FEED' : '🔴 DISCONNECTED'}
            </span>
          </div>
        </div>

        <div className="user-funds">
          <span>Available Margin: <strong className="text-mono" style={{ color: 'white' }}>{money(balance)}</strong></span>
          <button className="btn-reset" onClick={handleReset}>Reset Funds</button>
        </div>
      </div>

      <div className="pro-layout">

        {/* LEFT: Watchlist */}
        <div className="watchlist-sidebar">
          <div className="watchlist-header">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search Stocks (e.g. ZOMATO)"
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', fontSize: '0.8rem' }}>
              {["All", "Stock", "Index"].map(cat => (
                <span
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    cursor: 'pointer',
                    color: category === cat ? 'var(--pt-acc-blue)' : '#888',
                    fontWeight: category === cat ? 'bold' : 'normal'
                  }}
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div className="watchlist-items">
            {/* Render Search Results OR Watchlist */}

            {searchQuery.length > 2 && searchResults.length > 0 ? (
              searchResults.map((item, idx) => (
                <div key={idx} className="wl-item" onClick={() => addToWatchlist(item)}>
                  <div className="wl-sym-group">
                    <span className="wl-sym">{item.symbol}</span>
                    <span className="wl-exch">{item.exchange}</span>
                  </div>
                  <div className="wl-price-group">
                    <div className="wl-price text-mono">{item.regularMarketPrice}</div>
                    <div className="wl-change" style={{ fontSize: '0.7em', color: '#888' }}>+ Click to Add</div>
                  </div>
                </div>
              ))
            ) : (
              filteredWatchlist.map((item) => {
                const price = livePrices[item.symbol] || item.base;
                const change = ((price - item.base) / item.base) * 100;
                const isItemUp = change >= 0;

                return (
                  <div
                    key={item.symbol}
                    className={`wl-item ${activeSymbol.symbol === item.symbol ? 'active' : ''}`}
                    onClick={() => setActiveSymbol(item)}
                  >
                    <div className="wl-sym-group">
                      <span className="wl-sym">{item.symbol}</span>
                      <span className="wl-exch">{item.type}</span>
                    </div>
                    <div className="wl-price-group">
                      <div className={`wl-price ${isItemUp ? 'text-green' : 'text-red'}`}>{num(price)}</div>
                      <div className="wl-change" style={{ color: isItemUp ? 'var(--pt-acc-green)' : 'var(--pt-acc-red)' }}>
                        {isItemUp ? '+' : ''}{change.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })
            )}

          </div>
        </div>

        {/* CENTER: Chart & Positions */}
        <div className="trade-center">
          <div className="chart-area">
            {/* Force re-mount on symbol change so chart updates completely */}
            <TradingViewWidget key={activeSymbol.symbol} symbol={activeSymbol.symbol} height="100%" theme="dark" />
          </div>

          <div className="bottom-panel">
            <div className="bottom-tabs">
              <div className={`b-tab ${bottomTab === 'holdings' ? 'active' : ''}`} onClick={() => setBottomTab('holdings')}>Holdings</div>
              <div className={`b-tab ${bottomTab === 'orders' ? 'active' : ''}`} onClick={() => setBottomTab('orders')}>Order Book</div>
            </div>

            <div className="bottom-content">
              {bottomTab === 'position_placeholder' && (
                <div style={{ padding: '20px', color: '#666', textAlign: 'center', marginTop: '20px' }}>
                  No open intraday positions.
                </div>
              )}

              {bottomTab === 'holdings' && (
                <table className="pro-table">
                  <thead>
                    <tr>
                      <th>Instrument</th>
                      <th>Qty</th>
                      <th>Avg. Cost</th>
                      <th>LTP</th>
                      <th>Cur. Val</th>
                      <th>P&L</th>
                      <th>Net Chg</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((pos, idx) => {
                      const ltp = livePrices[pos.symbol] || pos.averagePrice;
                      const curVal = pos.quantity * ltp;
                      const invVal = pos.quantity * pos.averagePrice;
                      const pnl = curVal - invVal;
                      const pnlPct = (pnl / invVal) * 100;
                      const isProf = pnl >= 0;

                      return (
                        <tr key={idx}>
                          <td>{pos.symbol} <span className="text-muted" style={{ fontSize: '0.7em', color: '#666' }}>EQ</span></td>
                          <td>{pos.quantity}</td>
                          <td>{num(pos.averagePrice)}</td>
                          <td className={isProf ? 'text-green' : 'text-red'}>{num(ltp)}</td>
                          <td>{num(curVal)}</td>
                          <td className={isProf ? 'text-green' : 'text-red'}>{isProf ? '+' : ''}{num(pnl)}</td>
                          <td className={isProf ? 'text-green' : 'text-red'}>{pnlPct.toFixed(2)}%</td>
                          <td>
                            <button
                              className="btn-sell-holding"
                              style={{
                                backgroundColor: 'var(--pt-acc-red)',
                                color: 'white',
                                border: 'none',
                                padding: '4px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}
                              onClick={() => handleExit(pos)}
                            >
                              Exit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {portfolio.length === 0 && (
                      <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#555' }}>No Holdings Found</td></tr>
                    )}
                  </tbody>
                </table>
              )}

              {bottomTab === 'orders' && (
                <table className="pro-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Instrument</th>
                      <th>Qty</th>
                      <th>Exec. Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: 'left' }}>{new Date(ord.timestamp).toLocaleTimeString()}</td>
                        <td>
                          <span className={ord.action === "BUY" ? "text-green" : "text-red"} style={{ fontWeight: 600 }}>
                            {ord.action}
                          </span>
                        </td>
                        <td>{ord.symbol}</td>
                        <td>{ord.quantity}</td>
                        <td>{num(ord.price)}</td>
                        <td><span style={{ background: '#222', padding: '2px 6px', borderRadius: '4px', border: '1px solid #333' }}>{ord.status}</span></td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#555' }}>No Orders Placed Today</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Order Panel */}
        <div className="order-panel">
          <div className="order-header">
            <div>
              <h3 className="oh-symbol">{activeSymbol.symbol}</h3>
              <span className="oh-exc">NSE &bull; Stock</span>
            </div>
            <div className="oh-price-group">
              <div className={`oh-price ${priceColor}`}>{num(currentPrice)}</div>
              <div className="oh-exc" style={{ color: isUp ? 'var(--pt-acc-green)' : 'var(--pt-acc-red)' }}>{isUp ? '+' : ''}{pctChange.toFixed(2)}%</div>
            </div>
          </div>

          <form onSubmit={handleOrder} className="order-form">

            <div className="order-tabs">
              <div className={`o-tab buy ${orderAction === 'BUY' ? 'active' : ''}`} onClick={() => setOrderAction('BUY')}>BUY</div>
              <div className={`o-tab sell ${orderAction === 'SELL' ? 'active' : ''}`} onClick={() => setOrderAction('SELL')}>SELL</div>
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input type="number" className="form-input" value={qty} onChange={e => setQty(e.target.value)} min="1" />
            </div>

            <div className="form-group">
              <label>Price</label>
              <div className="radio-group" style={{ marginBottom: '8px' }}>
                <label className="radio-label">
                  <input type="radio" checked={priceType === 'MARKET'} onChange={() => setPriceType('MARKET')} /> Market
                </label>
                <label className="radio-label">
                  <input type="radio" checked={priceType === 'LIMIT'} onChange={() => setPriceType('LIMIT')} /> Limit
                </label>
              </div>
              <input
                type="number"
                className="form-input"
                value={priceType === 'MARKET' ? 0 : limitPrice}
                disabled={priceType === 'MARKET'}
                onChange={e => setLimitPrice(e.target.value)}
                placeholder={priceType === 'MARKET' ? 'Market Price' : '0.00'}
              />
            </div>

            <div className="margin-req">
              <span>Est. Total</span>
              <span className="margin-val">~ {money(qty * (priceType === 'MARKET' ? currentPrice : Number(limitPrice || currentPrice)))}</span>
            </div>

            <button type="submit" className={`btn-submit ${orderAction === 'BUY' ? 'buy' : 'sell'}`}>
              {orderAction} {activeSymbol.symbol}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default PaperTradeApp;
