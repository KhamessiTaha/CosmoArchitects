import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import VisualOrrery from '../components/orrery/VisualOrrery';
import LoadingScreen from '../components/LoadingScreen';

function Simulation() {
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div>
      <Navbar links={[{ to: '/', label: 'Home' }, { to: '/accuratesimulation', label: 'Accurate Orrery' }]} />
      <LoadingScreen isVisible={!isLoaded} progress={progress} />
      <VisualOrrery onLoadProgress={setProgress} onLoaded={() => setIsLoaded(true)} />
    </div>
  );
}

export default Simulation;
