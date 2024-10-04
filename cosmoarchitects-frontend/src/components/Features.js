import React from 'react';
import './Features.css';

function Features() {
  return (
    <section id="features" className="features">
      <h2>Key Features</h2>
      <div className="feature-cards">
        <div className="card">
          <h3>Interactive Solar System</h3>
          <p>Explore planets and their orbits in real time.</p>
        </div>
        <div className="card">
          <h3>Track Near-Earth Objects</h3>
          <p>Monitor asteroids and comets with live data from NASA.</p>
        </div>
        <div className="card">
          <h3>Control Time and Speed</h3>
          <p>Adjust the timeline and speed to view celestial movements.</p>
        </div> 
        <div className="card">
          <h3>Control Time and Speed</h3>
          <p>Adjust the timeline and speed to view celestial movements.</p>
        </div>
      </div>
    </section>
  );
}

export default Features;
