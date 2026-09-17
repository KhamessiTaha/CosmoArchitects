import React from 'react';
import TimeControls from './TimeControls';

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
  true: 'Real distances and sizes. Planets become specks: click one, search, or use the bar below to fly to it.',
};

function OrreryMenu({ scale, onScaleChange, visibility, onVisibilityChange, time }) {
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

      <TimeControls {...time} />

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
    </div>
  );
}

export default OrreryMenu;
