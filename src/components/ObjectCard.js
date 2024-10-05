import React from 'react';
import './ObjectCard.css'; 

const ObjectCard = ({ objectData, onClose }) => {
  if (!objectData) {
    return null; 
  }

  return (
    <div className="object-card">
      {/* Close Button */}
      <button className="close-button" onClick={onClose}>&times;</button>

      <h2>{objectData.name}</h2>
      <div className="object-info">
        <p><strong>Type:</strong> {objectData.type}</p>
        {objectData.starType && <p><strong>Star Type:</strong> {objectData.starType}</p>} {/* Show star type for Sun */}
        <p><strong>Planet Type:</strong> {objectData.planetType}</p>
        <p><strong>Radius:</strong> {objectData.radius} km</p>
        <p><strong>Distance from Sun:</strong> {objectData.distanceFromSun} million km</p>
        <p><strong>Atmosphere:</strong> {objectData.atmosphere}</p>
        {objectData.hasRings && <p><strong>Has Rings:</strong> {objectData.hasRings}</p>}
        {objectData.moonsCount > 0 && <p><strong>Moons Count:</strong> {objectData.moonsCount}</p>}
        <p><strong>Orbital Period:</strong> {objectData.orbitalPeriod}</p>
        <p><strong>Temperature:</strong> {objectData.temperature}</p>
        {objectData.age && <p><strong>Age:</strong> {objectData.age}</p>} {/* Show age for all planets */}
        <p><strong>Discovered By:</strong> {objectData.discoveredBy}</p>
        {objectData.hasLife && <p><strong>Life:</strong> {objectData.hasLife}</p>}
      </div>
    </div>
  );
};

export default ObjectCard;

