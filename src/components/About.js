import React from 'react';
import './About.css';

function About() {
  return (
    <section id="about" className="about">
      <h2>About CosmicVue</h2>
      <p>
        CosmicVue is an innovative interactive orrery web application developed by 
        CosmoArchitects for the 2024 NASA Space Apps Challenge. Our mission is to 
        create a visually captivating platform that displays celestial bodies, 
        including planets, Near-Earth Asteroids (NEAs), Near-Earth Comets (NECs), 
        and Potentially Hazardous Asteroids (PHAs).
      </p>
      <p>
        Since the inception of mechanical orreries in 1713, the concept has evolved, 
        allowing us to utilize modern tools to create dynamic virtual models. 
        CosmicVue not only visualizes the positions and orbits of celestial objects 
        but also integrates real-time data from NASA, providing users with an 
        immersive educational experience.
      </p>
      <p>
        Our project aims to enhance public understanding of celestial mechanics by 
        offering interactive features such as orbit tracking, time control, and 
        customizable views. Whether you are a space enthusiast or a curious learner, 
        CosmicVue invites you to explore the wonders of our solar system.
      </p>
      <h3>Our Team</h3>
      <p>
        The CosmoArchitects team comprises passionate individuals dedicated to 
        leveraging technology and science to create impactful educational tools. 
        Our diverse backgrounds in programming, astrophysics, and design empower us 
        to bring this project to life.
      </p>
      <h3>Get Involved</h3>
      <p>
        We welcome contributions and collaboration from anyone interested in furthering 
        the project. If you have suggestions, want to report issues, or wish to 
        contribute, here's the <a href="https://github.com/KhamessiTaha/CosmoArchitects" target="_blank" rel="noopener noreferrer">GitHub repository</a>.
      </p>
    </section>
  );
}

export default About;