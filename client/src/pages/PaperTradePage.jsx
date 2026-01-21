import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import '../styles/PaperTrade.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PaperTradePage = () => {
  // --- State: Market Data (Mock) ---
  const [stocks, setStocks] = useState([
    { symbol: 'RELIANCE', type: 'Stock', price: 2950.50, margin: 0.2, history: [], change: 0 },
    { symbol: 'TCS', type: 'Stock', price: 4200.75, margin: 0.2, history: [], change: 0 },
    { symbol: 'HDFCBANK', type: 'Stock', price: 1650.30, margin: 0.2, history: [], change: 0 },
    { symbol: 'INFY', type: 'Stock', price: 1850.45, margin: 0.2, history: [], change: 0 }
  ]);
  const [indexes, setIndexes] = useState([
    {
      symbol: 'NIFTY', type: 'Index', price: 25000, margin: 0.5, history: [], change: 0,
      options: [
        { symbol: 'NIFTY_CE_25000', type: 'Option', price: 120.45, margin: 0.5, history: [], change: 0 },
        { symbol: 'NIFTY_PE_25000', type: 'Option', price: 100.30, margin: 0.5, history: [], change: 0 }
      ]
    },
    {
      symbol: 'BANKNIFTY', type: 'Index', price: 51000, margin: 0.5, history: [], change: 0,
      options: [
        { symbol: 'BANKNIFTY_CE_51000', type: 'Option', price: 200.60, margin: 0.5, history: [], change: 0 },
        { symbol: 'BANKNIFTY_PE_51000', type: 'Option', price: 180.75, margin: 0.5, history: [], change: 0 }
      ]
    }
  ]);

  // --- State: User Data ---
  const [virtualBalance, setVirtualBalance] = useState(1000000);
  const [portfolio, setPortfolio] = useState([]);
  const [openPositions, setOpenPositions] = useState([]);
  const [trades, setTrades] = useState([]);
  const [todaysProfit, setTodaysProfit] = useState(0);

  // --- State: UI & Forms ---
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');
  const [orderInstrument, setOrderInstrument] = useState('stock'); // stock | option
  const [orderSymbol, setOrderSymbol] = useState('');
  const [orderType, setOrderType] = useState('market'); // market | limit
  const [orderPrice, setOrderPrice] = useState('');
  const [orderQuantity, setOrderQuantity] = useState('');
  const [orderAction, setOrderAction] = useState('buy'); // buy | sell
  const [discussionText, setDiscussionText] = useState('');
  const [discussionPosts, setDiscussionPosts] = useState([
    { user: 'TraderX', text: 'Bullish on RELIANCE! Expecting a breakout above ₹3000 soon.', time: new Date().toLocaleTimeString() }
  ]);
  const [marketStatus, setMarketStatus] = useState({ isOpen: true, text: 'Open' });

  // --- Refs for Chart ---
  const chartRef = useRef(null);

  // --- Helper: Get Market Item ---
  const getMarketItem = (symbol) => {
    let item = stocks.find(s => s.symbol === symbol);
    if (item) return item;
    for (let index of indexes) {
      if (index.symbol === symbol) return index;
      item = index.options.find(opt => opt.symbol === symbol);
      if (item) return item;
    }
    return null;
  };

  // --- Effect: Simulation Loop ---
  useEffect(() => {
    // Initialize history
    const initHistory = (item) => {
      if (item.history.length === 0) item.history = Array(20).fill(item.price);
    };
    stocks.forEach(initHistory);
    indexes.forEach(idx => {
      initHistory(idx);
      idx.options.forEach(initHistory);
    });

    const interval = setInterval(() => {
      // Update Stocks
      setStocks(prev => prev.map(stock => {
        const changeP = (Math.random() * 1.0 - 0.4); // Random flow
        const newPrice = Math.max(1, stock.price * (1 + changeP / 100));
        const newHistory = [...stock.history, newPrice].slice(-50);
        return { ...stock, price: newPrice, history: newHistory, change: changeP };
      }));

      // Update Indexes & Options
      setIndexes(prev => prev.map(idx => {
        const changeP = (Math.random() * 0.8 - 0.35);
        const newPrice = Math.max(1, idx.price * (1 + changeP / 100));
        const newHistory = [...idx.history, newPrice].slice(-50);

        const newOptions = idx.options.map(opt => {
          const optChange = (Math.random() * 2.5 - 1.0); // Higher volatility
          const optPrice = Math.max(1, opt.price * (1 + optChange / 100));
          const optHistory = [...opt.history, optPrice].slice(-50);
          return { ...opt, price: optPrice, history: optHistory, change: optChange };
        });

        return { ...idx, price: newPrice, history: newHistory, change: changeP, options: newOptions };
      }));

      // Check Open Positions (Limit Orders / Stop Loss)
      checkPositions();

    }, 3000);

    return () => clearInterval(interval);
  }, []); // eslint-disable-line

  // --- Effect: Market Status ---
  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const isOpen = (hours >= 9 && hours < 15) || (hours === 15 && minutes <= 30);
      setMarketStatus({
        isOpen,
        text: isOpen ? 'Open' : 'Closed'
      });
    };
    updateStatus();
    const timer = setInterval(updateStatus, 60000);
    return () => clearInterval(timer);
  }, []);

  // --- Logic: Check Positions ---
  const checkPositions = () => {
    setOpenPositions(prevPositions => {
      const remaining = [];
      let updated = false;

      prevPositions.forEach(pos => {
        const item = getMarketItem(pos.symbol);
        if (!item) {
          remaining.push(pos);
          return;
        }
        const current = item.price;
        let execute = false;

        // Limit Order Check
        if (pos.orderType === 'limit') {
          if (pos.action === 'buy' && current <= pos.entryPrice) execute = true;
          if (pos.action === 'sell' && current >= pos.entryPrice) execute = true;
        }

        // Stop Loss Check (Simplified for market orders)
        if (pos.orderType === 'market' && pos.stopLoss) {
          if (pos.action === 'buy' && current <= pos.stopLoss) execute = true; // Sell to stop loss
          // Logic for short selling stop loss would go here
        }

        if (execute && pos.orderType === 'limit') { // Only auto-execute limits for now
          executeTradeValues(pos, current);
          updated = true;
        } else {
          remaining.push(pos);
        }
      });

      return updated ? remaining : prevPositions;
    });
  };

  const executeTradeValues = (pos, price) => {
    // This is primarily for limit order execution logic backend simulation
    const total = price * pos.quantity;
    const pl = pos.action === 'buy' ?
      (price - pos.entryPrice) * pos.quantity :
      (pos.entryPrice - price) * pos.quantity;

    if (pos.action === 'buy') {
      // Executing a BUY LIMIT means we bought at 'price'
      // We usually deduct balance when placing order, or here?
      // For sim simplicity, we assumed balance deducted on placement for buy.

      // Add to portfolio
      const existing = portfolio.find(p => p.symbol === pos.symbol);
      if (existing) {
        const newQty = existing.quantity + pos.quantity;
        const newAvg = ((existing.avgPrice * existing.quantity) + (price * pos.quantity)) / newQty;
        setPortfolio(prev => prev.map(p => p.symbol === pos.symbol ? { ...p, quantity: newQty, avgPrice: newAvg } : p));
      } else {
        setPortfolio(prev => [...prev, { symbol: pos.symbol, type: pos.type, quantity: pos.quantity, avgPrice: price }]);
      }
    } else {
      // Executing SELL LIMIT
      setVirtualBalance(prev => prev + total);
      setTodaysProfit(prev => prev + pl);
      // Logic to reduce portfolio if it was covered? 
      // Simplified: This sim mainly tracks 'positions' as independent entities until settled
    }

    setTrades(prev => [...prev, { ...pos, exitPrice: price, pl, date: new Date() }]);
  };

  // --- Handlers ---
  const handlePlaceTrade = () => {
    const qty = parseInt(orderQuantity);
    const price = parseFloat(orderPrice);

    if (!orderSymbol || !qty || qty <= 0) {
      alert("Invalid Trade Parameters");
      return;
    }

    const item = getMarketItem(orderSymbol);
    if (!item) {
      alert("Symbol not found");
      return;
    }

    const currentPrice = item.price;
    const execPrice = orderType === 'limit' ? price : currentPrice;
    const totalCost = execPrice * qty;

    if (orderAction === 'buy') {
      if (totalCost > virtualBalance) {
        alert("Insufficient Funds");
        return;
      }
      if (orderType === 'market') {
        setVirtualBalance(prev => prev - totalCost);
        // Add to Portfolio
        setPortfolio(prev => {
          const existing = prev.find(p => p.symbol === orderSymbol);
          if (existing) {
            const newQty = existing.quantity + qty;
            const newAvg = ((existing.avgPrice * existing.quantity) + totalCost) / newQty;
            return prev.map(p => p.symbol === orderSymbol ? { ...p, quantity: newQty, avgPrice: newAvg } : p);
          } else {
            return [...prev, { symbol: orderSymbol, type: orderInstrument, quantity: qty, avgPrice: execPrice }];
          }
        });
      }
    } else {
      // Sell logic
      const existing = portfolio.find(p => p.symbol === orderSymbol);
      if (!existing || existing.quantity < qty) {
        alert("Insufficient holdings to sell");
        return;
      }
      if (orderType === 'market') {
        setVirtualBalance(prev => prev + totalCost);
        const pl = (execPrice - existing.avgPrice) * qty;
        setTodaysProfit(prev => prev + pl);

        // Update Portfolio
        if (existing.quantity === qty) {
          setPortfolio(prev => prev.filter(p => p.symbol !== orderSymbol));
        } else {
          setPortfolio(prev => prev.map(p => p.symbol === orderSymbol ? { ...p, quantity: p.quantity - qty } : p));
        }
      }
    }

    // Add to Open Positions (For tracking/Visuals)
    if (orderType !== 'market' || orderAction === 'buy') {
      // We keep buy orders in open positions mainly for tracking gain/loss in that specific 'trade'
      // For sell market, it's done immediately usually. 
    }

    // Simplified: Add everything to 'Open Positions' log if it's active
    setOpenPositions(prev => [
      ...prev,
      {
        symbol: orderSymbol,
        type: orderInstrument,
        orderType,
        action: orderAction,
        quantity: qty,
        entryPrice: execPrice,
        stopLoss: null
      }
    ]);

    alert("Order Placed!");
  };

  const handleLiquidity = (pos, index) => {
    // Manually close/sell a specific position from the list
    const item = getMarketItem(pos.symbol);
    const current = item.price;
    const total = current * pos.quantity;
    const pl = (current - pos.entryPrice) * pos.quantity; // Assuming Buy position

    if (pos.action === 'buy') {
      setVirtualBalance(prev => prev + total);
      setTodaysProfit(prev => prev + pl);

      // Reduce portfolio
      setPortfolio(prev => {
        const existing = prev.find(p => p.symbol === pos.symbol);
        if (existing) {
          if (existing.quantity <= pos.quantity) return prev.filter(p => p.symbol !== pos.symbol);
          return prev.map(p => p.symbol === pos.symbol ? { ...p, quantity: p.quantity - pos.quantity } : p);
        }
        return prev;
      });
    }

    // Remove from open positions
    setOpenPositions(prev => prev.filter((_, i) => i !== index));
  };

  const handleDiscussionPost = () => {
    if (!discussionText.trim()) return;
    setDiscussionPosts(prev => [{ user: 'You', text: discussionText, time: new Date().toLocaleTimeString() }, ...prev]);
    setDiscussionText('');
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
        borderColor: '#0adfaa',
        backgroundColor: 'rgba(10, 223, 170, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 0
      }]
    };
  };

  // --- Portfolio Summary Calculations ---
  const portfolioValue = portfolio.reduce((acc, item) => {
    const mItem = getMarketItem(item.symbol);
    return acc + (mItem ? mItem.price * item.quantity : 0);
  }, 0);
  const totalPL = portfolio.reduce((acc, item) => {
    const mItem = getMarketItem(item.symbol);
    return acc + (mItem ? (mItem.price - item.avgPrice) * item.quantity : 0);
  }, 0);

  return (
    <div className="pt-page-container">
      <Navbar />
      <div className="pt-main-content">

        {/* HERO / HEADER */}
        <header className="pt-header">
          <div>
            <h1>TraceHub Simulator</h1>
            <p>Master the market with ₹10,00,000 virtual cash.</p>
          </div>
          <div className="pt-market-status">
            Market: <span className={marketStatus.isOpen ? 'text-green' : 'text-red'}>{marketStatus.text}</span>
          </div>
        </header>

        <div className="pt-grid-layout">

          {/* LEFT COLUMN: WATCHLIST & SUMMARY */}
          <aside className="pt-sidebar">
            <div className="pt-card pt-summary">
              <h3>Portfolio Summary</h3>
              <div className="pt-stat-row">
                <span>Balance</span>
                <span className="pt-val text-green">₹{virtualBalance.toFixed(2)}</span>
              </div>
              <div className="pt-stat-row">
                <span>Portfolio Value</span>
                <span className="pt-val text-blue">₹{portfolioValue.toFixed(2)}</span>
              </div>
              <div className="pt-stat-row">
                <span>Total P&L</span>
                <span className={`pt-val ${totalPL >= 0 ? 'text-green' : 'text-red'}`}>₹{totalPL.toFixed(2)}</span>
              </div>
              <div className="pt-stat-row">
                <span>Today's P&L</span>
                <span className={`pt-val ${todaysProfit >= 0 ? 'text-green' : 'text-red'}`}>₹{todaysProfit.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-card pt-watchlist">
              <h3>Stocks</h3>
              <div className="pt-list">
                {stocks.map(s => (
                  <div key={s.symbol} className="pt-item" onClick={() => { setSelectedSymbol(s.symbol); setOrderSymbol(s.symbol); }}>
                    <div className="pt-item-name">{s.symbol}</div>
                    <div className={`pt-item-price ${s.change >= 0 ? 'text-green' : 'text-red'}`}>
                      ₹{s.price.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              <h3 className="mt-4">Indexes & Options</h3>
              <div className="pt-list">
                {indexes.map(idx => (
                  <React.Fragment key={idx.symbol}>
                    <div className="pt-item index-item" onClick={() => { setSelectedSymbol(idx.symbol); setOrderSymbol(idx.symbol); }}>
                      <div className="pt-item-name">{idx.symbol}</div>
                      <div className={`pt-item-price ${idx.change >= 0 ? 'text-green' : 'text-red'}`}>
                        ₹{idx.price.toFixed(2)}
                      </div>
                    </div>
                    {idx.options.map(opt => (
                      <div key={opt.symbol} className="pt-item sub-item" onClick={() => { setSelectedSymbol(opt.symbol); setOrderSymbol(opt.symbol); }}>
                        <div className="pt-item-name">{opt.symbol}</div>
                        <div className={`pt-item-price ${opt.change >= 0 ? 'text-green' : 'text-red'}`}>
                          ₹{opt.price.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </aside>

          {/* CENTER: CHART & POSITIONS */}
          <main className="pt-center">
            <div className="pt-card pt-chart-section">
              <div className="pt-chart-header">
                <h2>{selectedSymbol}</h2>
                <span className="pt-price-lg">₹{getMarketItem(selectedSymbol)?.price.toFixed(2)}</span>
              </div>
              <div className="pt-chart-canvas">
                <Line
                  ref={chartRef}
                  data={chartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { display: false },
                      y: {
                        grid: { color: '#333' },
                        ticks: { color: '#888' }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="pt-card pt-bottom-panel">
              <h3>Active Positions & Portfolio</h3>
              <div className="pt-table-container">
                <table className="pt-table">
                  <thead>
                    <tr>
                      <th>Symbol</th>
                      <th>Qty</th>
                      <th>Avg</th>
                      <th>LTP</th>
                      <th>P&L</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((pos, i) => {
                      const item = getMarketItem(pos.symbol);
                      const ltp = item ? item.price : 0;
                      const pl = (ltp - pos.avgPrice) * pos.quantity;
                      return (
                        <tr key={i}>
                          <td>{pos.symbol}</td>
                          <td>{pos.quantity}</td>
                          <td>{pos.avgPrice.toFixed(2)}</td>
                          <td>{ltp.toFixed(2)}</td>
                          <td className={pl >= 0 ? 'text-green' : 'text-red'}>{pl.toFixed(2)}</td>
                          <td>
                            <button className="pt-btn-sm red" onClick={() => {
                              // Find corresponding open position approximation or sell all
                              // Creating a synthetic pos object for handleLiquidity
                              handleLiquidity({ ...pos, action: 'buy', entryPrice: pos.avgPrice }, -1) // -1 index hack for portfolio only
                            }}>Sell</button>
                          </td>
                        </tr>
                      );
                    })}
                    {portfolio.length === 0 && <tr><td colSpan="6" className="text-center">No active holdings</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </main>

          {/* RIGHT: ORDER FORM & DISCUSSION */}
          <aside className="pt-sidebar-right">
            <div className="pt-card pt-order-form">
              <h3>Place Order</h3>
              <div className="pt-form-group">
                <input
                  type="text"
                  placeholder="Symbol"
                  value={orderSymbol}
                  onChange={(e) => setOrderSymbol(e.target.value.toUpperCase())}
                />
              </div>
              <div className="pt-form-row">
                <select value={orderType} onChange={(e) => setOrderType(e.target.value)}>
                  <option value="market">Market</option>
                  <option value="limit">Limit</option>
                </select>
                <select value={orderAction} onChange={(e) => setOrderAction(e.target.value)} className={orderAction === 'buy' ? 'bg-green' : 'bg-red'}>
                  <option value="buy">BUY</option>
                  <option value="sell">SELL</option>
                </select>
              </div>
              <div className="pt-form-group">
                <input
                  type="number"
                  placeholder="Quantity"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                />
              </div>
              {orderType === 'limit' && (
                <div className="pt-form-group">
                  <input
                    type="number"
                    placeholder="Limit Price"
                    value={orderPrice}
                    onChange={(e) => setOrderPrice(e.target.value)}
                  />
                </div>
              )}
              <button className={`pt-btn-action ${orderAction}`} onClick={handlePlaceTrade}>
                {orderAction.toUpperCase()} {orderSymbol}
              </button>
            </div>

            <div className="pt-card pt-discussion">
              <h3>Community Chat</h3>
              <div className="pt-feed">
                {discussionPosts.map((post, i) => (
                  <div key={i} className="pt-post">
                    <div className="pt-post-head">
                      <span className="user">{post.user}</span>
                      <span className="time">{post.time}</span>
                    </div>
                    <div className="pt-post-text">{post.text}</div>
                  </div>
                ))}
              </div>
              <div className="pt-chat-input">
                <input
                  type="text"
                  placeholder="Say something..."
                  value={discussionText}
                  onChange={(e) => setDiscussionText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleDiscussionPost()}
                />
                <button onClick={handleDiscussionPost}>Send</button>
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
};

export default PaperTradePage;