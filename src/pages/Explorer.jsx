import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Orrery from '../components/orrery/Orrery';
import LoadingScreen from '../components/LoadingScreen';
import { parseViewState } from '../lib/viewState';

// Reads the shareable view (?focus=&date=&scale=&speed=&paused=) once on entry; the orrery keeps the URL in sync afterwards.
function Explorer({ defaultScale = 'visual' }) {
  const [initialView] = useState(() => ({ scale: defaultScale, ...parseViewState(window.location.search) }));
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div>
      <Navbar links={[{ to: '/', label: 'Home' }, { to: '/explore', label: 'Explore' }]} />
      <LoadingScreen isVisible={!isLoaded} progress={progress} />
      <Orrery initialView={initialView} onLoadProgress={setProgress} onLoaded={() => setIsLoaded(true)} />
    </div>
  );
}

export default Explorer;
