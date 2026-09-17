import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';
import { UNITS_PER_AU, blendSize, kmToUnits, scalePosition } from './scale';
import { auToVisualRadius } from './visualScale';

describe('scalePosition', () => {
  it('uses real distances at t = 1 and the compressed layout at t = 0', () => {
    const saturnAU = () => new Vector3(9.537, 0, 0);
    expect(scalePosition(saturnAU(), 1, new Vector3()).x).toBeCloseTo(9.537 * UNITS_PER_AU, 9);
    expect(scalePosition(saturnAU(), 0, new Vector3()).x).toBeCloseTo(auToVisualRadius(9.537), 9);
  });

  it('frames Earth identically in both modes', () => {
    const earth = () => new Vector3(0, 0, -1);
    expect(scalePosition(earth(), 0, new Vector3()).length()).toBeCloseTo(scalePosition(earth(), 1, new Vector3()).length(), 9);
  });
});

describe('blendSize', () => {
  it('interpolates geometrically between visual and true sizes', () => {
    expect(blendSize(0.5, kmToUnits(6371), 0)).toBeCloseTo(0.5, 12);
    expect(blendSize(0.5, kmToUnits(6371), 1)).toBeCloseTo(kmToUnits(6371), 12);
    expect(blendSize(1, 100, 0.5)).toBeCloseTo(10, 9);
  });
});
