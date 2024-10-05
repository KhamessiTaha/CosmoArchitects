import React from 'react';
import './Features.css';

function Features() {
  return (
    <section id="features" className="features">
      <h2>Key Features</h2>
      <div className="feature-cards">
        <div className="card">
          <h3>Interactive 3D Visualization</h3>
          <p>View the solar system interactively with the ability to zoom, pan, and rotate.</p>
        </div>
        <div className="card">
          <h3>NASA's Celestial Body Data</h3>
          <p>Visualize the positions of planets, Near-Earth Comets (NECs), Near-Earth Asteroids (NEAs) including Potentially Hazardous Asteroids (PHAs) using NASA's Keplerian parameters and Data.</p>
        </div>
        <div className="card">
          <h3>Orbital Trajectories</h3>
          <p>Explore the colored orbital trajectories of celestial bodies, with options to enable or disable specific orbits.</p>
        </div> 
        <div className="card">
          <h3>Speed Control</h3>
          <p>Control the speed of the simulation to observe the movement of celestial bodies at different speeds.</p>
        </div>
        <div className="card">
          <h3>Select and Track Planets</h3>
          <p>Select a planet and track its movement through the solar system.</p>
        </div>
        <div className="card">
          <h3>User Engagement</h3>
          <p>Enable users to explore and manipulate the visualization interactively.</p>
        </div>
        <div className="card">
          <h3>Dual Orrery Simulations</h3>
          <p>Experience two distinct orrery simulations.</p>
        </div>
      </div>
    </section>
  );
}

export default Features;
