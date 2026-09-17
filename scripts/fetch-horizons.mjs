// Regenerates src/lib/__fixtures__/horizons.json: reference state vectors from JPL Horizons
// (https://ssd.jpl.nasa.gov/horizons/) used to validate the orbital mechanics in src/lib.
// Usage: node scripts/fetch-horizons.mjs
import { writeFile, mkdir } from 'node:fs/promises';
import { toJD, vectors } from './horizons.mjs';

// Barycenters match JPL's approximate-elements table (Earth entry = Earth-Moon barycenter).
const planets = [
  ['Mercury', '1'], ['Venus', '2'], ['Earth', '3'], ['Mars', '4'], ['Jupiter', '5'],
  ['Saturn', '6'], ['Uranus', '7'], ['Neptune', '8'], ['Pluto', '9'],
];
const planetDates = ['1950-01-01', '1985-07-04', '2000-01-01', '2026-09-17', '2049-12-31'].map((d) => toJD(`${d}T00:00:00Z`));

const moonDates = Array.from({ length: 8 }, (_, k) => toJD('2026-09-01T00:00:00Z') + k * 3.7);

// Catalog asteroids from src/data/asteroids.js (osculating epoch MJD 60600 = JD 2460600.5).
const asteroids = [['2062 Aten (1976 AA)', '2062;'], ['2100 Ra-Shalom (1978 RA)', '2100;'], ['3753 Cruithne (1986 TO)', '3753;']];
const asteroidDates = [2460600.5, 2460600.5 + 120];

const apophisFlyby = toJD('2029-04-13T21:46:00Z');

const fixture = {
  source: 'JPL Horizons API, ecliptic J2000 frame, AU',
  generated: new Date().toISOString().slice(0, 10),
  planets: {},
  moonGeocentric: await vectors('301', '500@399', moonDates),
  asteroids: {},
  // Geocentric Apophis around its 2029 close approach, for src/data/moments.test.js.
  apophisGeocentric: await vectors('99942;', '500@399', [apophisFlyby - 0.5, apophisFlyby, apophisFlyby + 0.5]),
};
for (const [name, id] of planets) fixture.planets[name] = await vectors(id, '500@10', planetDates);
for (const [name, id] of asteroids) fixture.asteroids[name] = await vectors(id, '500@10', asteroidDates);

await mkdir(new URL('../src/lib/__fixtures__/', import.meta.url), { recursive: true });
await writeFile(new URL('../src/lib/__fixtures__/horizons.json', import.meta.url), `${JSON.stringify(fixture, null, 2)}\n`);
console.log('Wrote src/lib/__fixtures__/horizons.json');
