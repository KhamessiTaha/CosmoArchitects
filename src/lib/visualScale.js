// The Visual Orrery draws planets on compressed, evenly spaced rings. This maps a real heliocentric
// distance (AU) onto that same compressed scale so asteroids and comets appear next to the planets
// they actually orbit near.
const ANCHORS = [
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
];

export function auToVisualRadius(au) {
  for (let k = 1; k < ANCHORS.length; k++) {
    const [au1, r1] = ANCHORS[k];
    if (au <= au1 || k === ANCHORS.length - 1) {
      const [au0, r0] = ANCHORS[k - 1];
      return r0 + ((au - au0) * (r1 - r0)) / (au1 - au0);
    }
  }
  return 0;
}

// Rescales a vector (in AU) in place so its length follows the visual scale.
export function toVisualScale(vector) {
  const au = vector.length();
  if (au > 0) vector.multiplyScalar(auToVisualRadius(au) / au);
  return vector;
}
