import React, { useId, useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

const fields = [
  ['Type', 'type'],
  ['Star type', 'starType'],
  ['Class', 'planetType'],
  ['Radius', 'radius', (v) => `${v.toLocaleString()} km`],
  ['Distance from the Sun', 'distanceFromSun', (v) => (v === 0 ? null : `${v.toLocaleString()} million km`)],
  ['Distance from Earth', 'distanceFromEarth', (v) => `${v.toLocaleString()} million km`],
  ['Semi-major axis', 'semiMajorAxis'],
  ['Eccentricity', 'eccentricity'],
  ['Inclination', 'inclination'],
  ['Orbital period', 'orbitalPeriod'],
  ['Atmosphere', 'atmosphere'],
  ['Composition', 'composition'],
  ['Rings', 'hasRings'],
  ['Moons', 'moonsCount', (v) => (v > 0 ? v : null)],
  ['Temperature', 'temperature'],
  ['Age', 'age'],
  ['Discovered by', 'discoveredBy'],
  ['Life', 'hasLife'],
];

// On phones the card starts collapsed so it doesn't cover the body the camera just flew to.
const startsCollapsed = () => window.matchMedia('(max-width: 720px)').matches;

// Facts for the selected body. `hazard` is shown as a highlighted note rather than a row.
function ObjectCard({ objectData, onClose }) {
  const detailsId = useId();
  const [isCollapsed, setIsCollapsed] = useState(startsCollapsed);
  if (!objectData) return null;

  return (
    <aside className="object-card panel" aria-labelledby={`${detailsId}-title`}>
      <div className="object-card-header">
        <h2 id={`${detailsId}-title`} className="display">
          {objectData.name}
        </h2>
        <button
          type="button"
          className={`icon-button card-collapse ${isCollapsed ? 'is-collapsed' : ''}`}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-expanded={!isCollapsed}
          aria-controls={detailsId}
          aria-label={isCollapsed ? 'Show details' : 'Hide details'}
        >
          <ChevronDown size={18} />
        </button>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Close details">
          <X size={18} />
        </button>
      </div>
      <div id={detailsId} hidden={isCollapsed}>
        {objectData.hazard && <p className="hazard-note">{objectData.hazard}</p>}
        <dl>
          {fields.map(([label, key, format]) => {
            const raw = objectData[key];
            if (raw === undefined || raw === null || raw === '') return null;
            const value = format ? format(raw) : raw;
            if (value === null) return null;
            return (
              <div key={key}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    </aside>
  );
}

export default ObjectCard;
