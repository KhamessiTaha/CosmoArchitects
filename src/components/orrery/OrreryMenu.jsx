import React from 'react';
import { Rewind, RotateCcw, FastForward, Pause, Play } from 'lucide-react';

function Toggle({ className, checked, onChange, label }) {
  return (
    <label className={className}>
      <input type="checkbox" checked={checked} onChange={() => onChange(!checked)} />
      <span className="slider"></span>
      <span className="label-text">{label}</span>
    </label>
  );
}

function OrreryMenu({ visibility, onVisibilityChange, timeSpeed, onTimeSpeedChange, isPaused, onPausedChange }) {
  const setFlag = (key) => (value) => onVisibilityChange({ ...visibility, [key]: value });
  const scaleSpeed = (factor) => onTimeSpeedChange(Math.max(0.01, Math.min(timeSpeed * factor, 10)));

  return (
    <div className="menu space-theme">
      <Toggle className="orbit-toggle" checked={visibility.showOrbits} onChange={setFlag('showOrbits')} label="Show Orbits" />
      <Toggle className="comet-toggle" checked={visibility.showNeos} onChange={setFlag('showNeos')} label="Show NEOs" />
      <Toggle className="asteroid-toggle" checked={visibility.showNeoLabels} onChange={setFlag('showNeoLabels')} label="Show NEO Names" />
      <div className="time-control">
        <h3>Time Control</h3>
        <div className="button-group">
          <button onClick={() => scaleSpeed(0.5)} className="time-button slow">
            <Rewind size={14} /> Slower
          </button>
          <button onClick={() => onTimeSpeedChange(1)} className="time-button normal">
            <RotateCcw size={14} /> Normal
          </button>
          <button onClick={() => scaleSpeed(2)} className="time-button fast">
            <FastForward size={14} /> Faster
          </button>
          <button onClick={() => onPausedChange(!isPaused)} className={`time-button ${isPaused ? 'play' : 'pause'}`}>
            {isPaused ? <Play size={14} /> : <Pause size={14} />} {isPaused ? 'Play' : 'Pause'}
          </button>
        </div>
        <div className="speed-display">Current Speed: {timeSpeed.toFixed(2)}x</div>
      </div>
    </div>
  );
}

export default OrreryMenu;
