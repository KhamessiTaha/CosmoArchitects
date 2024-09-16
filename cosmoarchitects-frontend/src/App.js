import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import BackToTop from './components/BackToTop';
import './App.css';

function App() {
  return (
    <div className="App">
      <Navbar />
      <Hero />
      <Features />
      <Footer />
      <BackToTop />
    </div>
  );
}

export default App;
