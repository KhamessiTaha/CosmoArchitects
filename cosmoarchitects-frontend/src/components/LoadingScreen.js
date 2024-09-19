import React, { useState, useEffect } from 'react';
import './LoadingScreen.css'; // For styling the loading screen

function LoadingScreen({ progress }) {
  return (
    <div className="loading-screen">
      <div className="loading-bar-container">
        <div className="loading-bar" style={{ width: `${progress}%` }}></div>
      </div>
      <p>Loading {progress}%</p>
    </div>
  );
}

export default LoadingScreen;
