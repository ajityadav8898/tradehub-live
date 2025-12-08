import React from "react";
import { Link } from "react-scroll";

import '../../tutorials/styles/Navbar.css'; 
const Navbar = () => {  
  return (
    <nav className="navbar">
      <h2 className="logo">📊 TradingView Guide</h2>
      <div className="nav-links">
        <div className="nav-card card-intro">
          <Link to="intro" smooth={true} duration={500}>📌 Introduction</Link>
        </div>
        <div className="nav-card card-chart">
          <Link to="chartBasics" smooth={true} duration={500}>📈 Chart Basics</Link>
        </div>
        <div className="nav-card card-tools">
          <Link to="drawingTools" smooth={true} duration={500}>✏️ Drawing Tools</Link>
        </div>
        <div className="nav-card card-indicators">
          <Link to="indicators" smooth={true} duration={500}>📊 Indicators & Scripts</Link>
        </div>
        <div className="nav-card card-customize">
          <Link to="customizingCharts" smooth={true} duration={500}>🎨 Customizing Charts</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
