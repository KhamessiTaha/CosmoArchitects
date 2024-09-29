import React from 'react';
import { X } from 'lucide-react';

const PlanetCard = ({ planet, onClose }) => {
  if (!planet) return null;

  return (
    <div className="fixed bottom-4 right-4 w-64 bg-gray-900 bg-opacity-80 text-white p-4 rounded-lg shadow-lg border border-blue-500 overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">{planet.name}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
      </div>
      <div className="space-y-2">
        <p><span className="font-semibold">Diameter:</span> {planet.diameter}</p>
        <p><span className="font-semibold">Mass:</span> {planet.mass}</p>
        <p><span className="font-semibold">Orbital Period:</span> {planet.orbitalPeriod}</p>
        <p><span className="font-semibold">Avg. Temperature:</span> {planet.avgTemp}</p>
      </div>
    </div>
  );
};

export default PlanetCard;