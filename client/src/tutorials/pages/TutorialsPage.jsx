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

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

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

    & a {
        color: #007bff;
        text-decoration: none;
        font-weight: bold;
        margin-left: 5px;
    }

    & a:hover {
        text-decoration: underline;
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
                            <li>Candlestick Charts – Show price movement in a specific time frame. <a href="https://youtu.be/EVlQgmirnCg?si=hpJcDv6EBNFwpGZQ" target="_blank" rel="noopener noreferrer">Watch Tutorial</a></li>
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
                            <li>Support and Resistance – Key levels where price reverses. <a href="https://youtu.be/r2LzjTUs3lo?si=RgCCl5tUom8x39sm" target="_blank" rel="noopener noreferrer">Watch Tutorial</a></li>
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
                            <li>RSI – Shows if a stock is overbought (too high) or oversold (too low). <a href="https://youtu.be/WZkXcfr4r3c?si=3_xxKCxIhUCYCyWf" target="_blank" rel="noopener noreferrer">Watch Tutorial</a></li>
                            <li>MACD – Helps spot trend changes. <a href="https://youtu.be/btp0qIIa0Qw?si=K-CvMo5VVki21qAz" target="_blank" rel="noopener noreferrer">Watch Tutorial</a></li>
                            <li>Moving Averages – Smooth out price data to identify trends. <a href="https://youtu.be/7ASY4PtZUTQ?si=FCTKnxLq-bSx1TB7" target="_blank" rel="noopener noreferrer">Watch Tutorial</a></li>
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

                {/* 6. Mutual Funds */}
                <Element name="mutualFunds">
                    <Section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
                        <h2>💰 Mutual Funds</h2>
                        <ul>
                            <li>A pool of money collected from many investors to invest in securities like stocks, bonds, money market instruments, and other assets. <a href="https://www.youtube.com/watch?v=0b7_lC_Hw6I" target="_blank" rel="noopener noreferrer">Watch Tutorial</a></li>
                        </ul>
                    </Section>
                </Element>

                {/* 7. SIPs (Systematic Investment Plans) */}
                <Element name="sips">
                    <Section initial={{ x: -100 }} animate={{ x: 0 }} transition={{ duration: 1 }}>
                        <h2>📅 SIPs (Systematic Investment Plans)</h2>
                        <ul>
                            <li>A method of investing a fixed sum specifically in mutual funds at regular intervals. <a href="https://www.youtube.com/watch?v=1F2bIu91PJs" target="_blank" rel="noopener noreferrer">Watch Tutorial</a></li>
                        </ul>
                    </Section>
                </Element>

                {/* 8. IPOs (Initial Public Offerings) */}
                <Element name="ipos">
                    <Section initial={{ x: 100 }} animate={{ x: 0 }} transition={{ duration: 1 }}>
                        <h2>🚀 IPOs (Initial Public Offerings)</h2>
                        <ul>
                            <li>The process of offering shares of a private corporation to the public in a new stock issuance. <a href="https://www.youtube.com/watch?v=neP_5_B1X6o" target="_blank" rel="noopener noreferrer">Watch Tutorial</a></li>
                        </ul>
                    </Section>
                </Element>

                {/* 9. Forex Trading */}
                <Element name="forex">
                    <Section initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 1 }}>
                        <h2>🌍 Forex Trading</h2>
                        <ul>
                            <li>Foreign exchange trading is the process of speculating on currency prices to potentially make a profit. <a href="https://www.youtube.com/watch?v=kYJ6c3aVqL8" target="_blank" rel="noopener noreferrer">Watch Tutorial</a></li>
                        </ul>
                    </Section>
                </Element>

                {/* 10. Bitcoin Trading */}
                <Element name="bitcoin">
                    <Section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
                        <h2>₿ Bitcoin Trading</h2>
                        <ul>
                            <li>Buying and selling Bitcoin to make a profit from price fluctuations. <a href="https://www.youtube.com/watch?v=kYv9N8z_y3U" target="_blank" rel="noopener noreferrer">Watch Tutorial</a></li>
                        </ul>
                    </Section>
                </Element>
            </Content>
        </PageContainer>
    );
};

export default TutorialsPage;