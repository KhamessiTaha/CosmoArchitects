import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, Link2, X } from 'lucide-react';
import './Orrery.css';
import ObjectCard from './ObjectCard';
import OrreryMenu from './OrreryMenu';
import PlanetBar from './PlanetBar';
import SearchBox from './SearchBox';
import { createOrrery } from '../../scene/orrery/createOrrery';
import { ACCURATE_YEARS, SPEED_PRESETS, msFromJulianDate, speedIndexById, yearFromJulianDate } from '../../lib/clock';
import { julianDateFromMs } from '../../lib/kepler';
import { serializeViewState } from '../../lib/viewState';
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
const majorBodies = new Set(planetShortcuts.concat('moon'));

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

const neoMessages = {
  loading: () => 'Loading live NEOs from NASA...',
  ready: (count) => `${count} live NEOs from NASA NeoWs`,
  error: () => 'Could not reach NASA NeoWs right now.',
};

// Starting configuration per scale: the visual view animates fast; true scale starts slower.
const defaults = {
  visual: { speedIndex: 4, visibility: { orbits: true, planetLabels: true, smallBodies: false, smallBodyLabels: false, liveNeos: false } },
  true: { speedIndex: 3, visibility: { orbits: true, planetLabels: true, smallBodies: false, smallBodyLabels: false, liveNeos: true } },
};

// Layers a body needs to be visible when it's searched for or deep-linked.
const layersFor = (kind) => (kind === 'neo' ? { liveNeos: true } : kind === 'asteroid' || kind === 'comet' ? { smallBodies: true } : {});

/**
 * initialView: { scale, focus, jd, speedIndex, paused } (all optional), typically parsed from the URL.
 */
function Orrery({ initialView, onLoadProgress, onLoaded }) {
  const [initial] = useState(() => {
    const scale = initialView.scale || 'visual';
    const focusIsSmallBody = initialView.focus && !majorBodies.has(initialView.focus);
    return {
      scale,
      speedIndex: initialView.speedIndex ?? defaults[scale].speedIndex,
      paused: initialView.paused ?? false,
      visibility: { ...defaults[scale].visibility, ...(focusIsSmallBody ? { smallBodies: true } : {}) },
    };
  });

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [scale, setScale] = useState(initial.scale);
  const [visibility, setVisibility] = useState(initial.visibility);
  const [speedIndex, setSpeedIndex] = useState(initial.speedIndex);
  const [isPaused, setIsPaused] = useState(initial.paused);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selection, setSelection] = useState(null);
  const [time, setTime] = useState(null);
  const [neoStatus, setNeoStatus] = useState(null);
  const [activeMoment, setActiveMoment] = useState(null);
  const [shareStatus, setShareStatus] = useState(null);

  const { mountRef, controllerRef } = useSceneController(
    createOrrery,
    { onLoadProgress, onLoaded, onTime: setTime, onSelect: setSelection, onNeoStatus: setNeoStatus },
    { initialScale: initial.scale, initialJd: initialView.jd, speedIndex: initial.speedIndex, paused: initial.paused, showStats }
  );
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);
  const { audioProps, isMuted, toggleMute } = useMusicPlaylist(playlist);

  // Deep-linked focus, applied once the scene exists.
  const initialFocus = initialView.focus;
  useEffect(() => {
    if (initialFocus) controllerRef.current?.focus(initialFocus);
  }, [controllerRef, initialFocus]);

  useEffect(() => controllerRef.current?.setScale(scale), [controllerRef, scale]);
  useEffect(() => controllerRef.current?.setVisibility(visibility), [controllerRef, visibility]);
  useEffect(() => controllerRef.current?.setSpeedIndex(speedIndex), [controllerRef, speedIndex]);
  useEffect(() => controllerRef.current?.setPaused(isPaused), [controllerRef, isPaused]);

  // Keep the address bar shareable. The date is included while paused (it's stable); Share always includes it.
  const pausedMinute = isPaused && time ? Math.round(time.jd * 1440) : null;
  useEffect(() => {
    const query = serializeViewState({
      focus: selection?.key,
      scale,
      speedIndex,
      paused: isPaused,
      jd: pausedMinute === null ? undefined : pausedMinute / 1440,
    });
    // Preserve the router's history state so back/forward keep working.
    window.history.replaceState(window.history.state, '', `${window.location.pathname}?${query}`);
  }, [selection?.key, scale, speedIndex, isPaused, pausedMinute]);

  const controller = () => controllerRef.current;

  const changeSpeed = (index) => setSpeedIndex(Math.max(0, Math.min(SPEED_PRESETS.length - 1, index)));
  const jumpTo = (jd) => controller()?.setJulianDate(jd);
  const goToNow = () => {
    setActiveMoment(null);
    jumpTo(julianDateFromMs(Date.now()));
  };

  const focusBody = ({ key, kind }) => {
    setVisibility((current) => ({ ...current, ...layersFor(kind) }));
    controller()?.focus(key);
  };

  const playMoment = (moment) => {
    const scene = controller();
    if (!scene) return;
    const nextSpeed = speedIndexById(moment.speed);
    // Apply to the scene immediately (effects would lag a frame) and mirror into React state.
    scene.setScale(moment.scale);
    scene.setVisibility(moment.show);
    scene.setSpeedIndex(nextSpeed);
    scene.setPaused(false);
    setScale(moment.scale);
    setVisibility((current) => ({ ...current, ...moment.show }));
    setSpeedIndex(nextSpeed);
    setIsPaused(false);
    scene.setJulianDate(julianDateFromMs(Date.parse(moment.start)));
    scene.focus(moment.focus, { viewRadii: moment.viewRadii });
    setActiveMoment(moment);
    setIsMenuOpen(false);
  };

  const shareView = async () => {
    const query = serializeViewState({ focus: selection?.key, scale, speedIndex, paused: isPaused, jd: time?.jd });
    const url = `${window.location.origin}/explore?${query}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareStatus({ copied: true, url });
    } catch {
      // Clipboard can be unavailable (permissions, insecure context): show the link to copy by hand.
      setShareStatus({ copied: false, url });
    }
  };

  useKeyboardShortcuts((key, event) => {
    const scene = controller();
    if (!scene) return;
    if (/^[0-9]$/.test(key)) scene.focus(planetShortcuts[Number(key)]);
    else if (key === '/') {
      event.preventDefault();
      searchInputRef.current?.focus();
    } else if (key === 'r') scene.resetCamera();
    else if (key === 'v') setScale((current) => (current === 'visual' ? 'true' : 'visual'));
    else if (key === 'p') setIsPaused((paused) => !paused);
    else if (key === 'n') goToNow();
    else if (key === 'l') setVisibility((current) => ({ ...current, planetLabels: !current.planetLabels }));
    else if (key === '[') setSpeedIndex((index) => Math.max(0, index - 1));
    else if (key === ']') setSpeedIndex((index) => Math.min(SPEED_PRESETS.length - 1, index + 1));
    else if (key === 'escape') {
      scene.clearSelection();
      setShareStatus(null);
    }
  });

  const isLive = speedIndex === 0 && !isPaused && time !== null && Math.abs(time.offsetFromNowMs) < 120000;
  const year = time ? yearFromJulianDate(time.jd) : null;
  const outsideAccurateRange = year !== null && (year < ACCURATE_YEARS.from || year > ACCURATE_YEARS.to);

  return (
    <div className={`orrery-container ${isFullscreen ? 'fullscreen' : ''}`} ref={containerRef}>
      <div style={{ width: '100%', height: '100%' }} ref={mountRef}></div>
      <audio {...audioProps} />

      <SearchBox getEntries={() => controller()?.getSearchEntries() ?? []} onSelect={focusBody} inputRef={searchInputRef} />

      {selection?.facts && <ObjectCard objectData={selection.facts} onClose={() => controller()?.clearSelection()} />}

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

      {isMenuOpen && time && (
        <OrreryMenu
          scale={scale}
          onScaleChange={setScale}
          visibility={visibility}
          onVisibilityChange={setVisibility}
          time={{
            jd: time.jd,
            speedIndex,
            onSpeedIndexChange: changeSpeed,
            isPaused,
            onPausedChange: setIsPaused,
            onJump: jumpTo,
            onNow: goToNow,
            onMoment: playMoment,
          }}
        />
      )}

      {activeMoment && (
        <div className="moment-banner" role="status">
          <button type="button" className="moment-close" aria-label="Dismiss" onClick={() => setActiveMoment(null)}>
            <X size={14} />
          </button>
          <strong>{activeMoment.title}</strong>
          <p>{activeMoment.description}</p>
        </div>
      )}

      <div className="status-panel" aria-live="polite">
        <p className="sim-date">{time ? dateFormat.format(new Date(msFromJulianDate(time.jd))) : ' '}</p>
        <p className="muted">
          {isLive ? 'Live' : isPaused ? 'Paused' : SPEED_PRESETS[speedIndex].label} · {scale === 'true' ? 'True scale' : 'Visual scale'}
        </p>
        {outsideAccurateRange && <p className="muted">Approximate: outside {ACCURATE_YEARS.from}–{ACCURATE_YEARS.to}</p>}
        {visibility.liveNeos && neoStatus && neoMessages[neoStatus.state] && <p className="muted">{neoMessages[neoStatus.state](neoStatus.count)}</p>}
        <p className="muted">Click a body · / search · V scale · P pause · [ ] speed · N now</p>
        <div className="status-actions">
          <button type="button" className="mute-button" onClick={toggleMute}>
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
          <button type="button" className="mute-button" onClick={shareView}>
            <Link2 size={14} /> Share view
          </button>
        </div>
        {shareStatus && (
          <div className="share-status">
            {shareStatus.copied ? (
              <span>Link copied to clipboard</span>
            ) : (
              <input readOnly aria-label="Link to this view" value={shareStatus.url} onFocus={(event) => event.target.select()} />
            )}
            <button type="button" className="moment-close" aria-label="Dismiss" onClick={() => setShareStatus(null)}>
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      <PlanetBar selectedKey={selection?.key} onSelect={(key) => controller()?.focus(key)} />

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
