import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Footer from '../components/Footer';
import BackToTop from '../components/BackToTop';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const handleStartExploring = () => {
    navigate('/simulation');
  };

  return (
    <div>
      <Navbar />
      <Hero handleStartExploring={handleStartExploring} />
      <Features />
      <Footer />
      <BackToTop />
    </div>
  );
}

export default Home;
