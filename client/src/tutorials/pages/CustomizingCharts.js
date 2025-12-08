import React, { useEffect } from "react";

const CustomizingCharts = () => {
  useEffect(() => {
    // Create a script element dynamically
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;

    script.onload = () => {
      new window.TradingView.widget({
        "container_id": "tradingview_chart",
        "width": "100%",
        "height": "500px",
        "symbol": "NASDAQ:AAPL",
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "light",
        "style": "1",
        "locale": "en",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "studies": ["RSI@tv-basicstudies"],
      });
    };

    document.body.appendChild(script);
  }, []);

  return (
    <section id="customizingCharts" className="customizing-section">
      <h2>🎨 Customizing Charts</h2>
      <p>Try out TradingView's chart tools below:</p>

      {/* TradingView Chart Container */}
      <div id="tradingview_chart"></div>
    </section>
  );
};

export default CustomizingCharts;
