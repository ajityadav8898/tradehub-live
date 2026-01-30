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
      url: "https://www.youtube.com/embed/EVlQgmirnCg",
      description: "Understand the language of the market through Japanese Candlesticks."
    },
    {
      id: 3,
      title: "Moving Averages Explained",
      category: "Indicators",
      url: "https://www.youtube.com/embed/7ASY4PtZUTQ",
      description: "Master one of the most popular trend-following indicators."
    },
    {
      id: 4,
      title: "RSI Strategy for Beginners",
      category: "Indicators",
      url: "https://www.youtube.com/embed/WZkXcfr4r3c",
      description: "How to use the Relative Strength Index to find entry and exit points."
    },
    {
      id: 5,
      title: "Support and Resistance Basics",
      category: "Analysis",
      url: "https://www.youtube.com/embed/r2LzjTUs3lo",
      description: "Identify key levels where price is likely to react."
    },
    {
      id: 6,
      title: "Introduction to MACD",
      category: "Indicators",
      url: "https://www.youtube.com/embed/btp0qIIa0Qw",
      description: "Using the MACD indicator to identify momentum and trend reversals."
    },
    {
      id: 7,
      title: "Mutual Funds for Beginners",
      category: "Investing",
      url: "https://www.youtube.com/embed/6fQwVxqqpAg",
      description: "A complete guide to understanding and investing in Mutual Funds."
    },
    {
      id: 8,
      title: "What Is SIP? (Systematic Investment Plan)",
      category: "Investing",
      url: "https://www.youtube.com/embed/rAqzpRZa78E",
      description: "Learn how SIPs work and how they help build long-term wealth."
    },
    {
      id: 9,
      title: "What is an IPO?",
      category: "Investing",
      url: "https://www.youtube.com/embed/gWrR5qPEmWE",
      description: "Understand the IPO process and why companies go public."
    },
    {
      id: 10,
      title: "Forex Trading for Beginners",
      category: "Trading",
      url: "https://www.youtube.com/embed/RunUl7eFx44",
      description: "Start your journey into the world of Foreign Exchange trading."
    },
    {
      id: 11,
      title: "Crypto Trading for Beginners",
      category: "Crypto",
      url: "https://www.youtube.com/embed/hnS5sjqXXIc",
      description: "A plain English guide to trading Bitcoin and profitable strategies."
    }
  ];

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const moreCourses = [
    {
      id: 1,
      title: "Advanced Technical Analysis",
      category: "Analysis",
      image: "/assets/advanced-technical-analysis.png",
      description: "Deep dive into chart patterns, multi-timeframe analysis, and advanced indicators.",
      link: "https://www.upsurge.club/courses/technical-analysis"
    },
    {
      id: 2,
      title: "Crypto Trading 101",
      category: "Crypto",
      image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      description: "Master the basics of cryptocurrency trading, wallets, and blockchain technology.",
      link: "https://www.udemy.com/course/the-complete-cryptocurrency-trading-course/"
    },
    {
      id: 3,
      title: "Forex Mastery Course",
      category: "Forex",
      image: "/assets/forex-mastery.png",
      description: "Learn to trade foreign currencies with confidence using proven strategies.",
      link: "https://www.udemy.com/course/forex-trading-fundamentals-to-advanced/"
    },
    {
      id: 4,
      title: "Options Trading Strategies",
      category: "Options",
      image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      description: "Understand calls, puts, and complex option strategies for hedging and profit.",
      link: "https://www.udemy.com/course/options-trading-strategies-module/"
    },
    {
      id: 5,
      title: "Swing Trading Secrets",
      category: "Strategy",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      description: "Capture gains in a stock within one to four days. Ideal for part-time traders.",
      link: "https://www.udemy.com/course/swing-trading-strategy-that-can-win-even-when-youre-wrong/"
    }
  ];

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
            <a href="https://www.udemy.com/course/learn-stock-trading-from-scratch/" target="_blank" rel="noopener noreferrer" className="cta-btn">Start Course Now</a>
          </div>
          <div className="featured-image">
            <img src="/assets/zero-to-hero.png" alt="Trading Course" />
          </div>
        </div>
      </div>

      {/* More Courses Section */}
      <div className="tutorial-section">
        <h2 className="section-title">More Courses</h2>
        <div className="video-grid">
          {moreCourses.map((course) => (
            <div key={course.id} className="video-card">
              <div className="video-thumbnail">
                <img
                  src={course.image}
                  alt={course.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div className="video-info">
                <span className="video-category">{course.category}</span>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <a
                  href={course.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-btn"
                  style={{ marginTop: '15px', fontSize: '0.8rem', padding: '8px 20px', cursor: 'pointer', display: 'inline-block', textAlign: 'center', textDecoration: 'none' }}
                >
                  Enroll Now
                </a>
              </div>
            </div>
          ))}
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
