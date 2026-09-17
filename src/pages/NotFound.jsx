import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Home.css';

function NotFound() {
  return (
    <>
      <Navbar />
      <main className="home">
        <section className="section not-found" aria-labelledby="not-found-title">
          <h1 id="not-found-title" className="section-title display">
            This page doesn't exist
          </h1>
          <p className="section-lede">The link may be mistyped or out of date. Everything in CosmicVue starts from the explorer.</p>
          <div className="hero-actions">
            <Link to="/explore" className="button button-primary button-large">
              Open the explorer
            </Link>
            <Link to="/" className="text-link">
              Go to the home page
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default NotFound;
