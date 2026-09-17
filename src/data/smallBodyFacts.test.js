import { describe, expect, it } from 'vitest';
import { smallBodyFacts } from './smallBodyFacts';
import { asteroids } from './asteroids';
import { comets } from './comets';

describe('smallBodyFacts', () => {
  it('describes a catalog asteroid', () => {
    const facts = smallBodyFacts(asteroids['2062 Aten (1976 AA)'], 'asteroid');
    expect(facts).toMatchObject({
      name: '2062 Aten (1976 AA)',
      type: 'Asteroid',
      planetType: 'Aten-group near-Earth asteroid',
      radius: 0.55,
      semiMajorAxis: '0.967 AU',
      orbitalPeriod: '347 days',
    });
  });

  it('reports long periods in years and comet classes', () => {
    const facts = smallBodyFacts(comets['1P/Halley'], 'comet');
    expect(facts.type).toBe('Comet');
    expect(facts.planetType).toBe('Halley-type comet');
    expect(facts.orbitalPeriod).toBe('75.8 years');
  });

  it('derives the period from mean motion for live NEOs', () => {
    const facts = smallBodyFacts({ name: 'X', a: 1, e: 0.1, i: 5, meanMotion: 1, hazardous: true }, 'neo');
    expect(facts.orbitalPeriod).toBe('360 days');
    expect(facts.hazard).toBe('Potentially hazardous asteroid');
  });
});
