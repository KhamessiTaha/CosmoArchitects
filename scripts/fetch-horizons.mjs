// Regenerates src/lib/__fixtures__/horizons.json: reference state vectors from JPL Horizons
// (https://ssd.jpl.nasa.gov/horizons/) used to validate the orbital mechanics in src/lib.
// Usage: node scripts/fetch-horizons.mjs
import { writeFile, mkdir } from 'node:fs/promises';

const API = 'https://ssd.jpl.nasa.gov/api/horizons.api';

const toJD = (isoDate) => Date.parse(`${isoDate}T00:00:00Z`) / 86400000 + 2440587.5;

// Barycenters match JPL's approximate-elements table (Earth entry = Earth-Moon barycenter).
const planets = [
  ['Mercury', '1'], ['Venus', '2'], ['Earth', '3'], ['Mars', '4'], ['Jupiter', '5'],
  ['Saturn', '6'], ['Uranus', '7'], ['Neptune', '8'], ['Pluto', '9'],
];
const planetDates = ['1950-01-01', '1985-07-04', '2000-01-01', '2026-09-17', '2049-12-31'].map(toJD);

const moonDates = Array.from({ length: 8 }, (_, k) => toJD('2026-09-01') + k * 3.7);

// Catalog asteroids from src/data/asteroids.js (osculating epoch MJD 60600 = JD 2460600.5).
const asteroids = [['2062 Aten (1976 AA)', '2062;'], ['2100 Ra-Shalom (1978 RA)', '2100;'], ['3753 Cruithne (1986 TO)', '3753;']];
const asteroidDates = [2460600.5, 2460600.5 + 120];

async function vectors(command, center, jds) {
  const params = new URLSearchParams({
    format: 'json',
    COMMAND: `'${command}'`,
    OBJ_DATA: 'NO',
    MAKE_EPHEM: 'YES',
    EPHEM_TYPE: 'VECTORS',
    CENTER: `'${center}'`,
    TLIST: jds.map((jd) => `'${jd}'`).join(' '),
    TLIST_TYPE: 'JD',
    REF_PLANE: 'ECLIPTIC',
    REF_SYSTEM: 'ICRF',
    OUT_UNITS: 'AU-D',
    VEC_TABLE: '1',
    CSV_FORMAT: 'YES',
  });
  const response = await fetch(`${API}?${params}`);
  if (!response.ok) throw new Error(`Horizons ${command}: HTTP ${response.status}`);
  const { result } = await response.json();
  const table = result.split('$$SOE')[1]?.split('$$EOE')[0];
  if (!table) throw new Error(`Horizons ${command}: no ephemeris\n${result.slice(0, 500)}`);
  return table
    .trim()
    .split('\n')
    .map((line) => {
      const [jd, , x, y, z] = line.split(',').map((cell) => cell.trim());
      return { jd: Number(jd), x: Number(x), y: Number(y), z: Number(z) };
    });
}

const fixture = {
  source: 'JPL Horizons API, ecliptic J2000 frame, AU',
  generated: new Date().toISOString().slice(0, 10),
  planets: {},
  moonGeocentric: await vectors('301', '500@399', moonDates),
  asteroids: {},
};
for (const [name, id] of planets) fixture.planets[name] = await vectors(id, '500@10', planetDates);
for (const [name, id] of asteroids) fixture.asteroids[name] = await vectors(id, '500@10', asteroidDates);

await mkdir(new URL('../src/lib/__fixtures__/', import.meta.url), { recursive: true });
await writeFile(new URL('../src/lib/__fixtures__/horizons.json', import.meta.url), `${JSON.stringify(fixture, null, 2)}\n`);
console.log('Wrote src/lib/__fixtures__/horizons.json');
