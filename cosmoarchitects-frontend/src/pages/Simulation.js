import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Orrery from '../components/Orrery';
import LoadingScreen from '../components/LoadingScreen';

function Simulation() {
  const [isLoading, setIsLoading] = useState(true);
  const showOrbits = useState(true);
  const speed = useState(0.0001);

  
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 14500); 

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div>
      <Navbar />
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <div>
          <Orrery showOrbits={showOrbits} speed={speed} />
          
        </div>
      )}
    </div>
  );
}

export default Simulation;
