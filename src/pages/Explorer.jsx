import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Orrery from '../components/orrery/Orrery';
import LoadingScreen from '../components/LoadingScreen';

// `?scale=true` or `?scale=visual` overrides the route's default starting scale.
function Explorer({ defaultScale = 'visual' }) {
  const [searchParams] = useSearchParams();
  const requested = searchParams.get('scale');
  const initialScale = requested === 'true' || requested === 'visual' ? requested : defaultScale;
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <div>
      <Navbar links={[{ to: '/', label: 'Home' }, { to: '/explore', label: 'Explore' }]} />
      <LoadingScreen isVisible={!isLoaded} progress={progress} />
      <Orrery key={initialScale} initialScale={initialScale} onLoadProgress={setProgress} onLoaded={() => setIsLoaded(true)} />
    </div>
  );
}

export default Explorer;
