import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ProfileDropdown from './ProfileDropdown';
// We assume styles.css is imported globally in index.js or App.js, but importing here ensures it's available
import '../styles/HomeSections.css';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(AuthContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isHome = location.pathname === '/';

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // --- NAVIGATION PROTECTION LOGIC ---
    useEffect(() => {
        const handleNavigationProtection = (event) => {
            if (!user) {
                const href = event.currentTarget.getAttribute('href');
                if (href && href !== '/' && !href.includes('login') && !href.includes('signup')) {
                    event.preventDefault();
                    alert("Please log in to access this feature.");
                }
            }
        };

        const navLinks = document.querySelectorAll("#nav a, .mobile-menu a");
        navLinks.forEach(link => {
            link.removeEventListener('click', handleNavigationProtection);
            link.addEventListener('click', handleNavigationProtection);
        });

        return () => {
            navLinks.forEach(link => {
                link.removeEventListener('click', handleNavigationProtection);
            });
        };
    }, [user, isMenuOpen]); // Re-run when menu opens/closes to attach listeners to mobile links

    const AuthButtonRenderer = ({ isMobile = false }) => {
        const handleLoginClick = () => navigate("/login#signin");
        const handleSignupClick = () => navigate("/login#signup");

        if (user && user.token) {
            return <ProfileDropdown />;
        } else {
            return (
                <React.Fragment>
                    <button type="button"
                        onClick={handleLoginClick}
                        className="nav-button"
                        style={{
                            color: 'black',
                            backgroundColor: '#0adfaa',
                            padding: '7px 15px',
                            borderRadius: '22px',
                            fontSize: '15px',
                            fontWeight: 'bold',
                            border: 'none',
                            cursor: 'pointer',
                            marginRight: '10px',
                            width: isMobile ? '100%' : 'auto',
                            marginBottom: isMobile ? '10px' : '0'
                        }}>
                        <i className="bi bi-person-circle"></i>&nbsp; Login
                    </button>
                    <button type="button"
                        onClick={handleSignupClick}
                        className="nav-button"
                        style={{
                            color: 'black',
                            backgroundColor: '#0adfaa',
                            padding: '7px 15px',
                            borderRadius: '22px',
                            fontSize: '15px',
                            fontWeight: 'bold',
                            border: 'none',
                            cursor: 'pointer',
                            width: isMobile ? '100%' : 'auto'
                        }}>
                        <i className="bi bi-box-arrow-right"></i>&nbsp;Sign Up
                    </button>
                </React.Fragment>
            );
        }
    };

    return (
        <div id="nav" className={!isHome ? 'solid-nav' : ''}>
            <h1>TradeHub</h1>

            {/* Desktop Menu */}
            <div className="desktop-menu">
                <a href="/">Home</a>
                <a href="/tutorials">Tutorials</a>
                <a href="/charts">Charts</a>
                <a href="/ebooks">E-Books</a>
                <a href="/paper-trade">Trade</a>
                <a href="/contact">Contact Us</a>
            </div>

            <div id="auth-buttons" className="desktop-auth">
                <AuthButtonRenderer />
            </div>

            {/* Hamburger Icon */}
            <div className="hamburger-icon" onClick={toggleMenu}>
                <i className={`bi ${isMenuOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`mobile-menu ${isMenuOpen ? 'open' : ''}`}>
                <a href="/" onClick={toggleMenu}>Home</a>
                <a href="/tutorials" onClick={toggleMenu}>Tutorials</a>
                <a href="/charts" onClick={toggleMenu}>Charts</a>
                <a href="/ebooks" onClick={toggleMenu}>E-Books</a>
                <a href="/paper-trade" onClick={toggleMenu}>Trade</a>
                <a href="/contact" onClick={toggleMenu}>Contact Us</a>
                <div className="mobile-auth">
                    <AuthButtonRenderer isMobile={true} />
                </div>
            </div>
        </div>
    );
};

export default Navbar;
