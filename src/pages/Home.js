import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Footer from '../components/Footer';
import BackToTop from '../components/BackToTop';

function Home() {
  const navigate = useNavigate();

  // Handlers for navigation
  const handleNavigateRelative = () => {
    navigate('/simulation');
  };

  const handleNavigateAccurate = () => {
    navigate('/accuratesimulation');
  };

  return (
    <div>
      <Navbar />
      <Hero 
        handleNavigateRelative={handleNavigateRelative} 
        handleNavigateAccurate={handleNavigateAccurate} 
      />
      <Features />
      <Footer />
      <BackToTop />
    </div>
  );
}

export default Home;
