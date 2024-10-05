import React, { useEffect, useRef } from 'react';
import './Hero.css';

const Hero = ({ handleNavigateRelative, handleNavigateAccurate }) => {
  const canvasRef = useRef(null);
  const [isExploring, setIsExploring] = React.useState(false);

  const handleStartExploring = () => {
    setIsExploring(true);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const particles = [];
    const mouse = { x: null, y: null, radius: 150 };

   
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const createParticles = () => {
      for (let i = 0; i < 1000; i++) {
        const size = Math.random() * 0.1 + 1;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const dx = (Math.random() - 0.5) * 2;
        const dy = (Math.random() - 0.5) * 2;
        particles.push({ x, y, dx, dy, size });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.closePath();
      });
    };

    const updateParticles = () => {
      particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x + p.size > canvas.width || p.x - p.size < 0) p.dx = -p.dx;
        if (p.y + p.size > canvas.height || p.y - p.size < 0) p.dy = -p.dy;

        const dist = Math.hypot(mouse.x - p.x, mouse.y - p.y);
        if (dist < mouse.radius) {
          const angle = Math.atan2(p.y - mouse.y, p.x - mouse.x);
          p.dx = Math.cos(angle);
          p.dy = Math.sin(angle);
        }
      });
    };

    const animate = () => {
      drawParticles();
      updateParticles();
      requestAnimationFrame(animate);
    };

    const handleMouseMove = e => {
      mouse.x = e.x;
      mouse.y = e.y;
    };
    window.addEventListener('mousemove', handleMouseMove);

    createParticles();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section className="hero-section">
      <canvas ref={canvasRef} className="background-canvas"></canvas>
      <div className="hero-content">
        <h1 className="hero-title">Welcome to the Orrery Simulation</h1>
        <h1 className="hero-title">CosmicVue</h1>
        <p className="hero-description">Explore the wonders of the solar system!</p>

        {!isExploring ? (
          <button className="start-btn" onClick={handleStartExploring}>
            Start Exploring
          </button>
        ) : (
          <div className="cards-container">
            <div className="card">
              <button className="choice-btn relative-btn" onClick={handleNavigateRelative}>
                Visual Orrery
              </button>
              <p className="choice-description">
              A scaled-down, dynamic orrery that showcases a visually captivating simulation of planets with their atmospheres, along with asteroids depicted in red orbits and comets in grey orbits. The orrery features time control, options to show or hide orbits, and the ability to display or hide Near-Earth Objects (NEOs). Scaled-down distances enhance navigation and control, making exploration intuitive and engaging.
              </p>
            </div>
            <div className="card">
              <button className="choice-btn accurate-btn" onClick={handleNavigateAccurate}>
                Accurate Orrery
              </button>
              <p className="choice-description">
              A dynamic orrery that accurately represents the solar system with precise sizes and distances. It features planetary orbits calculated using Keplerian parameters and highlights Near-Earth Objects (NEOs) from the NASA Horizons API, focusing on those in the Apollo orbit class for an insightful exploration of our cosmic neighborhood.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
