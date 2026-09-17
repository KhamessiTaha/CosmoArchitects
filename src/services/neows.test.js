import { describe, expect, it } from 'vitest';
import { parseNeoBrowseResponse } from './neows';
import { KM_PER_AU } from '../lib/kepler';

const orbit = {
  semi_major_axis: '1.078',
  eccentricity: '.8270',
  inclination: '22.8',
  ascending_node_longitude: '88.0',
  perihelion_argument: '31.4',
  mean_anomaly: '120.5',
  mean_motion: '.8795',
  epoch_osculation: '2461000.5',
};

describe('parseNeoBrowseResponse', () => {
  it('converts NeoWs strings into numeric orbital elements in km', () => {
    const [neo] = parseNeoBrowseResponse({
      near_earth_objects: [{ name: '1566 Icarus', is_potentially_hazardous_asteroid: true, orbital_data: orbit }],
    });
    expect(neo).toEqual({
      name: '1566 Icarus',
      hazardous: true,
      a: 1.078 * KM_PER_AU,
      e: 0.827,
      i: 22.8,
      om: 88,
      w: 31.4,
      ma: 120.5,
      meanMotion: 0.8795,
      epoch: 2461000.5,
    });
  });

  it('skips objects with missing elements or open orbits', () => {
    const result = parseNeoBrowseResponse({
      near_earth_objects: [
        { name: 'no orbit' },
        { name: 'missing motion', orbital_data: { ...orbit, mean_motion: undefined } },
        { name: 'hyperbolic', orbital_data: { ...orbit, eccentricity: '1.2' } },
      ],
    });
    expect(result).toEqual([]);
  });
});
