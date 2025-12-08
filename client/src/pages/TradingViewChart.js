import React, { useEffect, useRef, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "../styles/Charts.css";

const TradingViewChart = () => {
  const chartRef = useRef(null);
  const chartContainerId = "tradingview_chart";
  const stockSymbol = "AAPL"; // Default symbol

  // Initialize Chart Logic
  const initializeChart = useCallback((symbol) => {
    if (!window.TradingView) return;

    // Clear previous if exists
    if (chartRef.current) {
      chartRef.current.innerHTML = "";
    }

    new window.TradingView.widget({
      container_id: chartContainerId,
      symbol: "NASDAQ:" + symbol,
      autosize: true, // IMPORTANT: Fills the container automatically
      theme: "dark", // FORCED DARK THEME
      style: "1",
      locale: "en",
      toolbar_bg: "#000",
      hide_top_toolbar: false,
      hide_side_toolbar: false,
      enable_publishing: false,
      allow_symbol_change: true,
      interval: "D",
    });
  }, []);

  // Load Script and Initialize
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      initializeChart(stockSymbol);
    };

    if (document.getElementById(chartContainerId) && !window.TradingView) {
      document.head.appendChild(script);
    } else if (window.TradingView) {
      initializeChart(stockSymbol);
    }
  }, [initializeChart, stockSymbol]);

  return (
    <>
      <Navbar />
      <div className="charts-page-container">
        <h1 className="charts-heading">
          Trading <span>Chart</span>
        </h1>

        <div className="chart-box">
          <div ref={chartRef} id={chartContainerId} className="tradingview-widget-container" style={{ height: "100%", width: "100%" }}></div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TradingViewChart;
