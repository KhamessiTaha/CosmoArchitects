// Set VITE_NASA_API_KEY in .env.local; DEMO_KEY works but is heavily rate limited.
// Note: anything prefixed VITE_ is embedded in the public bundle.
const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';

// Converts a NeoWs "browse" response into orbital elements (a in AU, angles in degrees, epoch as JD).
// Objects with missing data or open (e >= 1) orbits are skipped.
export function parseNeoBrowseResponse(data) {
  return (data.near_earth_objects || [])
    .map(({ name, is_potentially_hazardous_asteroid: hazardous, orbital_data: o }) => {
      if (!o) return null;
      const elements = {
        a: parseFloat(o.semi_major_axis),
        e: parseFloat(o.eccentricity),
        i: parseFloat(o.inclination),
        om: parseFloat(o.ascending_node_longitude),
        w: parseFloat(o.perihelion_argument),
        ma: parseFloat(o.mean_anomaly),
        meanMotion: parseFloat(o.mean_motion),
        epoch: parseFloat(o.epoch_osculation),
      };
      if (!Object.values(elements).every(Number.isFinite) || elements.e >= 1) return null;
      return { name, hazardous: Boolean(hazardous), ...elements };
    })
    .filter(Boolean);
}

export async function fetchNeos(signal) {
  const response = await fetch(`https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=${NASA_API_KEY}`, { signal });
  if (!response.ok) throw new Error(`NASA NeoWs request failed (${response.status})`);
  return parseNeoBrowseResponse(await response.json());
}
