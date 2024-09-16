import React from 'react';
import { motion } from 'framer-motion';
import './Hero.css';

function Hero() {
  return (
    <motion.section
      className="hero"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="hero-content">
        <h1>Explore the Universe</h1>
        <p>Welcome to the Orrery, your interactive journey through the stars.</p>
        <button className="cta-button">Start Exploring</button>
      </div>
    </motion.section>
  );
}

export default Hero;
