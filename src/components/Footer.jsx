import React from 'react';
import { FaGithub, FaXTwitter, FaLinkedin } from 'react-icons/fa6';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <p className="footer-name display">CosmicVue</p>
      <p className="footer-note">© 2024–2026 CosmoArchitects. Orbital data from NASA JPL.</p>
      <ul className="footer-links">
        <li>
          <a href="https://github.com/KhamessiTaha/CosmoArchitects" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <FaGithub size={20} />
          </a>
        </li>
        <li>
          <a href="https://x.com/TahaAcoustica" target="_blank" rel="noopener noreferrer" aria-label="X">
            <FaXTwitter size={20} />
          </a>
        </li>
        <li>
          <a href="https://www.linkedin.com/in/taha-khamessi-396aba1a3/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <FaLinkedin size={20} />
          </a>
        </li>
      </ul>
    </footer>
  );
}

export default Footer;
