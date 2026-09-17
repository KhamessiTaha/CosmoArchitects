// Positions of solar-system bodies at a Julian date, in heliocentric ecliptic J2000 coordinates (AU).
import { J2000, KM_PER_AU, MJD_OFFSET, elementsToEcliptic, meanAnomalyAt, meanMotionFromAU } from './kepler';

const DEG = Math.PI / 180;
const DAYS_PER_CENTURY = 36525;

// Osculating elements of a planet at `jd` from J2000 values and per-century rates.
export function planetElementsAt(planet, jd) {
  const T = (jd - J2000) / DAYS_PER_CENTURY;
  const at = ([value, rate]) => value + rate * T;
  const L = at(planet.L);
  const lp = at(planet.lp);
  const om = at(planet.om);
  return { a: at(planet.a), e: at(planet.e), i: at(planet.i), om, w: lp - om, ma: L - lp };
}

export function planetPosition(planet, jd) {
  const { a, e, i, om, w, ma } = planetElementsAt(planet, jd);
  return elementsToEcliptic(a, e, i, om, w, ma);
}

// Two-body propagation of a small body from its osculating elements.
// Accepts catalog entries (epoch_mjd, a in AU) or NeoWs entries (epoch JD, meanMotion deg/day).
export function smallBodyPosition(body, jd) {
  const epoch = body.epoch ?? body.epoch_mjd + MJD_OFFSET;
  const meanMotion = body.meanMotion ?? meanMotionFromAU(body.a);
  return elementsToEcliptic(body.a, body.e, body.i, body.om, body.w, meanAnomalyAt(body.ma, meanMotion, epoch, jd));
}

// Low-precision geocentric Moon using the largest periodic terms of lunar theory
// (equation of centre, evection, variation, annual equation), good to a few tenths of a degree.
export function moonGeocentricPosition(jd) {
  const d = jd - J2000;
  const M = (134.963 + 13.064993 * d) * DEG; // Moon's mean anomaly
  const F = (93.272 + 13.22935 * d) * DEG; // argument of latitude
  const D = (297.85 + 12.190749 * d) * DEG; // mean elongation from the Sun
  const Ms = (357.529 + 0.98560028 * d) * DEG; // Sun's mean anomaly
  // The series gives longitude from the equinox of date; subtract general precession (1.397 deg/century) for J2000.
  const longitude =
    (218.316 + 13.176396 * d - (1.397 * d) / 36525) * DEG +
    (6.289 * Math.sin(M) + 1.274 * Math.sin(2 * D - M) + 0.658 * Math.sin(2 * D) + 0.214 * Math.sin(2 * M) - 0.186 * Math.sin(Ms)) * DEG;
  const latitude = (5.128 * Math.sin(F) + 0.28 * Math.sin(M + F) - 0.28 * Math.sin(F - M) - 0.173 * Math.sin(F - 2 * D)) * DEG;
  const distance = (385001 - 20905 * Math.cos(M) - 3699 * Math.cos(2 * D - M) - 2956 * Math.cos(2 * D)) / KM_PER_AU;
  return {
    x: distance * Math.cos(latitude) * Math.cos(longitude),
    y: distance * Math.cos(latitude) * Math.sin(longitude),
    z: distance * Math.sin(latitude),
  };
}
