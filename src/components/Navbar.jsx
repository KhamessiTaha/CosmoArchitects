import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './Navbar.css';
import PatchMark from './PatchMark';

const homeLinks = [
  { href: '/#moments', label: 'Moments' },
  { href: '/#about', label: 'About' },
];

// `variant="overlay"` floats over the explorer's 3D view; the default sits on content pages.
function Navbar({ variant = 'page', links = homeLinks, showExploreButton = true }) {
  const [isOpen, setIsOpen] = useState(false);
  const close = () => setIsOpen(false);
  const hasNavigation = links.length > 0 || showExploreButton;

  return (
    <header className={`navbar navbar-${variant}`}>
      <Link to="/" className="wordmark" onClick={close} aria-label="CosmicVue home">
        <PatchMark size={24} />
        <span className="display">CosmicVue</span>
      </Link>

      {hasNavigation && (
        <>
          <button
            type="button"
            className="icon-button nav-toggle"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={isOpen}
            aria-controls="site-nav"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <nav id="site-nav" className={`nav-links ${isOpen ? 'open' : ''}`} aria-label="Main">
            {links.map(({ to, href, label }) =>
              to ? (
                <NavLink key={label} to={to} onClick={close} end>
                  {label}
                </NavLink>
              ) : (
                <a key={label} href={href} onClick={close}>
                  {label}
                </a>
              )
            )}
            {showExploreButton && (
              <Link to="/explore" className="button button-primary" onClick={close}>
                Open the explorer
              </Link>
            )}
          </nav>
        </>
      )}
    </header>
  );
}

export default Navbar;
