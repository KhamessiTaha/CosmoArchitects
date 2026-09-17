import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Orrery from '../components/orrery/Orrery';
import LoadingScreen from '../components/LoadingScreen';
import { parseViewState } from '../lib/viewState';

// Reads the shareable view (?focus=&date=&scale=&speed=&paused=&moment=) once on entry;
// the orrery keeps the URL in sync afterwards.
function Explorer({ defaultScale = 'visual' }) {
  const [initialView] = useState(() => ({ scale: defaultScale, ...parseViewState(window.location.search) }));
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      <Navbar variant="overlay" links={[]} showExploreButton={false} />
      <LoadingScreen isVisible={!isLoaded} progress={progress} />
      <main>
        <h1 className="visually-hidden">CosmicVue explorer</h1>
        <Orrery initialView={initialView} onLoadProgress={setProgress} onLoaded={() => setIsLoaded(true)} />
      </main>
    </>
  );
}

export default Explorer;
