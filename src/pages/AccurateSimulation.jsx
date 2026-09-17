import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import AccurateOrrery from '../components/orrery/AccurateOrrery';
import LoadingScreen from '../components/LoadingScreen';

function AccurateSimulation() {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div>
      <Navbar links={[{ to: '/', label: 'Home' }, { to: '/simulation', label: 'Visual Orrery' }]} />
      <LoadingScreen isVisible={!isLoaded} progress={progress} />
      <AccurateOrrery onLoadProgress={setProgress} onLoaded={() => setIsLoaded(true)} />
    </div>
  );
}

export default AccurateSimulation;
