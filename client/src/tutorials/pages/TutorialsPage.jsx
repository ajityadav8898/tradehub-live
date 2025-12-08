import React from "react";
import { Element } from "react-scroll";
import Navbar from '../components/Navbar'; 
import TradingViewWidget from '../components/TradingViewWidget'; // CORRECTED PATH
import styled from "styled-components";
import { motion } from "framer-motion";
import '../styles/TradingViewGuide.css'; 

// Styled Components (Retained from your code for structure)
const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    /* This padding is CRITICAL to push content below the fixed Navbar */
    padding-top: 80px; 
    min-height: 100vh;
    background-color: #f4f4f4; 
    /* Global color for the page background */
`;

const Content = styled.div`
    padding: 20px;
    max-width: 90vw; /* Centers and constrains content */ 
    margin: 0 auto; 
    width: 100%;
    overflow-y: auto;
`;

// client/src/tutorials/pages/TutorialsPage.jsx

// ... (existing imports and PageContainer, Content components) ...

const Section = styled(motion.div)`
    background: white;
    padding: 40px;
    margin-bottom: 40px;
    border-radius: 10px;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
    font-family: Arial, sans-serif;
    color: #333;

    /* ✅ FIX 1: Add margin below the main heading for line space */
    & h2 {
        font-size: 24px;
        margin-bottom: 20px; /* CRITICAL FIX: Adds space below the title */
        padding-bottom: 10px; /* Adds visual breathing room */
        border-bottom: 1px solid #eee; /* Adds a subtle divider line for separation */
        color: #333;
    }

    /* ✅ FIX 2: Ensure list items have proper spacing below the title */
    & ul {
        list-style: disc; 
        margin-left: 20px;
        margin-top: 15px; /* Adds space above the list content */
        padding: 0;
    }

    & p, & li {
        color: #444; 
        line-height: 1.6; /* Improves vertical readability */
    }
`;

// ... (rest of the TutorialsPage component code) ...

// App Component (Renamed to TutorialsPage)
const TutorialsPage = () => {
    return (
        <PageContainer>
            <Navbar /> 
            <Content>
                
                {/* 1. Introduction Section (Full Content Restored) */}
                <Element name="intro">
                    <Section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                        <h2>1️⃣ Introduction</h2>
                        <ul>
                            <li>TradingView is a tool that helps traders analyze stock, crypto, and forex charts.</li>
                            <li>You can see price movements, trends, and indicators to make better trading decisions.</li>
                            <li>It’s free to use, but paid plans give extra features.</li>
                        </ul>
                    </Section>
                </Element>

                {/* 2. Chart Basics Section (Full Content Restored) */}
                <Element name="chartBasics">
                    <Section initial={{ x: -100 }} animate={{ x: 0 }} transition={{ duration: 1 }}>
                        <h2>📊 Chart Basics</h2>
                        <ul>
                            <li>Candlestick Charts – Show price movement in a specific time frame.</li>
                            <li>Line Charts – Connect closing prices for a smooth trend view.</li>
                            <li>Bar Charts – Display the opening, closing, high, and low price for each time period.</li>
                            <li>Volume Indicators – Show the number of trades happening.</li>
                            <li>📝 Key Point: Candlesticks are the most used charts in trading!</li>
                        </ul>
                    </Section>
                </Element>

                {/* 3. Drawing Tools Section (Full Content Restored) */}
                <Element name="drawingTools">
                    <Section initial={{ x: 100 }} animate={{ x: 0 }} transition={{ duration: 1 }}>
                        <h2>✏ Drawing Tools</h2>
                        <ul>
                            <li>Trend Lines – Draw lines to identify market direction.</li>
                            <li>Fibonacci Retracements – Predict price reversals using percentage levels.</li>
                            <li>Gann Fans – Help measure time and price movements.</li>
                            <li>Elliott Waves – Identify repeating market wave patterns.</li>
                            <li>📝 Key Point: Drawing tools help in understanding market trends!</li>
                        </ul>
                    </Section>
                </Element>

                {/* 4. Indicators & Scripts Section (Full Content Restored) */}
                <Element name="indicators">
                    <Section initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 1 }}>
                        <h2>📈 Indicators & Scripts</h2>
                        <ul>
                            <li>RSI – Shows if a stock is overbought (too high) or oversold (too low).</li>
                            <li>MACD – Helps spot trend changes.</li>
                            <li>Bollinger Bands – Show whether a stock is too volatile or stable.</li>
                            <li>📝 Key Point: Indicators help traders make smarter decisions!</li>
                        </ul>
                    </Section>
                </Element>

                {/* 5. Customizing Charts Section (CHART & Text) */}
                <Element name="customizingCharts">
                    <Section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
                        <h2>🎨 Customizing Charts</h2>
                        <p>Modify chart colors, grid styles, and more to match your trading strategy.</p>
                        
                        {/* ✅ ONLY ONE CHART: Render TradingView Widget here. */}
                        <TradingViewWidget />
                    </Section>
                </Element>
            </Content>
        </PageContainer>
    );
};

export default TutorialsPage;