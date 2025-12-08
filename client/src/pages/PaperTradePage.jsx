import React from 'react';
import PaperTradeApp from '../components/Trading/PaperTradeApp';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PaperTradePage = () => {
  return (
    <>
      <Navbar />
      {/* 
         Removed the inline styles for background and color.
         The PaperTradeApp component now handles the layout via PaperTrade.css
         which applies the global premium dark theme automatically.
      */}
      <PaperTradeApp />
      <Footer />
    </>
  );
};

export default PaperTradePage;