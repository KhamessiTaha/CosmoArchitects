import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';
import logo from '../assets/logo.png';

const homeLinks = [
  { to: '/', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '#about', label: 'About' },
];

// `links` entries use `to` for app routes (no full page reload) or `href` for in-page anchors.
function Navbar({ links = homeLinks }) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);

  return (
    <nav className="navbar">
      <Link to="/" className="logo" onClick={close}>
        <img src={logo} alt="CosmicVue Logo" className="logo-img" />
        <h1>CosmicVue</h1>
      </Link>
      <button
        type="button"
        className="hamburger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>
      <ul className={isOpen ? 'nav-links active' : 'nav-links'}>
        {links.map(({ to, href, label }) => (
          <li key={label}>
            {to ? (
              <Link to={to} onClick={close}>{label}</Link>
            ) : (
              <a href={href} onClick={close}>{label}</a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default Navbar;
