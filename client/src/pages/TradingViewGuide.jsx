import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/TradingViewGuide.css";

export default function TutorialsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const videos = [
    {
      id: 1,
      title: "TradingView Guide for Beginners",
      category: "Basics",
      url: "https://www.youtube.com/embed/rJj4ZbnzEGs",
      description: "Learn the absolute basics of setting up charts and navigating the interface."
    },
    {
      id: 2,
      title: "How to Read Candlestick Patterns",
      category: "Analysis",
      url: "https://www.youtube.com/embed/C32l-vQf5K0",
      description: "Understand the language of the market through Japanese Candlesticks."
    },
    {
      id: 3,
      title: "Moving Averages Explained",
      category: "Indicators",
      url: "https://www.youtube.com/embed/Us227C0f_1k",
      description: "Master one of the most popular trend-following indicators."
    },
    {
      id: 4,
      title: "RSI Strategy for Beginners",
      category: "Indicators",
      url: "https://www.youtube.com/embed/B2y_M0k_1p8",
      description: "How to use the Relative Strength Index to find entry and exit points."
    },
    {
      id: 5,
      title: "Support and Resistance Basics",
      category: "Analysis",
      url: "https://www.youtube.com/embed/4M8o6qS7qZc",
      description: "Identify key levels where price is likely to react."
    },
    {
      id: 6,
      title: "Introduction to MACD",
      category: "Indicators",
      url: "https://www.youtube.com/embed/e5KA3jXN04M",
      description: "Using the MACD indicator to identify momentum and trend reversals."
    }
  ];

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="tutorials-page">
      <Navbar />

      {/* Hero Section */}
      <div className="tutorials-hero">
        <h1>Master the Markets with <span className="highlight-text">TradeHub</span></h1>
        <p>
          Your ultimate library for trading tutorials, strategies, and chart mastery.
          Start your journey from beginner to pro today.
        </p>

        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search tutorials (e.g., 'Candlesticks', 'RSI')..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Video Content Section */}
      <div className="tutorial-section">
        <h2 className="section-title">Video Library</h2>
        <div className="video-grid">
          {filteredVideos.map((video) => (
            <div key={video.id} className="video-card">
              <div className="video-thumbnail">
                <iframe
                  src={video.url}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
              <div className="video-info">
                <span className="video-category">{video.category}</span>
                <h3>{video.title}</h3>
                <p>{video.description}</p>
              </div>
            </div>
          ))}
          {filteredVideos.length === 0 && <p style={{ color: '#ccc', fontStyle: 'italic' }}>No videos found matching your search.</p>}
        </div>
      </div>

      {/* Featured Course Section */}
      <div className="tutorial-section">
        <div className="featured-section">
          <div className="featured-content">
            <span className="featured-tag">Recommended</span>
            <h2>Zero to Hero: Trading Masterclass</h2>
            <p>
              A comprehensive structured course covering everything from basic terminology to advanced algorithmic trading strategies.
              Get certified upon completion.
            </p>
            <a href="#" className="cta-btn">Start Course Now</a>
          </div>
          <div className="featured-image">
            <img src="https://images.unsplash.com/photo-1611974765270-ca12586343bb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" alt="Trading Course" />
          </div>
        </div>
      </div>

      {/* Written Guides / Articles Section */}
      <div className="tutorial-section">
        <h2 className="section-title">Essential Reading</h2>
        <div className="article-grid">

          <div className="article-card">
            <i className="bi bi-graph-up-arrow article-icon"></i>
            <h3>Chart Analysis</h3>
            <ul>
              <li>Support & Resistance</li>
              <li>Trendlines 101</li>
              <li>Chart Patterns</li>
            </ul>
            <a href="https://www.tradingview.com/support/categories/chart-analysis/" target="_blank" rel="noreferrer" className="read-btn">Read Guides &rarr;</a>
          </div>

          <div className="article-card">
            <i className="bi bi-cpu article-icon"></i>
            <h3>Indicators</h3>
            <ul>
              <li>RSI & MACD</li>
              <li>Bollinger Bands</li>
              <li>Volume Analysis</li>
            </ul>
            <a href="https://www.tradingview.com/support/categories/indicators/" target="_blank" rel="noreferrer" className="read-btn">Read Guides &rarr;</a>
          </div>

          <div className="article-card">
            <i className="bi bi-brain article-icon"></i>
            <h3>Psychology & Risk</h3>
            {/* Updated title to match link context better if generic */}
            <ul>
              <li>Risk Management</li>
              <li>FOMO & Discipline</li>
              <li>Trading Plan</li>
            </ul>
            {/* TradingView doesn't have a dedicated 'Psychology' category, linking to general markets/ideas or a generic reputable source would be best, but user asked for TradingView guides. I'll link to their 'Trading' category which covers concepts. */}
            <a href="https://www.tradingview.com/support/categories/trading/" target="_blank" rel="noreferrer" className="read-btn">Read Guides &rarr;</a>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
