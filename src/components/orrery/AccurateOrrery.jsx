import React, { useEffect, useState } from 'react';
import './VisualOrrery.css';
import './AccurateOrrery.css';
import { createAccurateOrrery } from '../../scene/accurate/createAccurateOrrery';
import { useSceneController } from '../../hooks/useSceneController';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

const neoMessages = {
  loading: () => 'Loading near-Earth objects from NASA...',
  ready: (count) => `${count} near-Earth objects (red) from NASA NeoWs`,
  error: () => 'Could not load near-Earth objects from NASA right now.',
};

function AccurateOrrery({ onLoadProgress, onLoaded }) {
  const [focusedPlanet, setFocusedPlanet] = useState(null);
  const [neoStatus, setNeoStatus] = useState({ state: 'loading', count: 0 });
  const [now, setNow] = useState(() => new Date());

  const { mountRef, controllerRef } = useSceneController(createAccurateOrrery, {
    onLoadProgress,
    onLoaded,
    onFocusChange: setFocusedPlanet,
    onNeoStatus: setNeoStatus,
  });

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useKeyboardShortcuts((key) => {
    const controller = controllerRef.current;
    if (!controller) return;
    const index = parseInt(key, 10) - 1;
    if (index >= 0 && index < controller.planetNames.length) controller.focusPlanet(index);
    else if (key === 'l') controller.toggleLabels();
    else if (key === 'r') controller.resetCamera();
  });

  return (
    <div className="orrery-container">
      <div ref={mountRef}></div>
      <div className="controls-info">
        <p>Press 1-8 to focus on planets (1: Mercury, 2: Venus, ..., 8: Neptune)</p>
        <p>Press 'L' to toggle labels, 'R' to reset camera</p>
        <p>{neoMessages[neoStatus.state](neoStatus.count)}</p>
      </div>
      <div className="focused-planet-info">
        <div>{focusedPlanet ? `Focused on: ${focusedPlanet}` : 'Viewing entire solar system'}</div>
        <div>Positions for {now.toLocaleString()}</div>
      </div>
    </div>
  );
}

export default AccurateOrrery;
