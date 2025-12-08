import React from 'react';
import '../styles/HomeSections.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-section">
                    <h3>About TradeHub</h3>
                    <p>TradeHub is your premier destination for mastering the art of trading. We provide cutting-edge educational tools, real-time charts, and a risk-free paper trading environment to help you succeed.</p>
                </div>
                <div className="footer-section">
                    <h3>Quick Links</h3>
                    <ul>
                        <li><a href="/dashboard">Dashboard</a></li>
                        <li><a href="/ebooks">E-Books Library</a></li>
                        <li><a href="/charts">Live Charts</a></li>
                        <li><a href="/profile">User Profile</a></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h3>Contact Us</h3>
                    <ul className="footer-contact">
                        <li><i className="bi bi-envelope-fill"></i> yajit8898@gmail.com</li>
                        <li><i className="bi bi-telephone-fill"></i> +91 70219 71478</li>
                        <li><i className="bi bi-geo-alt-fill"></i> Navi Mumbai, India</li>
                    </ul>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; 2025 TradeHub. All Rights Reserved. | <a href="/privacy" style={{ color: '#666', textDecoration: 'none' }}>Privacy Policy</a></p>
            </div>
        </footer>
    );
};

export default Footer;
