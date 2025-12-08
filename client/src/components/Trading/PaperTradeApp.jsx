import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "../../styles/PaperTrade.css";

function isMarketOpen() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const min = now.getMinutes();
  if (day === 0 || day === 6) return false;
  const mins = hour * 60 + min;
  return mins >= (9 * 60 + 15) && mins < (15 * 60 + 30);
}

const initialStocks = [
  { symbol: "RELIANCE", type: "Stock", price: 2950.5, margin: 0.2, history: [] },
  { symbol: "TCS", type: "Stock", price: 4200.75, margin: 0.2, history: [] },
  { symbol: "HDFCBANK", type: "Stock", price: 1650.3, margin: 0.2, history: [] },
  { symbol: "INFY", type: "Stock", price: 1850.45, margin: 0.2, history: [] },
  { symbol: "SBIN", type: "Stock", price: 620.60, margin: 0.18, history: [] },
  { symbol: "ITC", type: "Stock", price: 470.40, margin: 0.18, history: [] },
  { symbol: "WIPRO", type: "Stock", price: 415.20, margin: 0.2, history: [] },
  { symbol: "AXISBANK", type: "Stock", price: 1080.75, margin: 0.2, history: [] },
  { symbol: "MARUTI", type: "Stock", price: 10500.10, margin: 0.19, history: [] },
  { symbol: "ADANIENT", type: "Stock", price: 3200.00, margin: 0.22, history: [] },
  { symbol: "ONGC", type: "Stock", price: 180.10, margin: 0.17, history: [] },
  { symbol: "BAJAJFINSV", type: "Stock", price: 15300.40, margin: 0.17, history: [] },
];
const initialIndexes = [
  { symbol: "NIFTY", type: "Index", price: 25000, margin: 0.5, history: [] },
  { symbol: "BANKNIFTY", type: "Index", price: 51000, margin: 0.5, history: [] },
];

const initialDiscussion = [
  {
    user: "TraderX",
    text: "Bullish on RELIANCE! Expecting a breakout above 3000 soon.",
    time: new Date().toLocaleString(),
  },
];

function clamp(num, min) { return Math.max(num, min); }
const formatCurrency = (v) => v.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });

export default function PaperTradeApp() {
  const [virtualBalance, setVirtualBalance] = useState(1000000);
  const [portfolio, setPortfolio] = useState([]);
  const [openPositions, setOpenPositions] = useState([]);
  const [marketData, setMarketData] = useState([...initialStocks, ...initialIndexes]);
  const [tradeForm, setTradeForm] = useState({
    instrument: "Stock",
    symbol: "RELIANCE",
    orderType: "Market",
    quantity: 1,
    action: "buy",
    limitPrice: "",
    stopLoss: ""
  });
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [totalPnL, setTotalPnL] = useState(0);
  const [todaysProfit, setTodaysProfit] = useState(0);
  const [discussion, setDiscussion] = useState(initialDiscussion);
  const [discussionInput, setDiscussionInput] = useState("");
  const [selectedChartSymbol, setSelectedChartSymbol] = useState("RELIANCE");
  const [marketStatusOpen, setMarketStatusOpen] = useState(isMarketOpen());

  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData((old) =>
        old.map((item) => {
          const change = (Math.random() * 1.5 - 0.5) * (Math.random() < 0.5 ? -1 : 1);
          const price = clamp(item.price + item.price * change / 100, 1);
          const history = ((item.history && item.history.length > 0) ? [...item.history] : [item.price]);
          history.push(price);
          if (history.length > 50) history.shift();
          return { ...item, price, history };
        })
      );
      setMarketStatusOpen(isMarketOpen());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let pv = 0, pl = 0;
    for (const item of portfolio) {
      const md = marketData.find((m) => m.symbol === item.symbol);
      if (!md) continue;
      const curPrice = md.price;
      pv += curPrice * item.quantity;
      pl += (curPrice - item.avgPrice) * item.quantity * (item.action === "buy" ? 1 : -1);
    }
    setPortfolioValue(pv);
    setTotalPnL(pl);
  }, [marketData, portfolio]);

  function handleTrade(e) {
    e.preventDefault();
    const { instrument, symbol, orderType, quantity, action, limitPrice, stopLoss } = tradeForm;
    if (!symbol || !quantity || quantity <= 0) {
      alert("Enter valid symbol and quantity.");
      return;
    }
    const md = marketData.find((x) => x.symbol === symbol);
    if (!md) { alert("Symbol not found."); return; }
    const tradePrice = orderType === "Market" ? md.price : Number(limitPrice);
    if (orderType === "Limit" && (!tradePrice || tradePrice <= 0)) {
      alert("Enter valid limit price.");
      return;
    }
    const totalCost = tradePrice * quantity;
    const marginRequired = totalCost * md.margin;
    if (action === "buy" && virtualBalance < marginRequired) {
      alert("Not enough balance for margin.");
      return;
    }
    if (action === "buy") {
      setVirtualBalance(vb => vb - marginRequired);
      setPortfolio(pf => {
        const found = pf.find(p => p.symbol === symbol);
        if (found) {
          found.quantity += Number(quantity);
          found.avgPrice = ((found.avgPrice * found.quantity) + (tradePrice * quantity)) / (found.quantity + Number(quantity));
          return [...pf];
        }
        return [...pf, { symbol, type: instrument, quantity: Number(quantity), avgPrice: tradePrice, action }];
      });
      setOpenPositions(op => [
        ...op,
        {
          symbol,
          type: instrument,
          orderType,
          action,
          quantity: Number(quantity),
          entryPrice: tradePrice,
          stopLoss: stopLoss ? Number(stopLoss) : null
        }
      ]);
    } else if (action === "sell") {
      setPortfolio(pf => {
        const found = pf.find(p => p.symbol === symbol);
        if (!found || found.quantity < quantity) {
          alert("Not enough quantity to sell.");
          return pf;
        }
        found.quantity -= Number(quantity);
        if (found.quantity <= 0) return pf.filter(p => p !== found);
        return [...pf];
      });
      setVirtualBalance(vb => vb + totalCost * md.margin);
      setOpenPositions(op => [
        ...op,
        {
          symbol,
          type: instrument,
          orderType,
          action,
          quantity: Number(quantity),
          entryPrice: tradePrice,
          stopLoss: stopLoss ? Number(stopLoss) : null
        }
      ]);
    }
    setTradeForm({ ...tradeForm, quantity: 1, limitPrice: "", stopLoss: "" });
  }

  function handleOpenPositionAction(idx, action) {
    if (action === "sell" || action === "cancel") {
      setOpenPositions(arr => arr.filter((_, i) => i !== idx));
    } else if (action === "set-stop") {
      const stopPrice = Number(prompt("Enter stop-loss price:"));
      if (isNaN(stopPrice) || stopPrice <= 0) return;
      setOpenPositions(pos => pos.map((p, i) => (i === idx ? { ...p, stopLoss: stopPrice } : p)));
    }
  }

  function handlePostDiscussion(e) {
    e.preventDefault();
    if (!discussionInput.trim()) return;
    setDiscussion(ds => [
      { user: "You", text: discussionInput.trim(), time: new Date().toLocaleString() },
      ...ds,
    ]);
    setDiscussionInput("");
  }

  const chartSymbol = marketData.find((m) => m.symbol === selectedChartSymbol) || marketData[0];
  const chartData = {
    labels: chartSymbol.history?.map((_, i) => `T-${(chartSymbol.history.length - i) * 3}s`) || [],
    datasets: [
      {
        label: `${chartSymbol.symbol} Price`,
        data: chartSymbol.history || [chartSymbol.price],
        fill: true,
        backgroundColor: "rgba(59, 130, 246, 0.15)",
        borderColor: "#3b82f6",
        tension: 0.2
      }
    ]
  };

  return (
    <div className="trade-app-root">
      <header className="header">
        <div className="header-title-wrap">
          <h1>TradeHub Virtual Trading Simulator</h1>
          <span>Master stocks and options with ₹10,00,000 virtual cash!</span>
        </div>
        <div className="market-status">
          <span className={marketStatusOpen ? "market-open" : "market-closed"}>
            {marketStatusOpen ? "MARKET OPEN" : "MARKET CLOSED"}
          </span>
        </div>
      </header>
      <section className="dashboard">
        <div className="card portfolio-summary modern-summary">
          <h2>Portfolio Summary</h2>
          <div className="summary-row">
            <span className="label">Virtual Balance:</span>
            <span className="value">{`₹ ${formatCurrency(virtualBalance)}`}</span>
          </div>
          <div className="summary-row">
            <span className="label">Portfolio Value:</span>
            <span className="value">{`₹ ${formatCurrency(portfolioValue)}`}</span>
          </div>
          <div className="summary-row">
            <span className="label">Total P&L:</span>
            <span className={`value ${totalPnL >= 0 ? "profit" : "loss"}`}>{`₹ ${formatCurrency(totalPnL)}`}</span>
          </div>
          <div className="summary-row">
            <span className="label">Today's Profit:</span>
            <span className={`value ${todaysProfit >= 0 ? "highlight" : "loss"}`}>{`₹ ${formatCurrency(todaysProfit)}`}</span>
          </div>
        </div>
        <div className="card chart-section">
          <h2>Price Chart</h2>
          <select
            value={selectedChartSymbol}
            onChange={e => setSelectedChartSymbol(e.target.value)}
            className="input-select"
          >
            {marketData.map((item) => (
              <option key={item.symbol} value={item.symbol}>{item.symbol}</option>
            ))}
          </select>
          <div style={{height:"270px"}}>
            <Line data={chartData} options={{
              plugins: { legend: {labels:{color: "#f9fafb"}} },
              scales: { x: {ticks: {color:"#d1d5db"}}, y:{ticks:{color:"#d1d5db"}} }
            }} />
          </div>
        </div>
      </section>
      <section className="dashboard">
        <div className="card trade-form-panel">
          <h2>Place Trade</h2>
          <form onSubmit={handleTrade}>
            <select
              className="input-select"
              value={tradeForm.instrument}
              onChange={e => setTradeForm(tf => ({ ...tf, instrument: e.target.value }))}
            >
              <option value="Stock">Stock</option>
              <option value="Index">Index</option>
            </select>
            <select
              className="input-select"
              value={tradeForm.symbol}
              onChange={e => setTradeForm(tf => ({ ...tf, symbol: e.target.value }))}
              required
            >
              {marketData.map((s) => (
                <option key={s.symbol} value={s.symbol}>{s.symbol}</option>
              ))}
            </select>
            <select
              className="input-select"
              value={tradeForm.orderType}
              onChange={e => setTradeForm(tf => ({ ...tf, orderType: e.target.value }))}
            >
              <option value="Market">Market</option>
              <option value="Limit">Limit</option>
            </select>
            {tradeForm.orderType === "Limit" && (
              <input
                className="input-field"
                type="number"
                value={tradeForm.limitPrice}
                onChange={e => setTradeForm(tf => ({ ...tf, limitPrice: e.target.value }))}
                placeholder="Limit Price"
                min="1"
                step="0.01"
                required
              />
            )}
            <input
              className="input-field"
              type="number"
              value={tradeForm.quantity}
              onChange={e => setTradeForm(tf => ({ ...tf, quantity: e.target.value }))}
              placeholder="Quantity"
              min="1"
              required
            />
            <input
              className="input-field"
              type="number"
              value={tradeForm.stopLoss}
              onChange={e => setTradeForm(tf => ({ ...tf, stopLoss: e.target.value }))}
              placeholder="Stop Loss (Optional)"
              min="1"
              step="0.01"
            />
            <select
              className="input-select"
              value={tradeForm.action}
              onChange={e => setTradeForm(tf => ({ ...tf, action: e.target.value }))}
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
            <button className="button-primary" type="submit">
              Place Trade
            </button>
          </form>
        </div>
        <div className="card open-positions modern-table-card">
          <h2>Open Positions</h2>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Entry</th>
                <th>Current</th>
                <th>P/L</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {openPositions.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-muted">No open positions.</td>
                </tr>
              )}
              {openPositions.map((pos, idx) => {
                const md = marketData.find(m => m.symbol === pos.symbol) || {};
                const pl = ((md.price - pos.entryPrice) * pos.quantity * (pos.action === "buy" ? 1 : -1));
                return (
                  <tr key={idx}>
                    <td>{pos.symbol}</td>
                    <td>{pos.type}</td>
                    <td>{pos.quantity}</td>
                    <td>{formatCurrency(pos.entryPrice)}</td>
                    <td>{formatCurrency(md.price)}</td>
                    <td className={pl >= 0 ? "profit" : "loss"}>{formatCurrency(pl)}</td>
                    <td>
                      <button onClick={() => handleOpenPositionAction(idx, "sell")} className="btn-sell">Sell</button>
                      <button onClick={() => handleOpenPositionAction(idx, "set-stop")} className="btn-stop">Set Stop-Loss</button>
                      <button onClick={() => handleOpenPositionAction(idx, "cancel")} className="btn-cancel">Cancel</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section className="dashboard">
        <div className="card portfolio-table">
          <h2>Your Portfolio</h2>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Avg. Price</th>
                <th>Current</th>
                <th>P/L</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-muted">No holdings.</td>
                </tr>
              )}
              {portfolio.map((item, idx) => {
                const md = marketData.find((m) => m.symbol === item.symbol);
                const pl = md ? (md.price - item.avgPrice) * item.quantity : 0;
                return (
                  <tr key={idx}>
                    <td>{item.symbol}</td>
                    <td>{item.type}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.avgPrice)}</td>
                    <td>{md ? formatCurrency(md.price) : "—"}</td>
                    <td className={pl >= 0 ? "profit" : "loss"}>{formatCurrency(pl)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="card community-section">
          <h2>Community Discussion</h2>
          <form className="discussion-form" onSubmit={handlePostDiscussion}>
            <input
              className="input-field"
              value={discussionInput}
              onChange={e => setDiscussionInput(e.target.value)}
              placeholder="Share your trade ideas or questions..."
            />
            <button className="btn-post" type="submit">Post</button>
          </form>
          <div className="discussion-feed">
            {discussion.map((post, idx) => (
              <div key={idx} className="discussion-post">
                <b>{post.user}</b> <span className="text-muted">{post.time}</span>
                <p>{post.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
