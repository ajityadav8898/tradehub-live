import React, { useEffect, useRef, memo } from 'react';

const TradingViewWidget = ({ symbol = "RELIANCE", theme = "dark", height = "500px" }) => {
    const containerId = useRef(`tv_chart_container_${Math.random().toString(36).substring(7)}`);

    useEffect(() => {
        const scriptId = "tradingview-widget-script";

        // Helper to init widget
        const initWidget = () => {
            if (window.TradingView) {
                // Handle symbol format: Try to map to BSE/NSE if generic
                let tvSymbol = symbol;
                if (!symbol.includes(":")) {
                    // Logic for Indian Market Mapping
                    if (symbol === "NIFTY 50") {
                        tvSymbol = "NIFTY";
                    } else if (symbol === "BANKNIFTY") {
                        tvSymbol = "BANKNIFTY";
                    } else if (symbol === "SENSEX") {
                        tvSymbol = "BSE:SENSEX";
                    } else {
                        // Default Stocks to BSE (NSE is restricted on free widget)
                        tvSymbol = `BSE:${symbol}`;
                    }
                }

                new window.TradingView.widget({
                    container_id: containerId.current,
                    width: "100%",
                    height: height,
                    symbol: tvSymbol,
                    interval: "D",
                    timezone: "Asia/Kolkata",
                    theme: theme,
                    style: "1",
                    locale: "in",
                    toolbar_bg: "#000000",
                    enable_publishing: false,
                    allow_symbol_change: true, // Allow user to search
                    save_image: false,
                    hide_side_toolbar: false,
                    backgroundColor: "#000000", // Force black bg
                    gridLineColor: "rgba(255,255,255,0.05)",
                });
            }
        };

        // Load script if not present
        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://s3.tradingview.com/tv.js";
            script.async = true;
            script.onload = initWidget;
            document.head.appendChild(script);
        } else {
            initWidget();
        }

    }, [symbol, theme, height]);

    return (
        <div className="tradingview-widget-container" style={{ height: height, width: "100%" }}>
            <div id={containerId.current} style={{ height: "100%", width: "100%" }} />
        </div>
    );
};

export default memo(TradingViewWidget);
