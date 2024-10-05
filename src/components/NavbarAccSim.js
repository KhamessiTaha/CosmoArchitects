import React, { useState } from 'react';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';
import logo from '../assets/logo.png'; 

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <img src={logo} alt="CosmicVue Logo" className="logo-img" />
        <h1>CosmicVue</h1>
      </div>
      <div className="hamburger" onClick={toggleMenu}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </div>
      <ul className={isOpen ? 'nav-links active' : 'nav-links'}>
        <li><a href="/">Home</a></li>
        <li><a href="/simulation">Visual Orrery</a></li>
        
      </ul>
    </nav>
  );
}

export default Navbar;
