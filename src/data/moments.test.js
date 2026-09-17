import { describe, expect, it } from 'vitest';
import horizons from '../lib/__fixtures__/horizons.json';
import { moments } from './moments';
import { planetElements } from './planets';
import { comets } from './comets';
import featuredBodies from './featuredBodies.json';
import { moonGeocentricPosition, planetPosition, smallBodyPosition } from '../lib/ephemeris';
import { KM_PER_AU, julianDateFromMs } from '../lib/kepler';
import { speedIndexById } from '../lib/clock';
import { slugify } from '../lib/search';

const moment = (id) => moments.find((m) => m.id === id);
const jdOf = (iso) => julianDateFromMs(Date.parse(iso));
const planet = (key) => planetElements.find((p) => p.key === key);
const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y, z: a.z - b.z });
const length = (v) => Math.hypot(v.x, v.y, v.z);
const earthCentre = (jd) => {
  const barycentre = planetPosition(planet('earth'), jd);
  const moon = moonGeocentricPosition(jd);
  return sub(barycentre, { x: moon.x / 82.3, y: moon.y / 82.3, z: moon.z / 82.3 });
};

describe('moments data', () => {
  it('has valid dates, speeds, scales and focus targets', () => {
    const bodySlugs = new Set([
      'sun',
      'moon',
      ...planetElements.map((p) => p.key),
      ...Object.keys(comets).map(slugify),
      ...Object.keys(featuredBodies).map(slugify),
    ]);
    moments.forEach((m) => {
      expect(Number.isFinite(Date.parse(m.start))).toBe(true);
      expect(Date.parse(m.start)).toBeLessThanOrEqual(Date.parse(m.event));
      expect(speedIndexById(m.speed)).toBeGreaterThanOrEqual(0);
      expect(['visual', 'true']).toContain(m.scale);
      expect(bodySlugs.has(m.focus)).toBe(true);
    });
  });
});

describe('moment claims hold in the app ephemeris', () => {
  it('Apophis passes closer than the Moon, near JPL Horizons', () => {
    const jd = jdOf(moment('apophis-2029').event);
    const apophis = featuredBodies['99942 Apophis (2004 MN4)'];
    const distanceKm = length(sub(smallBodyPosition(apophis, jd), earthCentre(jd))) * KM_PER_AU;
    const horizonsKm = length(horizons.apophisGeocentric[1]) * KM_PER_AU;
    expect(horizonsKm).toBeGreaterThan(35000);
    expect(horizonsKm).toBeLessThan(40000);
    // Earth's gravity bending Apophis's path is not modelled; stay within 10,000 km and well inside the Moon's orbit.
    expect(Math.abs(distanceKm - horizonsKm)).toBeLessThan(10000);
    expect(distanceKm).toBeLessThan(384400 / 5);
  });

  it('Mars is at its closest (about 0.373 AU) on 27 August 2003', () => {
    const distanceAt = (jd) => length(sub(planetPosition(planet('mars'), jd), planetPosition(planet('earth'), jd)));
    const jd = jdOf(moment('mars-2003').event);
    expect(distanceAt(jd)).toBeCloseTo(0.3727, 2);
    expect(distanceAt(jd)).toBeLessThan(distanceAt(jd - 5));
    expect(distanceAt(jd)).toBeLessThan(distanceAt(jd + 5));
  });

  it("Halley's Comet is at perihelion (inside Venus's orbit) in February 1986", () => {
    const radiusAt = (jd) => length(smallBodyPosition(comets['1P/Halley'], jd));
    const jd = jdOf(moment('halley-1986').event);
    expect(radiusAt(jd)).toBeLessThan(0.72);
    expect(radiusAt(jd)).toBeLessThan(radiusAt(jd - 15));
    expect(radiusAt(jd)).toBeLessThan(radiusAt(jd + 15));
  });

  it('Pluto is closer to the Sun than Neptune in 1989', () => {
    const jd = jdOf(moment('pluto-1989').event);
    expect(length(planetPosition(planet('pluto'), jd))).toBeLessThan(length(planetPosition(planet('neptune'), jd)));
  });
});
