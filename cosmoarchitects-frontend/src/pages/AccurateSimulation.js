import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AccurateOrrery from '../components/AccurateOrrery';
import LoadingScreen from '../components/LoadingScreen';

function AccurateSimulation() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 3000); // Shorter loading time for testing, adjust as needed

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div>
      <Navbar />
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