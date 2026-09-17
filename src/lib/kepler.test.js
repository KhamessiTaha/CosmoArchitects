import { describe, expect, it } from 'vitest';
import {
  J2000,
  elementsToEcliptic,
  meanAnomalyAt,
  meanMotionFromAU,
  solveKepler,
} from './kepler';
import { planetElements } from '../data/planets';
import { comets } from '../data/comets';

describe('solveKepler', () => {
  it.each([0, 0.0167, 0.5, 0.9679, 0.995])('satisfies Kepler\'s equation for e = %p', (e) => {
    for (let M = 0; M < 2 * Math.PI; M += 0.37) {
      const E = solveKepler(M, e);
      expect(E - e * Math.sin(E)).toBeCloseTo(M, 8);
    }
  });
});

describe('elementsToEcliptic', () => {
  it('places Earth at its known J2000 heliocentric position', () => {
    // JPL Horizons, Earth-Moon barycenter at 2000-01-01 12:00 TDB: x ≈ -0.177, y ≈ 0.967 AU.
    const earth = planetElements.find((p) => p.name === 'Earth');
    const { x, y, z } = elementsToEcliptic(earth.a, earth.e, earth.i, earth.om, earth.w, earth.ma);
    expect(x).toBeCloseTo(-0.177, 2);
    expect(y).toBeCloseTo(0.967, 2);
    expect(Math.abs(z)).toBeLessThan(1e-4);
  });

  it('keeps every comet on a finite orbit between perihelion and aphelion', () => {
    Object.values(comets).forEach(({ a, e, i, om, w }) => {
      for (let ma = 0; ma < 360; ma += 15) {
        const { x, y, z } = elementsToEcliptic(a, e, i, om, w, ma);
        const r = Math.hypot(x, y, z);
        expect(r).toBeGreaterThanOrEqual(a * (1 - e) - 1e-9);
        expect(r).toBeLessThanOrEqual(a * (1 + e) + 1e-9);
      }
    });
  });
});

describe('meanMotionFromAU', () => {
  it('gives Earth one revolution per sidereal year', () => {
    const period = 360 / meanMotionFromAU(1);
    expect(period).toBeCloseTo(365.256, 2);
  });

  it('advances mean anomaly linearly with time', () => {
    expect(meanAnomalyAt(10, 2, J2000, J2000 + 5)).toBe(20);
  });
});
