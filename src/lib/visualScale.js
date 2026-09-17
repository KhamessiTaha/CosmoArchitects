// Compressed "visual" distances: planets sit on readable rings, and anything between them (asteroids,
// comets) is interpolated so it still appears next to the planets it actually orbits near.

// Builds a piecewise-linear AU -> radius mapping from [au, radius] anchors (extrapolates past the last one).
export function createRadialScale(anchors) {
  return (au) => {
    for (let k = 1; k < anchors.length; k++) {
      const [au1, r1] = anchors[k];
      if (au <= au1 || k === anchors.length - 1) {
        const [au0, r0] = anchors[k - 1];
        return r0 + ((au - au0) * (r1 - r0)) / (au1 - au0);
      }
    }
    return 0;
  };
}

// Scale used by the 3D explorer (scene units; Earth at 16 so it matches true scale's 1 AU = 16).
export const auToVisualRadius = createRadialScale([
  [0, 0],
  [0.387, 8], // Mercury
  [0.723, 12], // Venus
  [1.0, 16], // Earth
  [1.524, 22], // Mars
  [5.203, 30], // Jupiter
  [9.537, 40], // Saturn
  [19.19, 50], // Uranus
  [30.07, 60], // Neptune
  [39.48, 70], // Pluto
]);

// Rescales a vector (in AU) in place so its length follows the visual scale.
export function toVisualScale(vector) {
  const au = vector.length();
  if (au > 0) vector.multiplyScalar(auToVisualRadius(au) / au);
  return vector;
}
