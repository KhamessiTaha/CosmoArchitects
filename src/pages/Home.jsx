import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Footer from '../components/Footer';
import About from '../components/About';

function Home() {
  const navigate = useNavigate();

  
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
      <About />
      <Footer />
    </div>
  );
}

export default Home;
