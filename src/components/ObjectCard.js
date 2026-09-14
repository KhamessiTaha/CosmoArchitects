import React from 'react';
import './ObjectCard.css';

const fields = [
  ['Type', 'type'],
  ['Star Type', 'starType'],
  ['Planet Type', 'planetType'],
  ['Radius', 'radius', (v) => `${v.toLocaleString()} km`],
  ['Distance from Sun', 'distanceFromSun', (v) => (v === 0 ? null : `${v.toLocaleString()} million km`)],
  ['Distance from Earth', 'distanceFromEarth', (v) => `${v.toLocaleString()} million km`],
  ['Atmosphere', 'atmosphere'],
  ['Composition', 'composition'],
  ['Has Rings', 'hasRings'],
  ['Moons Count', 'moonsCount', (v) => (v > 0 ? v : null)],
  ['Orbital Period', 'orbitalPeriod'],
  ['Temperature', 'temperature'],
  ['Age', 'age'],
  ['Discovered By', 'discoveredBy'],
  ['Life', 'hasLife'],
];

const ObjectCard = ({ objectData, onClose }) => {
  if (!objectData) {
    return null;
  }

  return (
    <div className="object-card">
      <button className="close-button" onClick={onClose} aria-label="Close">&times;</button>
      <h2>{objectData.name}</h2>
      <div className="object-info">
        {fields.map(([label, key, format]) => {
          const raw = objectData[key];
          if (raw === undefined || raw === null || raw === '') return null;
          const value = format ? format(raw) : raw;
          if (value === null) return null;
          return (
            <p key={key}>
              <strong>{label}:</strong> {value}
            </p>
          );
        })}
      </div>
    </div>
  );
};

export default ObjectCard;
