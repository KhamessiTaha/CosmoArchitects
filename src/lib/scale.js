// Scene scale modes. Both share one unit (1 AU = 16 units) so the inner solar system frames the same way:
//  - true:   real distances and real body sizes
//  - visual: distances compressed onto evenly spaced rings (see visualScale.js), bodies enlarged
// A blend factor t (0 = visual, 1 = true) animates between them.
import { toVisualScale } from './visualScale';
import { KM_PER_AU } from './kepler';

export const UNITS_PER_AU = 16;

export const kmToUnits = (km) => (km / KM_PER_AU) * UNITS_PER_AU;

// `target` is a scene-space vector in AU; it is overwritten with the scaled position.
export function scalePosition(target, t, scratch) {
  scratch.copy(target);
  toVisualScale(scratch); // visual units
  target.multiplyScalar(UNITS_PER_AU); // true units
  return target.lerp(scratch, 1 - t);
}

// Sizes differ by up to ~1000x between modes, so interpolate logarithmically for a smooth zoom.
export function blendSize(visualSize, trueSize, t) {
  return Math.exp(Math.log(visualSize) * (1 - t) + Math.log(trueSize) * t);
}

export const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
