import React, { useState, useEffect, useContext } from 'react';
import Navbar from '../components/Navbar';
import AuthContext from '../context/AuthContext';
import '../styles/Dashboard.css';

const DashboardPage = () => {
    const { user } = useContext(AuthContext);
    const [balance, setBalance] = useState(0);
    const [portfolio, setPortfolio] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Data Fetching ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                // 1. Fetch Portfolio & Balance
                const pRes = await fetch('http://localhost:5000/api/trade/portfolio', {
                    headers: { 'x-auth-token': token }
                });
                const pData = await pRes.json();
                if (pRes.ok) {
                    setBalance(Number(pData.balance));
                    setPortfolio(pData.portfolio);
                }

                // 2. Fetch History
                const hRes = await fetch('http://localhost:5000/api/trade/history', {
                    headers: { 'x-auth-token': token }
                });
                const hData = await hRes.json();
                if (hRes.ok) {
                    setHistory(hData);
                }

            } catch (err) {
                console.error("Dashboard Load Error", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- Derived Metrics ---
    // Note: To get REAL-TIME Total Value, we need current prices.
    // For specific dashboard view without massive polling, we can use the stored Average Price 
    // OR ideally we fetch a snapshot of prices, but let's stick to "Invested Value" vs "Current Value" logic if possible.
    // Since we don't have the live Market Data context here (unless we duplicate the mock data logic or fetch it),
    // we will display "Invested Value" as the primary metric and "Realized P&L" from history.
    // To show "Current P&L", we'd need live prices. 
    // OPTION: We can import `MOCK_STOCKS` etc to get at least the *base* price for estimation?
    // Actually, PaperTradePage updates prices randomly. 
    // Let's just show "Invested Amount" and "Cash Balance" accurately. 
    // Displaying "Current P&L" as "N/A (Check Trade Page)" or calculating strictly from history (Realized).

    // Let's Calculate REALIZED P&L from History
    const realizedPL = history.reduce((acc, trade) => {
        // Simple heuristic: If SELL, the profit is (Price - AvgPrice) * Qty? 
        // Backend doesn't store "Profit" per trade yet.
        // We can only show Total Trades and Win Rate approx later.
        // For now, Balance - 10L = Total P&L (Realized + Unrealized Cash Diff).
        // Wait, Virtual Balance starts at 10,00,000.
        // Current Balance + Invested Value = Total Account Value.
        // Total Account Value - 10,00,000 = Total P&L.
        return acc;
    }, 0);

    const totalInvested = portfolio.reduce((acc, p) => acc + (p.averagePrice * p.quantity), 0);
    const totalAccountValue = balance + totalInvested; // Approximation (using cost basis for invested)
    const totalPL = totalAccountValue - 1000000;

    if (loading) return <div className="db-container"><Navbar /><div className="db-main" style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>Loading Dashboard...</div></div>;

    return (
        <div className="db-container">
            <Navbar />

            <div className="db-main">
                {/* Header */}
                <header className="db-header">
                    <h1>Hello, {user?.username || 'Trader'}</h1>
                    <p>Welcome back to your trading command center.</p>
                </header>

                {/* Stats Grid */}
                <div className="db-stats-grid">
                    <div className="db-stat-card">
                        <div className="db-stat-icon"><i className="bi bi-wallet2"></i></div>
                        <div className="db-stat-label">Total Account Value</div>
                        <div className="db-stat-value">₹{totalAccountValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                    </div>
                    <div className="db-stat-card">
                        <div className="db-stat-icon"><i className="bi bi-cash-stack"></i></div>
                        <div className="db-stat-label">Available Cash</div>
                        <div className="db-stat-value text-green">₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                    </div>
                    <div className="db-stat-card">
                        <div className="db-stat-icon"><i className="bi bi-graph-up-arrow"></i></div>
                        <div className="db-stat-label">Invested Amount</div>
                        <div className="db-stat-value">₹{totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</div>
                    </div>
                    <div className="db-stat-card">
                        <div className="db-stat-icon"><i className="bi bi-percent"></i></div>
                        <div className="db-stat-label">Net Profit / Loss</div>
                        <div className={`db-stat-value ${totalPL >= 0 ? 'text-green' : 'text-red'}`}>
                            {totalPL >= 0 ? '+' : ''}₹{totalPL.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                {/* Active Holdings */}
                <section className="db-section">
                    <div className="db-section-header">
                        <h2>Active Portfolio</h2>
                        {/* <button className="pt-btn-sm outline">View All</button> */}
                    </div>
                    {portfolio.length === 0 ? (
                        <p className="text-muted">No active positions. Go to the <a href="/paper-trade" style={{ color: '#0adfaa' }}>Trade Page</a> to start.</p>
                    ) : (
                        <div className="db-table-container">
                            <table className="db-table">
                                <thead>
                                    <tr>
                                        <th>Symbol</th>
                                        <th>Instrument</th>
                                        <th>Qty</th>
                                        <th>Avg. Price</th>
                                        <th>Inv. Value</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {portfolio.map((item, index) => (
                                        <tr key={index} className="db-table-row">
                                            <td><strong>{item.symbol}</strong></td>
                                            <td>{item.instrument}</td>
                                            <td>{item.quantity}</td>
                                            <td>₹{item.averagePrice.toFixed(2)}</td>
                                            <td>₹{(item.quantity * item.averagePrice).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* Recent Trade History */}
                <section className="db-section">
                    <div className="db-section-header">
                        <h2>Recent History</h2>
                    </div>
                    {history.length === 0 ? (
                        <p className="text-muted">No trade history yet.</p>
                    ) : (
                        <div className="db-table-container">
                            <table className="db-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Symbol</th>
                                        <th>Action</th>
                                        <th>Type</th>
                                        <th>Qty</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.slice(0, 10).map((trade, index) => (
                                        <tr key={index} className="db-table-row">
                                            <td>{new Date(trade.timestamp).toLocaleDateString()}</td>
                                            <td>{trade.symbol}</td>
                                            <td>
                                                <span className={trade.action === 'BUY' ? 'text-green' : 'text-red'}>
                                                    {trade.action}
                                                </span>
                                            </td>
                                            <td>{trade.orderType}</td>
                                            <td>{Math.abs(trade.quantity)}</td>
                                            <td>₹{trade.price.toFixed(2)}</td>
                                            <td>
                                                <span
                                                    style={{
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        fontSize: '0.8em',
                                                        background: trade.status === 'PENDING' ? '#856404' : (trade.status === 'EXECUTED' ? '#155724' : '#721c24'),
                                                        color: trade.status === 'PENDING' ? '#fff3cd' : (trade.status === 'EXECUTED' ? '#d4edda' : '#f8d7da')
                                                    }}
                                                >
                                                    {trade.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
};

export default DashboardPage;
