import React from 'react';
import { planetElements } from '../../data/planets';

const destinations = [{ key: 'sun', name: 'Sun' }, ...planetElements.map(({ key, name }) => ({ key, name }))];

// Quick navigation that works at any scale and on touch screens.
function PlanetBar({ selectedKey, onSelect }) {
  return (
    <nav className="planet-bar" aria-label="Fly to">
      <ul>
        {destinations.map(({ key, name }) => (
          <li key={key}>
            <button type="button" aria-pressed={selectedKey === key} onClick={() => onSelect(key)}>
              {name}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default PlanetBar;
