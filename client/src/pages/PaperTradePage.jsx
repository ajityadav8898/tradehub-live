import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import '../styles/PaperTrade.css';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { MOCK_STOCKS, MOCK_OPTIONS, MOCK_FUTURES, MOCK_MF } from '../utils/mockMarketData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const PaperTradePage = () => {
  // --- State: Market Data ---
  // Using Mock Data but initializing 'change' and 'history' dynamically
  const initializeData = (data) => data.map(item => ({
    ...item,
    history: Array(20).fill(item.price), // Initial flat history
    change: 0
  }));

  const [marketData, setMarketData] = useState({
    Stock: initializeData(MOCK_STOCKS),
    Option: initializeData(MOCK_OPTIONS),
    Future: initializeData(MOCK_FUTURES),
    'Mutual Fund': initializeData(MOCK_MF)
  });

  // --- State: User Data (Backend Synced) ---
  const [virtualBalance, setVirtualBalance] = useState(0);
  const [portfolio, setPortfolio] = useState([]);
  const [tradeHistory, setTradeHistory] = useState([]);
  const [todaysProfit, setTodaysProfit] = useState(0);

  // --- State: UI & Forms ---
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Stock'); // Stock | Option | Future | Mutual Fund
  const [selectedSymbol, setSelectedSymbol] = useState(MOCK_STOCKS[0].symbol);

  const [orderType, setOrderType] = useState('market'); // market | limit
  const [orderPrice, setOrderPrice] = useState('');
  const [orderQuantity, setOrderQuantity] = useState('');
  const [orderAction, setOrderAction] = useState('buy'); // buy | sell
  const [stopLoss, setStopLoss] = useState('');

  const [marketStatus, setMarketStatus] = useState({ isOpen: true, text: 'Open' });

  // --- Refs ---
  const chartRef = useRef(null);

  // --- Helper: Get Current Item Data ---
  const getMarketItem = (symbol) => {
    // Search across all categories
    for (const category of Object.values(marketData)) {
      const item = category.find(s => s.symbol === symbol);
      if (item) return item;
    }
    return null;
  };

  // --- Effect: Load User Data from Backend ---
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // 1. Portfolio & Balance
        const pRes = await fetch('http://localhost:5000/api/trade/portfolio', {
          headers: { 'x-auth-token': token }
        });
        const pData = await pRes.json();
        if (pRes.ok) {
          setVirtualBalance(pData.balance);
          setPortfolio(pData.portfolio);
        }

        // 2. History
        const hRes = await fetch('http://localhost:5000/api/trade/history', {
          headers: { 'x-auth-token': token }
        });
        const hData = await hRes.json();
        if (hRes.ok) {
          setTradeHistory(hData);
          // Calculate rudimentary "Today's P&L" based on closed trades from today? 
          // For now, easier to calculate Realized P&L from history + Unrealized from Portfolio
        }
      } catch (err) {
        console.error("Failed to load user data", err);
      }
    };
    fetchUserData();
  }, []);

  // --- Effect: Simulation Loop (Updates Prices) ---
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prevData => {
        const newData = { ...prevData };
        Object.keys(newData).forEach(key => {
          newData[key] = newData[key].map(item => {
            // Reduced Volatility for realistic movements (Single digits/Tens)
            const volatility = key === 'Option' ? 0.3 : 0.05;
            const changeP = (Math.random() * volatility * 2 - volatility);
            const newPrice = Math.max(0.05, item.price * (1 + changeP / 100));
            const newHistory = [...item.history, newPrice].slice(-50);
            return { ...item, price: newPrice, history: newHistory, change: changeP };
          });
        });
        return newData;
      });
      calculatePL(); // Recalculate P&L on price update
    }, 2000);

    return () => clearInterval(interval);
  }, []); // eslint-disable-line

  // --- Effect: Market Status ---
  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      // Simple status check
      setMarketStatus({ isOpen: true, text: 'Open' });
    };
    updateStatus();
    const timer = setInterval(updateStatus, 60000);
    return () => clearInterval(timer);
  }, []);

  // --- Function: Calculate P&L ---
  const calculatePL = () => {
    // This runs locally to update the UI "Total P&L" based on current prices
    // Does not persist until closed.
  };

  // --- Handlers ---
  const handlePlaceTrade = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert("Please login to trade");
      return;
    }

    const qty = parseInt(orderQuantity);
    if (!qty || qty <= 0) {
      alert("Invalid Quantity");
      return;
    }

    const item = getMarketItem(selectedSymbol);
    if (!item) return;

    try {
      const res = await fetch('http://localhost:5000/api/trade/place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          symbol: selectedSymbol,
          instrument: item.type,
          action: orderAction.toUpperCase(),
          quantity: qty,
          orderType: orderType.toUpperCase(),
          limitPrice: orderType === 'limit' ? orderPrice : item.price, // Sending current price for backend sim
          price: item.price, // Explicitly sending price for demo accuracy
          stopLoss: stopLoss
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setVirtualBalance(data.balance);

        // Refresh Portfolio & History
        const pRes = await fetch('http://localhost:5000/api/trade/portfolio', { headers: { 'x-auth-token': token } });
        if (pRes.ok) setPortfolio((await pRes.json()).portfolio);

        const hRes = await fetch('http://localhost:5000/api/trade/history', { headers: { 'x-auth-token': token } });
        if (hRes.ok) setTradeHistory(await hRes.json());

      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert(`Trade Failed: ${err.message}`);
    }
  };

  const handleResetAccount = async () => {
    if (!window.confirm("Are you sure you want to RESET your virtual account? This will clear all portfolio, history and reset balance to ₹10,00,000.")) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/trade/reset', {
        method: 'DELETE',
        headers: { 'x-auth-token': token }
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setVirtualBalance(data.balance);
        setPortfolio([]);
        setTradeHistory([]);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Reset failed");
    }
  };

  const handleUpdateSL = async (symbol, val) => {
    if (!val) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/trade/positions/stoploss', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ symbol, stopLoss: val })
      });
      const data = await res.json();
      if (res.ok) {
        // alert("SL Updated");
        // Update local state without full refresh for speed
        setPortfolio(prev => prev.map(p => p.symbol === symbol ? { ...p, stopLoss: Number(val) } : p));
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSquareOff = async (symbol, qty, currentType) => {
    // Reverse the trade
    const token = localStorage.getItem('token');
    const item = getMarketItem(symbol);
    if (!item || !token) return;

    // Logic: If I have quantity, Square Off means SELL.
    // Wait, Portfolio doesn't explicitly say "Long/Short". 
    // Usually standard portfolio is Long (Buy).
    // So Square Off = SELL.
    // If backend supported Short Selling, we'd need to know position side.
    // Assuming Long Only for basics, or checking if we can sell.

    // Auto-fill form or just execute? executing directly is better UX.
    if (window.confirm(`Square off ${symbol}? This will sell ${qty} units at market price.`)) {
      try {
        const res = await fetch('http://localhost:5000/api/trade/place', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
          body: JSON.stringify({
            symbol: symbol,
            instrument: item.type,
            action: 'SELL',
            quantity: qty,
            orderType: 'MARKET',
            price: item.price
          })
        });
        const data = await res.json();
        if (res.ok) {
          alert("Square Off Successful");
          setVirtualBalance(data.balance);
          // Refresh
          const pRes = await fetch('http://localhost:5000/api/trade/portfolio', { headers: { 'x-auth-token': token } });
          if (pRes.ok) setPortfolio((await pRes.json()).portfolio);
          const hRes = await fetch('http://localhost:5000/api/trade/history', { headers: { 'x-auth-token': token } });
          if (hRes.ok) setTradeHistory(await hRes.json());
        } else {
          alert(data.message);
        }
      } catch (err) {
        alert("Error squaring off");
      }
    }
  };



  const handleTriggerStopLoss = async (symbol, qty, instrument, slPrice, actionType) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/trade/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({
          symbol: symbol,
          instrument: instrument || 'Stock',
          action: actionType, // Dynamic Action
          quantity: Math.abs(qty), // Convert to positive for order
          orderType: 'MARKET',
          price: slPrice
        })
      });

      if (res.ok) {
        const data = await res.json();
        setVirtualBalance(data.balance);
        const pRes = await fetch('http://localhost:5000/api/trade/portfolio', { headers: { 'x-auth-token': token } });
        if (pRes.ok) setPortfolio((await pRes.json()).portfolio);
        const hRes = await fetch('http://localhost:5000/api/trade/history', { headers: { 'x-auth-token': token } });
        if (hRes.ok) setTradeHistory(await hRes.json());
      }
    } catch (err) {
      console.error("SL Execution Failed", err);
    }
  };

  // --- Chart Data ---
  const chartData = () => {
    const item = getMarketItem(selectedSymbol);
    if (!item) return { labels: [], datasets: [] };
    return {
      labels: item.history.map((_, i) => i),
      datasets: [{
        label: `${selectedSymbol} Price (₹)`,
        data: item.history,
        borderColor: item.change >= 0 ? '#0adfaa' : '#ff4444',
        backgroundColor: item.change >= 0 ? 'rgba(10, 223, 170, 0.1)' : 'rgba(255, 68, 68, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 0
      }]
    };
  };

  // --- NEW: Stop Loss Monitoring Effect (Moved Here) ---
  // --- NEW: Stop Loss Monitoring Effect (Moved Here) ---
  // --- Derived State: Pending Orders ---
  const pendingOrders = tradeHistory ? tradeHistory.filter(t => t.status === 'PENDING') : [];

  const handleExecuteLimitOrder = async (tradeId, currentPrice) => {
    const token = localStorage.getItem('token');
    try {
      // Play sound or alert
      // console.log("Executing Limit Order", tradeId);
      const res = await fetch('http://localhost:5000/api/trade/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        body: JSON.stringify({ tradeId, executionPrice: currentPrice })
      });

      if (res.ok) {
        const data = await res.json();
        alert(`LIMIT ORDER EXECUTED! ${data.trade.symbol} @ ₹${data.trade.price.toFixed(2)}`);
        setVirtualBalance(data.balance);

        // Refresh Data
        const pRes = await fetch('http://localhost:5000/api/trade/portfolio', { headers: { 'x-auth-token': token } });
        if (pRes.ok) setPortfolio((await pRes.json()).portfolio);
        const hRes = await fetch('http://localhost:5000/api/trade/history', { headers: { 'x-auth-token': token } });
        if (hRes.ok) setTradeHistory(await hRes.json());
      }
    } catch (err) {
      console.error("Limit Execution Switch Failed", err);
    }
  };


  // --- NEW: Stop Loss & Limit Order Monitoring Effect ---
  useEffect(() => {
    // 1. Monitor STOP LOSS
    if (handleTriggerStopLoss) {
      portfolio.forEach(pos => {
        const slPrice = Number(pos.stopLoss);
        if (slPrice && slPrice > 0) {
          const item = getMarketItem(pos.symbol);
          if (item) {
            const currentPrice = Number(item.price);
            // DIRECTIONAL LOGIC
            if (pos.quantity > 0) {
              // LONG POSITION: Sell if Price <= StopLoss
              if (currentPrice <= slPrice) {
                console.warn(`LONG SL TRIGGERED: ${pos.symbol} @ ${currentPrice} (SL: ${slPrice})`);
                alert(`STOP LOSS TRIGGERED (Long) for ${pos.symbol} at ₹${currentPrice.toFixed(2)}! Selling to exit.`);
                handleTriggerStopLoss(pos.symbol, pos.quantity, item.type, slPrice, 'SELL');
              }
            } else if (pos.quantity < 0) {
              // SHORT POSITION: Buy if Price >= StopLoss
              if (currentPrice >= slPrice) {
                console.warn(`SHORT SL TRIGGERED: ${pos.symbol} @ ${currentPrice} (SL: ${slPrice})`);
                alert(`STOP LOSS TRIGGERED (Short) for ${pos.symbol} at ₹${currentPrice.toFixed(2)}! Buying to cover.`);
                handleTriggerStopLoss(pos.symbol, pos.quantity, item.type, slPrice, 'BUY');
              }
            }
          }
        }
      });
    }

    // 2. Monitor LIMIT ORDERS (Pending)
    if (pendingOrders.length > 0) {
      pendingOrders.forEach(order => {
        const item = getMarketItem(order.symbol);
        if (item) {
          const currentPrice = Number(item.price);
          const limitPrice = Number(order.price);

          if (order.action === 'BUY') {
            // Buy Limit: Trigger if Price <= Limit Price
            if (currentPrice <= limitPrice) {
              console.log(`BUY LIMIT HIT: ${order.symbol} @ ${currentPrice} (Limit: ${limitPrice})`);
              handleExecuteLimitOrder(order._id, currentPrice);
            }
          } else if (order.action === 'SELL') {
            // Sell Limit: Trigger if Price >= Limit Price
            if (currentPrice >= limitPrice) {
              console.log(`SELL LIMIT HIT: ${order.symbol} @ ${currentPrice} (Limit: ${limitPrice})`);
              handleExecuteLimitOrder(order._id, currentPrice);
            }
          }
        }
      });
    }

  }, [marketData, portfolio, tradeHistory]); // Added tradeHistory to dependency

  // --- Derived Calculations ---


  const currentPortfolioValue = portfolio.reduce((acc, p) => {
    const item = getMarketItem(p.symbol);
    return acc + (item ? item.price * p.quantity : p.averagePrice * p.quantity);
  }, 0);

  const totalInvested = portfolio.reduce((acc, p) => acc + (p.averagePrice * p.quantity), 0);
  const totalPL = currentPortfolioValue - totalInvested;

  const filteredList = marketData[activeTab].filter(item =>
    item.symbol.includes(searchQuery.toUpperCase()) || item.name.toUpperCase().includes(searchQuery.toUpperCase())
  );

  return (
    <div className="pt-page-container">
      <Navbar />
      <div className="pt-main-content">

        {/* HEADER */}
        <header className="pt-header">
          <div>
            <h1>TradeHub Pro</h1>
            <p>Advanced Trading Terminal</p>
          </div>
          <div className="pt-header-actions">
            <button className="pt-btn-reset" onClick={handleResetAccount}>
              Reset Account
            </button>
            <div className="pt-market-status">
              MARKET: <span className="text-green">OPEN</span>
            </div>
          </div>
        </header>

        <div className="pt-grid-layout">

          {/* SIDEBAR: SEARCH & LIST */}
          <aside className="pt-sidebar">
            <div className="pt-card pt-summary">
              <h3>Wallet</h3>
              <div className="pt-stat-row">
                <span>Available Margin</span>
                <span className="pt-val text-green">₹{virtualBalance.toFixed(2)}</span>
              </div>
              <div className="pt-stat-row">
                <span>Invested</span>
                <span className="pt-val">₹{totalInvested.toFixed(2)}</span>
              </div>
              <div className="pt-stat-row">
                <span>Total Profit and Loss</span>
                <span className={`pt-val ${totalPL >= 0 ? 'text-green' : 'text-red'}`}>
                  {totalPL >= 0 ? '+' : ''}₹{totalPL.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-card pt-watchlist">
              <div className="pt-search-box">
                <input
                  type="text"
                  placeholder="Search Stocks, F&O..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="pt-tabs">
                {['Stock', 'Option', 'Future', 'Mutual Fund'].map(tab => (
                  <button
                    key={tab}
                    className={activeTab === tab ? 'active' : ''}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === 'Mutual Fund' ? 'MFs' : tab}
                  </button>
                ))}
              </div>
              <div className="pt-list">
                {filteredList.map(item => (
                  <div
                    key={item.symbol}
                    onClick={() => { setSelectedSymbol(item.symbol); }}
                  >
                    <div className="pt-item-left">
                      <div className="pt-item-name">{item.symbol}</div>
                      <small>{item.name}</small>
                    </div>
                    <div className={`pt-item-price ${item.change >= 0 ? 'text-green' : 'text-red'}`}>
                      ₹{item.price.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* MAIN: CHART & POSITIONS */}
          <main className="pt-center">
            {/* CHART */}
            <div className="pt-card pt-chart-section">
              <div className="pt-chart-header">
                <h2>{selectedSymbol}</h2>
                <span className="pt-price-lg">₹{getMarketItem(selectedSymbol)?.price.toFixed(2)}</span>
              </div>
              <div className="pt-chart-canvas">
                <Line ref={chartRef} data={chartData()} options={{
                  responsive: true, maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { x: { display: false }, y: { grid: { color: '#333' } } }
                }} />
              </div>
            </div>

            {/* MANAGE TRADES / POSITIONS */}
            <div className="pt-card pt-bottom-panel">
              <h3>Active Positions (Portfolio)</h3>
              <div className="pt-table-container">
                <table className="pt-table">
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th>Qty</th>
                      <th>Avg. Price</th>
                      <th>LTP</th>
                      <th>P&L</th>
                      <th>Stop Loss</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((pos, i) => {
                      const item = getMarketItem(pos.symbol);
                      const ltp = item ? item.price : pos.averagePrice;
                      const pl = (ltp - pos.averagePrice) * pos.quantity;

                      return (
                        <tr key={i}>
                          <td>{pos.symbol}</td>
                          <td>{pos.quantity}</td>
                          <td>{pos.averagePrice.toFixed(2)}</td>
                          <td>{ltp.toFixed(2)}</td>
                          <td className={pl >= 0 ? 'text-green' : 'text-red'}>{pl.toFixed(2)}</td>
                          <td>
                            <div className="pt-sl-update">
                              {pos.stopLoss > 0 ? (
                                <span className="pt-sl-val" onClick={() => {
                                  const val = prompt("Enter new Stop Loss Price:", pos.stopLoss);
                                  if (val !== null) handleUpdateSL(pos.symbol, val);
                                }}>
                                  {pos.stopLoss} <small>✎</small>
                                </span>
                              ) : (
                                <button className="pt-btn-sm outline" onClick={() => {
                                  const val = prompt("Enter Stop Loss Price:");
                                  if (val !== null) handleUpdateSL(pos.symbol, val);
                                }}>
                                  Set SL
                                </button>
                              )}
                            </div>
                          </td>
                          <td>
                            <button className="pt-btn-sm red" onClick={() => handleSquareOff(pos.symbol, pos.quantity)}>
                              Square Off
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {portfolio.length === 0 && <tr><td colSpan="7" className="text-center">No active positions</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </main>

          {/* RIGHT: ORDER ENTRY */}
          <aside className="pt-sidebar-right">
            <div className="pt-card pt-order-form">
              <h3>Place Order</h3>
              <div className="pt-symbol-display">{selectedSymbol}</div>

              <div className="pt-form-row">
                <button className={`pt-tab-btn ${orderAction === 'buy' ? 'active-buy' : ''}`} onClick={() => setOrderAction('buy')}>BUY</button>
                <button className={`pt-tab-btn ${orderAction === 'sell' ? 'active-sell' : ''}`} onClick={() => setOrderAction('sell')}>SELL</button>
              </div>

              <div className="pt-form-group">
                <label>Quantity</label>
                <input type="number" value={orderQuantity} onChange={(e) => setOrderQuantity(e.target.value)} />
              </div>

              <div className="pt-form-group">
                <label>Order Type</label>
                <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
                  <option value="market">Market</option>
                  <option value="limit">Limit</option>
                </select>
              </div>

              {orderType === 'limit' && (
                <div className="pt-form-group">
                  <label>Limit Price</label>
                  <input type="number" value={orderPrice} onChange={(e) => setOrderPrice(e.target.value)} />
                </div>
              )}

              <div className="pt-form-group">
                <label>Stop Loss (Optional)</label>
                <input type="number" value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} placeholder="0.00" />
              </div>

              <div className="pt-order-summary">
                <p>Est. Margin: ₹{((getMarketItem(selectedSymbol)?.price || 0) * (orderQuantity || 0)).toFixed(2)}</p>
              </div>

              <button className={`pt-btn-action ${orderAction}`} onClick={handlePlaceTrade}>
                {orderAction.toUpperCase()}
              </button>
            </div>

            {/* TRADE HISTORY MINI */}
            <div className="pt-card pt-mini-history">
              <h3>Recent History</h3>
              <div className="pt-mini-list">
                {tradeHistory.slice(0, 5).map((t, i) => (
                  <div key={i} className="pt-mini-item">
                    <span className={t.action === 'BUY' ? 'text-green' : 'text-red'}>{t.action}</span>
                    <span>{t.symbol}</span>
                    <span>{t.quantity} @ {t.price.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};

export default PaperTradePage;