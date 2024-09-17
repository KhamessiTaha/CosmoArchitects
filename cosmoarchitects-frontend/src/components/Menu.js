import React from 'react';

function Menu({ showOrbits, setShowOrbits, speed, setSpeed }) {
  return (
    <div className="menu" style={menuStyle}>
      <label>
        Show Orbits:
        <input
          type="checkbox"
          checked={showOrbits}
          onChange={() => setShowOrbits(!showOrbits)}
        />
      </label>
      <label>
        Orbit Speed:
        <input
          type="range"
          min="0.0005"
          max="0.005"
          step="0.0001"
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
        />
      </label>
    </div>
  );
}

// Simple CSS for positioning the menu on the top-right
const menuStyle = {
  position: 'absolute',
  top: '100px',
  right: '20px',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  padding: '10px',
  borderRadius: '8px',
  boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
};

export default Menu;
