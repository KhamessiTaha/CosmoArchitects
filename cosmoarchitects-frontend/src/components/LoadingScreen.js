// src/components/LoadingScreen.js
import React from 'react';
import './LoadingScreen.css'; // Style for the loading screen

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Loading Simulation...</p>
    </div>
  );
}

export default LoadingScreen;
