import React, { useState, useEffect } from 'react';
import NavbarAccSim from '../components/NavbarAccSim';
import AccurateOrrery from '../components/AccurateOrrery';
import LoadingScreen from '../components/LoadingScreen';

function AccurateSimulation() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 3000); 

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div>
      <NavbarAccSim />
      <LoadingScreen isVisible={isLoading} />
      {!isLoading && (
        <div>
          <AccurateOrrery />
        </div>
      )}
    </div>
  );
}

export default AccurateSimulation;