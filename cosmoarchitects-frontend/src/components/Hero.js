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

    // Resize canvas to fill window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const createParticles = () => {
      for (let i = 0; i < 150; i++) {
        const size = Math.random() * 2 + 1;
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
        <p className="hero-description">Explore the wonders of the solar system!</p>

        {!isExploring ? (
          <button className="start-btn" onClick={handleStartExploring}>
            Start Exploring
          </button>
        ) : (
          <div className="cards-container">
            <div className="card">
              <button className="choice-btn relative-btn" onClick={handleNavigateRelative}>
                Relative Orrery
              </button>
              <p className="choice-description">
                A dynamic orrery of the solar system showcasing beautiful animations of the planets with their atmospheres, using scaled-down distances for easier navigation and control.
              </p>
            </div>
            <div className="card">
              <button className="choice-btn accurate-btn" onClick={handleNavigateAccurate}>
                Accurate Orrery
              </button>
              <p className="choice-description">
                A scene with accurate sizes, distances, and orbits created using real Keplerian data for a scientific representation of the solar system.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Hero;
