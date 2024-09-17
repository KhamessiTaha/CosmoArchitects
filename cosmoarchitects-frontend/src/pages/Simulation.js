import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Orrery from '../components/Orrery';
import Menu from '../components/Menu'; // Import the menu component

function Simulation() {
  // State for controlling the speed and orbit visibility
  const [showOrbits, setShowOrbits] = useState(true);
  const [speed, setSpeed] = useState(0.001);

  return (
    <div>
      <Navbar />
      {/* Orrery simulation with menu controls */}
      <Orrery showOrbits={showOrbits} speed={speed} />
      <Menu showOrbits={showOrbits} setShowOrbits={setShowOrbits} speed={speed} setSpeed={setSpeed} />
    </div>
  );
}

export default Simulation;