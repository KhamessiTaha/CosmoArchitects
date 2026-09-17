import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import './Orrery.css';
import ObjectCard from './ObjectCard';
import OrreryMenu from './OrreryMenu';
import PlanetBar from './PlanetBar';
import { createOrrery } from '../../scene/orrery/createOrrery';
import { SPEED_PRESETS, msFromJulianDate } from '../../lib/clock';
import { julianDateFromMs } from '../../lib/kepler';
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
const planetShortcuts = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

const neoMessages = {
  loading: () => 'Loading live NEOs from NASA...',
  ready: (count) => `${count} live NEOs from NASA NeoWs`,
  error: () => 'Could not reach NASA NeoWs right now.',
};

// Starting configuration per entry point: the visual view animates fast; true scale starts slower.
const initialSettings = {
  visual: { speedIndex: 4, visibility: { orbits: true, planetLabels: true, smallBodies: false, smallBodyLabels: false, liveNeos: false } },
  true: { speedIndex: 3, visibility: { orbits: true, planetLabels: true, smallBodies: false, smallBodyLabels: false, liveNeos: true } },
};

function Orrery({ initialScale = 'visual', onLoadProgress, onLoaded }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(initialScale);
  const [visibility, setVisibility] = useState(initialSettings[initialScale].visibility);
  const [speedIndex, setSpeedIndex] = useState(initialSettings[initialScale].speedIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selection, setSelection] = useState(null);
  const [time, setTime] = useState(null);
  const [neoStatus, setNeoStatus] = useState(null);

  const { mountRef, controllerRef } = useSceneController(
    createOrrery,
    { onLoadProgress, onLoaded, onTime: setTime, onSelect: setSelection, onNeoStatus: setNeoStatus },
    { initialScale, speedIndex: initialSettings[initialScale].speedIndex, showStats }
  );
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);
  const { audioProps, isMuted, toggleMute } = useMusicPlaylist(playlist);

  useEffect(() => controllerRef.current?.setScale(scale), [controllerRef, scale]);
  useEffect(() => controllerRef.current?.setVisibility(visibility), [controllerRef, visibility]);
  useEffect(() => controllerRef.current?.setSpeedIndex(speedIndex), [controllerRef, speedIndex]);
  useEffect(() => controllerRef.current?.setPaused(isPaused), [controllerRef, isPaused]);

  const changeSpeed = (index) => setSpeedIndex(Math.max(0, Math.min(SPEED_PRESETS.length - 1, index)));
  const goToNow = () => controllerRef.current?.setJulianDate(julianDateFromMs(Date.now()));

  useKeyboardShortcuts((key) => {
    const controller = controllerRef.current;
    if (!controller) return;
    if (/^[0-9]$/.test(key)) controller.focus(planetShortcuts[Number(key)]);
    else if (key === 'r') controller.resetCamera();
    else if (key === 'v') setScale((current) => (current === 'visual' ? 'true' : 'visual'));
    else if (key === 'p') setIsPaused((paused) => !paused);
    else if (key === 'l') setVisibility((current) => ({ ...current, planetLabels: !current.planetLabels }));
    else if (key === '[') setSpeedIndex((index) => Math.max(0, index - 1));
    else if (key === ']') setSpeedIndex((index) => Math.min(SPEED_PRESETS.length - 1, index + 1));
    else if (key === 'escape') controller.clearSelection();
  });

  const isLive = speedIndex === 0 && !isPaused && time !== null && Math.abs(time.offsetFromNowMs) < 120000;

  return (
    <div className={`orrery-container ${isFullscreen ? 'fullscreen' : ''}`} ref={containerRef}>
      <div style={{ width: '100%', height: '100%' }} ref={mountRef}></div>
      <audio {...audioProps} />

      {selection?.facts && <ObjectCard objectData={selection.facts} onClose={() => controllerRef.current?.clearSelection()} />}

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
          scale={scale}
          onScaleChange={setScale}
          visibility={visibility}
          onVisibilityChange={setVisibility}
          speedIndex={speedIndex}
          onSpeedIndexChange={changeSpeed}
          isPaused={isPaused}
          onPausedChange={setIsPaused}
          onNow={goToNow}
        />
      )}

      <div className="status-panel" aria-live="polite">
        <p className="sim-date">{time ? dateFormat.format(new Date(msFromJulianDate(time.jd))) : ' '}</p>
        <p className="muted">
          {isLive ? 'Live' : isPaused ? 'Paused' : SPEED_PRESETS[speedIndex].label} · {scale === 'true' ? 'True scale' : 'Visual scale'}
        </p>
        {visibility.liveNeos && neoStatus && neoMessages[neoStatus.state] && <p className="muted">{neoMessages[neoStatus.state](neoStatus.count)}</p>}
        <p className="muted">Click a body to fly to it · R reset · V scale · P pause · [ ] speed</p>
        <button type="button" className="mute-button" onClick={toggleMute}>
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>

      <PlanetBar selectedKey={selection?.key} onSelect={(key) => controllerRef.current?.focus(key)} />

      <button
        type="button"
        className="fullscreen-button"
        onClick={toggleFullscreen}
        aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
      >
        {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
      </button>
    </div>
  );
}

export default Orrery;
