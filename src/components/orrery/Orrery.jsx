import React, { useEffect, useRef, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import './Orrery.css';
import ObjectCard from './ObjectCard';
import ControlsDrawer from './ControlsDrawer';
import TimeDock from './TimeDock';
import PlanetBar from './PlanetBar';
import SearchBox from './SearchBox';
import { createOrrery } from '../../scene/orrery/createOrrery';
import { SPEED_PRESETS, speedIndexById } from '../../lib/clock';
import { julianDateFromMs } from '../../lib/kepler';
import { serializeViewState } from '../../lib/viewState';
import { moments } from '../../data/moments';
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

const neoMessages = {
  loading: () => 'Loading live NEOs from NASA',
  ready: (count) => `${count} live NEOs`,
  error: () => 'NASA NeoWs is unreachable; live NEOs are unavailable',
};

// Starting configuration per scale: the visual view animates fast; true scale starts slower.
const defaults = {
  visual: { speedIndex: 4, visibility: { orbits: true, planetLabels: true, smallBodies: false, smallBodyLabels: false, liveNeos: false } },
  true: { speedIndex: 3, visibility: { orbits: true, planetLabels: true, smallBodies: false, smallBodyLabels: false, liveNeos: true } },
};

// Layers a body needs to be visible when it's searched for or deep-linked.
const layersFor = (kind) => (kind === 'neo' ? { liveNeos: true } : kind === 'asteroid' || kind === 'comet' ? { smallBodies: true } : {});

// Resolves the starting view from the URL: a moment wins over individual parameters.
function resolveInitialView(initialView) {
  const moment = moments.find((m) => m.id === initialView.moment);
  if (moment) {
    return {
      scale: moment.scale,
      jd: julianDateFromMs(Date.parse(moment.start)),
      speedIndex: speedIndexById(moment.speed),
      paused: false,
      focus: moment.focus,
      viewRadii: moment.viewRadii,
      visibility: { ...defaults[moment.scale].visibility, ...moment.show },
      moment,
    };
  }
  const scale = initialView.scale || 'visual';
  const focusIsSmallBody = initialView.focus && !majorBodies.has(initialView.focus);
  return {
    scale,
    jd: initialView.jd,
    speedIndex: initialView.speedIndex ?? defaults[scale].speedIndex,
    paused: initialView.paused ?? false,
    focus: initialView.focus,
    visibility: { ...defaults[scale].visibility, ...(focusIsSmallBody ? { smallBodies: true } : {}) },
    moment: null,
  };
}

/**
 * initialView: { scale, focus, jd, speedIndex, paused, moment } (all optional), typically parsed from the URL.
 */
function Orrery({ initialView, onLoadProgress, onLoaded }) {
  const [initial] = useState(() => resolveInitialView(initialView));

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [scale, setScale] = useState(initial.scale);
  const [visibility, setVisibility] = useState(initial.visibility);
  const [speedIndex, setSpeedIndex] = useState(initial.speedIndex);
  const [isPaused, setIsPaused] = useState(initial.paused);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selection, setSelection] = useState(null);
  const [time, setTime] = useState(null);
  const [neoStatus, setNeoStatus] = useState(null);
  const [activeMoment, setActiveMoment] = useState(initial.moment);
  const [shareStatus, setShareStatus] = useState(null);

  const { mountRef, controllerRef } = useSceneController(
    createOrrery,
    { onLoadProgress, onLoaded, onTime: setTime, onSelect: setSelection, onNeoStatus: setNeoStatus },
    { initialScale: initial.scale, initialJd: initial.jd, speedIndex: initial.speedIndex, paused: initial.paused, showStats }
  );
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);
  const { audioProps, isMuted, toggleMute } = useMusicPlaylist(playlist);

  // Deep-linked or moment focus, applied once the scene exists.
  useEffect(() => {
    if (initial.focus) controllerRef.current?.focus(initial.focus, initial.viewRadii ? { viewRadii: initial.viewRadii } : {});
  }, [controllerRef, initial]);

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
    setIsDrawerOpen(false);
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
      if (isDrawerOpen) setIsDrawerOpen(false);
      else scene.clearSelection();
      setShareStatus(null);
    }
  });

  const neoMessage = visibility.liveNeos && neoStatus && neoMessages[neoStatus.state] ? neoMessages[neoStatus.state](neoStatus.count) : null;

  return (
    <div className={`explorer ${isFullscreen ? 'fullscreen' : ''}`} ref={containerRef}>
      <div className="explorer-canvas" ref={mountRef}></div>
      <audio {...audioProps} />

      <SearchBox getEntries={() => controller()?.getSearchEntries() ?? []} onSelect={focusBody} inputRef={searchInputRef} />

      <button
        type="button"
        className={`button controls-button ${isDrawerOpen ? 'is-open' : ''}`}
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        aria-expanded={isDrawerOpen}
      >
        <SlidersHorizontal size={16} aria-hidden="true" />
        Controls
      </button>

      {selection?.facts && <ObjectCard objectData={selection.facts} onClose={() => controller()?.clearSelection()} />}

      {activeMoment && (
        <div className="moment-banner panel" role="status">
          <div>
            <h2>{activeMoment.title}</h2>
            <p>{activeMoment.description}</p>
          </div>
          <button type="button" className="icon-button" aria-label="Dismiss" onClick={() => setActiveMoment(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {isDrawerOpen && time && (
        <ControlsDrawer
          jd={time.jd}
          scale={scale}
          onScaleChange={setScale}
          visibility={visibility}
          onVisibilityChange={setVisibility}
          onJump={jumpTo}
          onMoment={playMoment}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}

      <div className="explorer-bottom">
        <PlanetBar selectedKey={selection?.key} onSelect={(key) => controller()?.focus(key)} />
        <TimeDock
          time={time}
          speedIndex={speedIndex}
          onSpeedIndexChange={changeSpeed}
          isPaused={isPaused}
          onPausedChange={setIsPaused}
          onJump={jumpTo}
          onNow={goToNow}
          scale={scale}
          neoMessage={neoMessage}
          onShare={shareView}
          shareStatus={shareStatus}
          onDismissShare={() => setShareStatus(null)}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
        />
      </div>
    </div>
  );
}

export default Orrery;
