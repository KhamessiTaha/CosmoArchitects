import React from 'react';
import './LoadingScreen.css';

// Overlay shown while the explorer's textures download. `progress` is 0..1.
function LoadingScreen({ isVisible, progress = 0 }) {
  const percent = Math.round(progress * 100);

  return (
    <div className={`loading-screen ${isVisible ? '' : 'hidden'}`} aria-hidden={!isVisible}>
      <div className="loading-content">
        <svg className="loading-orbit" viewBox="-50 -50 100 100" aria-hidden="true">
          <circle r="40" className="loading-path" />
          <circle r="11" className="loading-planet" />
          <g className="loading-moon">
            <circle cx="0" cy="-40" r="4" />
          </g>
        </svg>
        <p className="loading-title display">CosmicVue</p>
        <div
          className="loading-bar"
          role="progressbar"
          aria-label="Loading the explorer"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div style={{ transform: `scaleX(${progress})` }} />
        </div>
        <p className="loading-status tabular">{percent < 100 ? `Loading planet textures, ${percent}%` : 'Ready'}</p>
      </div>
    </div>
  );
}

export default LoadingScreen;
