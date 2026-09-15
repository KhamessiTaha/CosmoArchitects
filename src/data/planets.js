// J2000 mean orbital elements (heliocentric, ecliptic) from JPL's
// "Keplerian Elements for Approximate Positions of the Major Planets" (Standish), Table 1.
// L = mean longitude, lp = longitude of perihelion, om = longitude of ascending node (degrees).
// Earth's entry is the Earth-Moon barycenter. Radius in km, rotation period in hours (negative = retrograde).
const raw = [
  { name: 'Mercury', a: 0.38709927, e: 0.20563593, i: 7.00497902, L: 252.2503235, lp: 77.45779628, om: 48.33076593, radius: 2439.7, rotationPeriod: 1407.6 },
  { name: 'Venus', a: 0.72333566, e: 0.00677672, i: 3.39467605, L: 181.9790995, lp: 131.60246718, om: 76.67984255, radius: 6051.8, rotationPeriod: -5832.5 },
  { name: 'Earth', a: 1.00000261, e: 0.01671123, i: -0.00001531, L: 100.46457166, lp: 102.93768193, om: 0.0, radius: 6371, rotationPeriod: 23.934 },
  { name: 'Mars', a: 1.52371034, e: 0.0933941, i: 1.84969142, L: -4.55343205, lp: -23.94362959, om: 49.55953891, radius: 3389.5, rotationPeriod: 24.6229 },
  { name: 'Jupiter', a: 5.202887, e: 0.04838624, i: 1.30439695, L: 34.39644051, lp: 14.72847983, om: 100.47390909, radius: 69911, rotationPeriod: 9.925 },
  { name: 'Saturn', a: 9.53667594, e: 0.05386179, i: 2.48599187, L: 49.95424423, lp: 92.59887831, om: 113.66242448, radius: 58232, rotationPeriod: 10.656 },
  { name: 'Uranus', a: 19.18916464, e: 0.04725744, i: 0.77263783, L: 313.23810451, lp: 170.9542763, om: 74.01692503, radius: 25362, rotationPeriod: -17.24 },
  { name: 'Neptune', a: 30.06992276, e: 0.00859048, i: 1.77004347, L: -55.12002969, lp: 44.96476227, om: 131.78422574, radius: 24622, rotationPeriod: 16.11 },
];

export const planetElements = raw.map(({ L, lp, ...p }) => ({
  ...p,
  w: lp - p.om, // argument of perihelion
  ma: L - lp, // mean anomaly at J2000
}));
