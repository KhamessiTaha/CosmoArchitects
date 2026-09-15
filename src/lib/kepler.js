// Orbital mechanics shared by both orreries.
// Angles are in degrees at the API boundary; distances are in whatever unit `a` is given in.

const DEG = Math.PI / 180;

// Gaussian gravitational constant expressed as the Sun-centred mean motion at 1 AU (deg/day).
export const K_DEG_PER_DAY = 0.9856076686;
export const KM_PER_AU = 149597870.7;
export const J2000 = 2451545.0;
export const MJD_OFFSET = 2400000.5;

export function julianDateFromMs(ms) {
  return ms / 86400000 + 2440587.5;
}

// Mean motion (deg/day) for a heliocentric orbit with semi-major axis in AU.
export function meanMotionFromAU(aAU) {
  return K_DEG_PER_DAY / Math.pow(aAU, 1.5);
}

// Solves Kepler's equation M = E - e sin E for elliptical orbits (e < 1) using Newton's method.
// M in radians; returns E in radians.
export function solveKepler(M, e, tolerance = 1e-10, maxIterations = 50) {
  // Starting at E = pi converges reliably for highly eccentric orbits.
  let E = e > 0.8 ? Math.PI : M;
  for (let k = 0; k < maxIterations; k++) {
    const delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= delta;
    if (Math.abs(delta) < tolerance) break;
  }
  return E;
}

function wrapRadians(angle) {
  const twoPi = 2 * Math.PI;
  return ((angle % twoPi) + twoPi) % twoPi;
}

// Heliocentric ecliptic position (x, y, z) from classical orbital elements.
// a: semi-major axis, e: eccentricity, i: inclination, om: longitude of ascending node,
// w: argument of perihelion, ma: mean anomaly (all angles in degrees).
export function elementsToEcliptic(a, e, i, om, w, ma) {
  const M = wrapRadians(ma * DEG);
  const E = solveKepler(M, e);
  const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
  const r = a * (1 - e * Math.cos(E));

  const cosOm = Math.cos(om * DEG);
  const sinOm = Math.sin(om * DEG);
  const cosI = Math.cos(i * DEG);
  const sinI = Math.sin(i * DEG);
  const u = w * DEG + nu;
  const cosU = Math.cos(u);
  const sinU = Math.sin(u);

  return {
    x: r * (cosOm * cosU - sinOm * sinU * cosI),
    y: r * (sinOm * cosU + cosOm * sinU * cosI),
    z: r * sinU * sinI,
  };
}

// Converts ecliptic coordinates (z = north) into three.js world space (y = up), preserving handedness.
export function eclipticToScene({ x, y, z }, target) {
  return target.set(x, z, -y);
}

// Mean anomaly (deg) at a Julian date, given the anomaly at an epoch and a mean motion in deg/day.
export function meanAnomalyAt(maAtEpoch, meanMotion, epochJD, jd) {
  return maAtEpoch + meanMotion * (jd - epochJD);
}

// Samples a closed orbit as an array of scene-space points. `createVector` returns a fresh vector.
export function sampleOrbit(elements, segments, createVector, transform = (p) => p) {
  const { a, e, i, om, w } = elements;
  const points = [];
  for (let k = 0; k <= segments; k++) {
    // Sampling eccentric anomaly keeps points evenly spread around the ellipse, even for comets.
    const E = (k / segments) * 2 * Math.PI;
    const M = (E - e * Math.sin(E)) / DEG;
    const p = eclipticToScene(elementsToEcliptic(a, e, i, om, w, M), createVector());
    points.push(transform(p));
  }
  return points;
}
