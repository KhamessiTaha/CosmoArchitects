import { describe, expect, it } from 'vitest';
import { auToVisualRadius } from './visualScale';

describe('auToVisualRadius', () => {
  it('lands each planet exactly on its ring', () => {
    expect(auToVisualRadius(1.0)).toBe(16);
    expect(auToVisualRadius(5.203)).toBe(30);
    expect(auToVisualRadius(39.48)).toBe(70);
  });

  it('is monotonic, so orbit shapes never fold back on themselves', () => {
    let previous = -Infinity;
    for (let au = 0; au <= 60; au += 0.05) {
      const radius = auToVisualRadius(au);
      expect(radius).toBeGreaterThan(previous);
      previous = radius;
    }
  });
});
