import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/home/Hero';
import Capabilities from '../components/home/Capabilities';
import MomentsTimeline from '../components/home/MomentsTimeline';
import AboutData from '../components/home/AboutData';
import Footer from '../components/Footer';
import './Home.css';

function Home() {
  return (
    <>
      <Navbar />
      <main className="home">
        <Hero />
        <Capabilities />
        <MomentsTimeline />
        <AboutData />
      </main>
      <Footer />
    </>
  );
}

export default Home;
