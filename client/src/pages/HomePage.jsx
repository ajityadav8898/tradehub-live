import ParticlesComponent from '../components/ParticlesComponent'; // Import Particles
import React, { useEffect, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/HomeSections.css';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext); // logout removed if unused
    const [isMounted, setIsMounted] = useState(false);

    // FAQ State
    const [activeIndex, setActiveIndex] = useState(null);

    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    // --- NAVIGATION PROTECTION LOGIC MOVED TO NAVBAR ---
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // --- GSAP and Cursor Logic (Restored) ---
    useEffect(() => {
        if (!isMounted) return;

        // --- Cursor and Blur Effect ---
        const crsr = document.querySelector("#cursor");
        const blur = document.querySelector("#cursor-blur");

        const handleMouseMove = (dets) => {
            if (crsr && blur) {
                crsr.style.left = dets.x + "px";
                crsr.style.top = dets.y + "px";
                blur.style.left = dets.x - 180 + "px";
                blur.style.top = dets.y - 180 + "px";
            }
        };
        document.addEventListener("mousemove", handleMouseMove);

        // --- GSAP Animations (Restored) ---
        // Note: Navbar is now a component, but it renders a div with id="nav", so this selector still works.
        gsap.to("#nav", {
            backgroundColor: "#000",
            height: "12vh",
            duration: 0.5,
            scrollTrigger: { trigger: "#nav", scroller: "body", start: "top -10%", end: "top -11%", scrub: 1 }
        });

        gsap.to("#main", {
            backgroundColor: "#000",
            scrollTrigger: {
                trigger: "#main",
                scroller: "body",
                start: "top -25%",
                end: "top -70%",
                scrub: 2
            }
        });

        gsap.from("#about-us img ,#about-us-in", {
            y: 90,
            opacity: 0,
            duration: 1,
            scrollTrigger: { trigger: "#about-us", scroller: "body", start: "top 70%", end: "top 65%", scrub: 3 }
        });

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [isMounted]);

    // --- JSX Render ---
    return (
        <React.Fragment>
            {/* Navbar Component */}
            <Navbar />

            <div id="cursor"></div>
            <div id="cursor-blur"></div>

            {/* PARTICLES BACKGROUND */}
            <ParticlesComponent id="particles" />

            {/* CORRECT #main container for all scrollable content */}
            <div id="main">

                <div id="page1">
                    <h2>Options / Futures / Equity</h2>
                    <p>A trusted and secure Trading Platform Licensed by SEBI.</p>
                </div>

                <div id="page2">
                    <div id="scroller">
                        <div id="scroller-in"><h4>BankNifty</h4><h4>Nifty</h4><h4>Finnifty</h4><h4>MidCapNifty</h4><h4>Sensex</h4><h4>Bankex</h4></div>
                        <div id="scroller-in"><h4>BankNifty</h4><h4>Nifty</h4><h4>Finnifty</h4><h4>MidCapNifty</h4><h4>Sensex</h4><h4>Bankex</h4></div>
                    </div>

                    <div id="about-us" className="about-us">
                        <img src="/assets/GreenBullFigure1.jpeg" alt="Green Bull" />
                        <div id="about-us-in">
                            <h3>About Us</h3>
                            <p>TradeHub is an educational trading platform offering eBooks, charts, and learning tools.</p>
                        </div>
                        <img src="/assets/RedBullFigure1.jpeg" alt="Red Bear" />
                    </div>
                </div>

                {/* --- NEW SECTIONS START --- */}

                {/* Key Features Section */}
                <div className="section-container key-features-section">
                    <h2 className="section-title">Key Features</h2>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon"><i className="bi bi-currency-exchange"></i></div>
                            <h3>Virtual Trading</h3>
                            <p>Practice trading strategies with real-time market data without risking actual capital. Perfect for beginners to build confidence.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><i className="bi bi-bar-chart-line-fill"></i></div>
                            <h3>Interactive Charts</h3>
                            <p>Analyze stocks like a pro with our advanced charting tools, indicators, and drawing capabilities powered by TradingView.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><i className="bi bi-book-half"></i></div>
                            <h3>Educational Resources</h3>
                            <p>Access a comprehensive library of eBooks and tutorials designed to take you from novice to expert trader.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><i className="bi bi-lightning-charge-fill"></i></div>
                            <h3>Live Market Insights</h3>
                            <p>Stay ahead of the curve with live updates on top gainers, losers, and market sentiment analysis.</p>
                        </div>
                    </div>
                </div>

                {/* Founder Section */}
                <div className="section-container founder-section">
                    <h2 className="section-title">Meet our Founders</h2>
                    <p style={{ marginBottom: '3rem', color: '#ccc' }}>The visionaries behind TradeHub, building the future of trading education.</p>
                    <div className="founders-grid">
                        <div className="founder-card">
                            <div className="founder-image-container">
                                <img src="/assets/founder-ajit.png" alt="Ajit Yadav" />
                            </div>
                            <h3 className="founder-name">Ajit Yadav</h3>
                            <p className="founder-role">Founder & CEO</p>
                            <p className="founder-bio">Ajit leads TradeHub with a mission to simplify trading for everyone. With deep expertise in financial markets, he is dedicated to empowering the next generation of traders.</p>
                            <div className="founder-socials">
                                <a href="https://www.linkedin.com/in/ajit-yadav89" target="_blank" rel="noreferrer" className="social-icon linkedin"><i className="bi bi-linkedin"></i></a>
                                {/* X icon removed as requested */}
                                <a href="https://www.instagram.com/ajit._8898" target="_blank" rel="noreferrer" className="social-icon instagram" style={{ background: '#E1306C' }}><i className="bi bi-instagram"></i></a>
                            </div>
                        </div>

                        {/* Co-Founder Card */}
                        <div className="founder-card">
                            <div className="founder-image-container">
                                <img src="/assets/founder-yasir.png" alt="Mohammad Yasir" />
                            </div>
                            <h3 className="founder-name">Mohammad Yasir</h3>
                            <p className="founder-role">Co-Founder</p>
                            <p className="founder-bio">Yasir drives the technical vision and strategy at TradeHub, ensuring a seamless and innovative learning experience for all users.</p>
                            <div className="founder-socials">
                                <a href="https://www.linkedin.com/in/mohammad-yasir-ansari-9b2652376?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noreferrer" className="social-icon linkedin"><i className="bi bi-linkedin"></i></a>
                                <a href="https://www.instagram.com/yasiii_r35" target="_blank" rel="noreferrer" className="social-icon instagram" style={{ background: '#E1306C' }}><i className="bi bi-instagram"></i></a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="section-container faq-section">
                    <h2 className="section-title">Frequently Asked Questions</h2>
                    <div className="faq-container">
                        {[
                            { q: "What is TradeHub?", a: "TradeHub is a comprehensive educational platform designed to help you master trading through tutorials, charts, and paper trading." },
                            { q: "Is TradeHub free to use?", a: "Yes, our core educational resources and paper trading features are completely free for all registered users." },
                            { q: "How do I start paper trading?", a: "Simply sign up, navigate to the 'Trade' section, and start practicing with virtual currency in real-time market conditions." },
                            { q: "Can I access TradeHub on mobile?", a: "Absolutely! TradeHub is fully responsive and works seamlessly on all mobile devices and tablets." }
                        ].map((item, index) => (
                            <div key={index} className={`faq-item ${activeIndex === index ? 'active' : ''}`} onClick={() => toggleFAQ(index)}>
                                <div className="faq-question">
                                    {item.q}
                                    <span className="faq-toggle">+</span>
                                </div>
                                <div className="faq-answer">
                                    <p>{item.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- NEW SECTIONS END --- */}

                {/* Footer Component */}
                <Footer />
            </div>
        </React.Fragment>
    );
};

export default HomePage;