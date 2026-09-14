import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Orrery from '../components/Orrery';
import LoadingScreen from '../components/LoadingScreen';

function Simulation() {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div>
      <Navbar links={[{ to: '/', label: 'Home' }, { to: '/accuratesimulation', label: 'Accurate Orrery' }]} />
      <LoadingScreen isVisible={!isLoaded} progress={progress} />
      <Orrery onLoadProgress={setProgress} onLoaded={() => setIsLoaded(true)} />
    </div>
  );
}

export default Simulation;
