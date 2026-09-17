import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import './VisualOrrery.css';
import ObjectCard from './ObjectCard';
import OrreryMenu from './OrreryMenu';
import { createVisualOrrery } from '../../scene/visual/createVisualOrrery';
import { celestialFacts } from '../../data/celestialFacts';
import { useSceneController } from '../../hooks/useSceneController';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { useFullscreen } from '../../hooks/useFullscreen';
import { useMusicPlaylist } from '../../hooks/useMusicPlaylist';

import starsInOurEyes from '../../assets/music/Stars in Our Eyes.mp3';
import someSand from '../../assets/music/Some Sand.mp3';
import whispersOfTheStars from '../../assets/music/Whispers of the Stars.mp3';

const playlist = [someSand, starsInOurEyes, whispersOfTheStars];
// FPS meter in development, or in production with ?stats in the URL.
const showStats = import.meta.env.DEV || new URLSearchParams(window.location.search).has('stats');

function VisualOrrery({ onLoadProgress, onLoaded }) {
  const containerRef = useRef(null);
  const [selectedKey, setSelectedKey] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [visibility, setVisibility] = useState({ showOrbits: true, showNeos: false, showNeoLabels: false });
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const { mountRef, controllerRef } = useSceneController(
    createVisualOrrery,
    { onLoadProgress, onLoaded, onSelect: setSelectedKey },
    { showStats }
  );
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);
  const { audioProps, isMuted, toggleMute } = useMusicPlaylist(playlist);

  useEffect(() => controllerRef.current?.setVisibility(visibility), [controllerRef, visibility]);
  useEffect(() => controllerRef.current?.setTimeSpeed(timeSpeed), [controllerRef, timeSpeed]);
  useEffect(() => controllerRef.current?.setPaused(isPaused), [controllerRef, isPaused]);

  useKeyboardShortcuts((key) => {
    if (key === 'r') controllerRef.current?.resetCamera();
  });

  return (
    <div className={`orrery-container ${isFullscreen ? 'fullscreen' : ''}`} ref={containerRef}>
      <div style={{ width: '100%', height: '100%' }} ref={mountRef}></div>
      <audio {...audioProps} />

      {selectedKey && celestialFacts[selectedKey] && (
        <ObjectCard objectData={celestialFacts[selectedKey]} onClose={() => setSelectedKey(null)} />
      )}

      <button
        type="button"
        className={`menu-toggle ${isMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        aria-label={isMenuOpen ? 'Close controls' : 'Open controls'}
        aria-expanded={isMenuOpen}
      >
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </button>

      {isMenuOpen && (
        <OrreryMenu
          visibility={visibility}
          onVisibilityChange={setVisibility}
          timeSpeed={timeSpeed}
          onTimeSpeedChange={setTimeSpeed}
          isPaused={isPaused}
          onPausedChange={setIsPaused}
        />
      )}

      <button
        type="button"
        className="fullscreen-button"
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
      >
        {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
      </button>

      <div className="controls-text">
        <p>Press 'R' to reset the camera.</p>
        <p>Double click on a celestial object to select/track it and view details.</p>
        <p>Control Menu is on Top Right.</p>
        <button type="button" className="mute-button" onClick={toggleMute}>
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>
    </div>
  );
}

export default VisualOrrery;
