import { describe, expect, it } from 'vitest';
import horizons from './__fixtures__/horizons.json';
import { moonGeocentricPosition, planetPosition, smallBodyPosition } from './ephemeris';
import { planetElements } from '../data/planets';
import { asteroids } from '../data/asteroids';

// Reference vectors come from JPL Horizons (regenerate with `node scripts/fetch-horizons.mjs`).
const DEG = 180 / Math.PI;

function angleBetweenDegrees(a, b) {
  const dot = a.x * b.x + a.y * b.y + a.z * b.z;
  const cos = dot / (Math.hypot(a.x, a.y, a.z) * Math.hypot(b.x, b.y, b.z));
  return Math.acos(Math.min(1, Math.max(-1, cos))) * DEG;
}

function relativeDistanceError(a, b) {
  return Math.abs(Math.hypot(a.x, a.y, a.z) / Math.hypot(b.x, b.y, b.z) - 1);
}

// JPL quotes the approximate elements as good to well under 0.2 degrees for 1800-2050.
describe('planet positions vs JPL Horizons (1950-2049)', () => {
  planetElements.forEach((planet) => {
    it(`${planet.name} is within 0.2 degrees and 0.5% of distance`, () => {
      horizons.planets[planet.name].forEach((reference) => {
        const computed = planetPosition(planet, reference.jd);
        expect(angleBetweenDegrees(computed, reference)).toBeLessThan(0.2);
        expect(relativeDistanceError(computed, reference)).toBeLessThan(0.005);
      });
    });
  });
});

describe('Moon position vs JPL Horizons', () => {
  it('is within 0.5 degrees and 1% of distance across a month', () => {
    horizons.moonGeocentric.forEach((reference) => {
      const computed = moonGeocentricPosition(reference.jd);
      expect(angleBetweenDegrees(computed, reference)).toBeLessThan(0.5);
      expect(relativeDistanceError(computed, reference)).toBeLessThan(0.01);
    });
  });
});

describe('catalog asteroid positions vs JPL Horizons', () => {
  Object.entries(horizons.asteroids).forEach(([name, references]) => {
    it(`${name} is within 0.5 degrees near its orbital epoch`, () => {
      references.forEach((reference) => {
        const computed = smallBodyPosition(asteroids[name], reference.jd);
        expect(angleBetweenDegrees(computed, reference)).toBeLessThan(0.5);
        expect(relativeDistanceError(computed, reference)).toBeLessThan(0.01);
      });
    });
  });
});
