import React, { useState, useEffect } from 'react';
import './LoadingScreen.css'; 

function LoadingScreen({ isVisible }) {
  const [progress, setProgress] = useState(0);
  const [buffer, setBuffer] = useState(0);
  const [message, setMessage] = useState('Loading Orrery Simulation...');

  useEffect(() => {
    
    const intervalId = setInterval(() => {
      if (progress < 100) {
        setProgress((prev) => prev + 1);
        setBuffer((prev) => Math.max(prev, progress + Math.random() * 10));
        setMessage('Preparing celestial bodies...');
      } 
      else {
        clearInterval(intervalId);
        setMessage('Simulation ready to explore!');
      }
    }, 100); 

    return () => clearInterval(intervalId);
  }, [progress]);
  if (!isVisible) return null;
  return (
    <div className="loading-screen">
      <div className="loading-container">
        <h1 className="loading-title">{message}</h1>
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div className="progress" style={{ width: `${progress}%` }} />
            <div className="buffer" style={{ width: `${buffer}%` }} />
          </div>
          <div className="progress-percentage">{progress}%</div>
        </div>
        <div className="loading-animation">
          <div className="loading-spinner"></div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
