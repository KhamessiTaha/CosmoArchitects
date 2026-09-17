import React from 'react';
import { planetElements } from '../../data/planets';
import { planetStyles } from '../../scene/orrery/visualLayout';

const toCss = (hex) => `#${hex.toString(16).padStart(6, '0')}`;

const destinations = [
  { key: 'sun', name: 'Sun', color: '#ffb34d' },
  ...planetElements.map(({ key, name }) => ({ key, name, color: toCss(planetStyles[key].orbitColor) })),
];

// Quick navigation that works at any scale and on touch screens.
function PlanetBar({ selectedKey, onSelect }) {
  return (
    <nav className="planet-bar" aria-label="Fly to">
      {destinations.map(({ key, name, color }) => (
        <button
          key={key}
          type="button"
          className={selectedKey === key ? 'active' : ''}
          aria-pressed={selectedKey === key}
          onClick={() => onSelect(key)}
        >
          <span className="dot" style={{ background: color }} />
          {name}
        </button>
      ))}
    </nav>
  );
}

export default PlanetBar;
