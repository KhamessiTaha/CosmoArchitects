import React from 'react';
import { Link } from 'react-router-dom';
import LineOrrery from './LineOrrery';

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <h1 id="hero-title" className="display">
          The solar system, right now.
        </h1>
        <p className="hero-lede">
          See where every planet, the Moon and over a hundred near-Earth asteroids and comets are today, calculated from NASA JPL
          orbital data. Travel to any date, switch to true scale, and fly to anything you find.
        </p>
        <div className="hero-actions">
          <Link to="/explore" className="button button-primary button-large">
            Open the explorer
          </Link>
          <Link to="/explore?moment=apophis-2029" className="text-link">
            Watch Apophis pass Earth in 2029
          </Link>
        </div>
      </div>
      <LineOrrery />
    </section>
  );
}

export default Hero;
