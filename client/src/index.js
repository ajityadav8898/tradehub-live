import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext'; 

// 🎯 FIX: Global GSAP Registration
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Make sure to remove this line from HomePage.jsx after adding it here!
// import { gsap } from 'gsap'; 
// import { ScrollTrigger } from 'gsap/ScrollTrigger'; 
// gsap.registerPlugin(ScrollTrigger); 

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);