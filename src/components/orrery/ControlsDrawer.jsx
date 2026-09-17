import React, { useState } from 'react';
import { X } from 'lucide-react';
import { msFromJulianDate } from '../../lib/clock';
import { julianDateFromMs } from '../../lib/kepler';
import { moments } from '../../data/moments';

function Toggle({ checked, onChange, label, disabled = false }) {
  return (
    <label className={`toggle ${disabled ? 'toggle-disabled' : ''}`}>
      <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={() => onChange(!checked)} />
      <span className="toggle-track" aria-hidden="true" />
      <span>{label}</span>
    </label>
  );
}

// <input type="datetime-local"> works in the viewer's local time.
const toLocalInputValue = (jd) => {
  const date = new Date(msFromJulianDate(jd));
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const momentDate = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' });

const scaleHints = {
  visual: 'Distances are compressed and bodies enlarged so everything fits on screen.',
  true: 'Real sizes and distances. Planets become specks: search or use the planet bar to fly to one.',
};

const shortcuts = [
  ['/', 'Search'],
  ['0–9', 'Fly to the Sun, Mercury … Pluto'],
  ['V', 'Switch scale'],
  ['P', 'Pause or play'],
  ['[  ]', 'Slower, faster'],
  ['N', 'Back to now'],
  ['L', 'Planet names'],
  ['R', 'Reset the camera'],
];

function ControlsDrawer({ jd, scale, onScaleChange, visibility, onVisibilityChange, onJump, onMoment, onClose }) {
  // Initialised when the drawer opens; the running clock doesn't overwrite what the user is typing.
  const [draftDate, setDraftDate] = useState(() => toLocalInputValue(jd));
  const toggle = (key) => (value) => onVisibilityChange({ ...visibility, [key]: value });

  const jumpToDraft = (event) => {
    event.preventDefault();
    const ms = new Date(draftDate).getTime();
    if (Number.isFinite(ms)) onJump(julianDateFromMs(ms));
  };

  return (
    <aside className="controls-drawer panel" aria-label="Explorer controls">
      <div className="drawer-header">
        <h2>Controls</h2>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Close controls">
          <X size={18} />
        </button>
      </div>

      <section className="drawer-section" aria-labelledby="scale-heading">
        <h3 id="scale-heading">Scale</h3>
        <div className="segmented" role="radiogroup" aria-labelledby="scale-heading">
          {[
            ['visual', 'Visual'],
            ['true', 'True scale'],
          ].map(([value, label]) => (
            <button key={value} type="button" role="radio" aria-checked={scale === value} onClick={() => onScaleChange(value)}>
              {label}
            </button>
          ))}
        </div>
        <p className="hint">{scaleHints[scale]}</p>
      </section>

      <section className="drawer-section" aria-labelledby="date-heading">
        <h3 id="date-heading">Go to a date</h3>
        <form className="date-form" onSubmit={jumpToDraft}>
          <input
            type="datetime-local"
            aria-label="Date and time, in your local time"
            min="1000-01-01T00:00"
            max="3000-12-31T23:59"
            value={draftDate}
            onChange={(event) => setDraftDate(event.target.value)}
          />
          <button type="submit" className="button">
            Go
          </button>
        </form>
      </section>

      <section className="drawer-section" aria-labelledby="moments-heading">
        <h3 id="moments-heading">Moments</h3>
        <ul className="drawer-moments">
          {moments.map((moment) => (
            <li key={moment.id}>
              <button type="button" onClick={() => onMoment(moment)}>
                <span className="drawer-moment-title">{moment.title}</span>
                <span className="drawer-moment-date tabular">{momentDate.format(new Date(moment.event))}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="drawer-section" aria-labelledby="layers-heading">
        <h3 id="layers-heading">Layers</h3>
        <Toggle checked={visibility.orbits} onChange={toggle('orbits')} label="Orbits" />
        <Toggle checked={visibility.planetLabels} onChange={toggle('planetLabels')} label="Planet names" />
        <Toggle checked={visibility.smallBodies} onChange={toggle('smallBodies')} label="Near-Earth asteroids and comets" />
        <Toggle
          checked={visibility.smallBodyLabels}
          disabled={!visibility.smallBodies}
          onChange={toggle('smallBodyLabels')}
          label="Asteroid and comet names"
        />
        <Toggle checked={visibility.liveNeos} onChange={toggle('liveNeos')} label="Live near-Earth objects from NASA" />
      </section>

      <section className="drawer-section" aria-labelledby="keys-heading">
        <h3 id="keys-heading">Keyboard shortcuts</h3>
        <dl className="shortcuts">
          {shortcuts.map(([keys, action]) => (
            <div key={keys}>
              <dt>
                <kbd>{keys}</kbd>
              </dt>
              <dd>{action}</dd>
            </div>
          ))}
        </dl>
      </section>
    </aside>
  );
}

export default ControlsDrawer;
