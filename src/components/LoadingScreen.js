import React from 'react';
import './LoadingScreen.css';

// Overlay shown while the 3D scene's assets download. `progress` is 0..1.
function LoadingScreen({ isVisible, progress = 0, message }) {
  const percent = Math.round(progress * 100);

  return (
    <div className={`loading-screen ${isVisible ? '' : 'hidden'}`} aria-hidden={!isVisible}>
      <div className="loading-container">
        <h1 className="loading-title">
          {message || (percent < 100 ? 'Preparing celestial bodies...' : 'Simulation ready to explore!')}
        </h1>
        <div className="progress-bar-container">
          <div className="progress-bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
            <div className="progress" style={{ width: `${percent}%` }} />
          </div>
          <div className="progress-percentage">{percent}%</div>
        </div>
        <div className="loading-animation">
          <div className="loading-spinner"></div>
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
