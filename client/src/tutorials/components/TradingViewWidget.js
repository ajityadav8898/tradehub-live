import React, { useEffect, useRef } from "react";
import styled from "styled-components";

const TradingViewContainer = styled.div`
  width: 100%;
  height: 500px;
  border-radius: 10px;
  overflow: hidden;
`;

const TradingViewWidget = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "autosize": true,
      "symbol": "NASDAQ:AAPL",
      "interval": "D",
      "theme": "light",
      "style": "1",
      "locale": "en",
      "toolbar_bg": "#f1f3f6",
      "enable_publishing": false,
      "hide_legend": false,
      "allow_symbol_change": true,
      "studies": ["RSI@tv-basicstudies", "MACD@tv-basicstudies"]
    });

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }
  }, []);

  return <TradingViewContainer ref={containerRef} />;
};

export default TradingViewWidget;
