import React from 'react';
import { Rewind, FastForward, Pause, Play, Clock } from 'lucide-react';
import { SPEED_PRESETS } from '../../lib/clock';

function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <label className="orbit-toggle">
      <input type="checkbox" checked={checked} disabled={disabled} onChange={() => onChange(!checked)} />
      <span className="slider"></span>
      <span className="label-text">{label}</span>
    </label>
  );
}

const scaleHints = {
  visual: 'Distances compressed and bodies enlarged so everything fits on screen.',
  true: 'Real distances and sizes. Planets become specks: click one, or use the bar below, to fly to it.',
};

function OrreryMenu({ scale, onScaleChange, visibility, onVisibilityChange, speedIndex, onSpeedIndexChange, isPaused, onPausedChange, onNow }) {
  const toggle = (key) => (value) => onVisibilityChange({ ...visibility, [key]: value });

  return (
    <div className="menu space-theme">
      <section className="menu-section">
        <h3>Scale</h3>
        <div className="scale-switch" role="group" aria-label="Scale">
          <button type="button" className={scale === 'visual' ? 'active' : ''} aria-pressed={scale === 'visual'} onClick={() => onScaleChange('visual')}>
            Visual
          </button>
          <button type="button" className={scale === 'true' ? 'active' : ''} aria-pressed={scale === 'true'} onClick={() => onScaleChange('true')}>
            True scale
          </button>
        </div>
        <p className="scale-hint">{scaleHints[scale]}</p>
      </section>

      <section className="menu-section">
        <h3>Show</h3>
        <Toggle checked={visibility.orbits} onChange={toggle('orbits')} label="Orbits" />
        <Toggle checked={visibility.planetLabels} onChange={toggle('planetLabels')} label="Planet names" />
        <Toggle checked={visibility.smallBodies} onChange={toggle('smallBodies')} label="Near-Earth asteroids & comets" />
        <Toggle
          checked={visibility.smallBodyLabels}
          disabled={!visibility.smallBodies}
          onChange={toggle('smallBodyLabels')}
          label="Asteroid & comet names"
        />
        <Toggle checked={visibility.liveNeos} onChange={toggle('liveNeos')} label="Live NEOs from NASA" />
      </section>

      <section className="menu-section">
        <h3>Time</h3>
        <div className="speed-row">
          <button
            type="button"
            className="icon-button"
            aria-label="Slower"
            disabled={speedIndex === 0}
            onClick={() => onSpeedIndexChange(speedIndex - 1)}
          >
            <Rewind size={16} />
          </button>
          <span className="speed-label">{SPEED_PRESETS[speedIndex].label}</span>
          <button
            type="button"
            className="icon-button"
            aria-label="Faster"
            disabled={speedIndex === SPEED_PRESETS.length - 1}
            onClick={() => onSpeedIndexChange(speedIndex + 1)}
          >
            <FastForward size={16} />
          </button>
        </div>
        <div className="time-actions">
          <button type="button" className="icon-button" onClick={() => onPausedChange(!isPaused)}>
            {isPaused ? <Play size={16} /> : <Pause size={16} />} {isPaused ? 'Play' : 'Pause'}
          </button>
          <button type="button" className="icon-button" onClick={onNow}>
            <Clock size={16} /> Now
          </button>
        </div>
      </section>
    </div>
  );
}

export default OrreryMenu;
