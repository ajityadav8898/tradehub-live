import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
// --- REMOVED: import { FaUserCircle, FaSignOutAlt, FaTachometerAlt } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';

// Dropdown Menu Variants for Framer Motion (Remains the same)
const dropdownVariants = {
    hidden: { opacity: 0, y: -20, scaleY: 0.8 },
    visible: { opacity: 1, y: 0, scaleY: 1 },
    exit: { opacity: 0, y: -20, scaleY: 0.8 }
};

const ProfileDropdown = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null); 

    // --- Removed the shuffling logic to simplify ---
    
    // Implement Click-Outside-to-Close logic (Remains the same)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const username = user?.username || "Dashboard"; 

    const handleDashboardClick = (e) => {
        e.preventDefault(); 
        setIsOpen(false);
        navigate("/dashboard");
    };

    return (
        <div className="profile-dropdown-container" ref={dropdownRef}>
            <button 
                className="profile-icon-button" 
                onClick={() => setIsOpen(!isOpen)}
            >
                {/* ✅ FIX: Use Bootstrap Icon directly instead of React Component */}
                <i className="bi bi-person-circle" style={{ fontSize: '24px', color: '#0adfaa' }}></i>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        className="dropdown-menu"
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <div className="username-display">
                            <span>Welcome,</span>
                            <strong>{user?.username || "Trader"}</strong>
                        </div>
                        
                        <a href="#" onClick={handleDashboardClick} className="dropdown-item">
                            <i className="bi bi-speedometer2"></i> Dashboard
                        </a>

                        <button 
                            onClick={logout} 
                            className="dropdown-item logout-btn"
                        >
                            <i className="bi bi-box-arrow-right"></i> Log Out
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileDropdown;