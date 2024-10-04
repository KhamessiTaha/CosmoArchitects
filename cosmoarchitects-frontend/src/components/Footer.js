import React from 'react';
import { FaGithub, FaTwitter, FaLinkedin } from 'react-icons/fa'; // Importing icons
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>© 2024 CosmoArchitects. All Rights Reserved.</p>
        <div className="social-links">
          <a href="https://github.com/KhamessiTaha" target="_blank" rel="noopener noreferrer">
            <FaGithub className="social-icon" /> GitHub
          </a>
          <a href="https://x.com/TahaAcoustica" target="_blank" rel="noopener noreferrer">
            <FaTwitter className="social-icon" /> Twitter
          </a>
          <a href="https://www.linkedin.com/in/taha-khamessi-396aba1a3/" target="_blank" rel="noopener noreferrer">
            <FaLinkedin className="social-icon" /> LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
