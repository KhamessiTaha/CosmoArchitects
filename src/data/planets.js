// Mean orbital elements (heliocentric, ecliptic J2000) from JPL's
// "Keplerian Elements for Approximate Positions of the Major Planets" (E. M. Standish), Table 1,
// valid 1800 AD - 2050 AD. Each element is [value at J2000, rate per Julian century].
// a: semi-major axis (AU), e: eccentricity, i: inclination, L: mean longitude,
// lp: longitude of perihelion, om: longitude of ascending node (degrees).
// Earth's entry is the Earth-Moon barycenter; Pluto's is the Pluto-system barycenter.
// radius: mean radius (km), rotationPeriod: sidereal hours (negative = retrograde), obliquity: axial tilt (degrees).
export const planetElements = [
  {
    key: 'mercury', name: 'Mercury', radius: 2439.7, rotationPeriod: 1407.6, obliquity: 0.03,
    a: [0.38709927, 0.00000037], e: [0.20563593, 0.00001906], i: [7.00497902, -0.00594749],
    L: [252.2503235, 149472.67411175], lp: [77.45779628, 0.16047689], om: [48.33076593, -0.12534081],
  },
  {
    key: 'venus', name: 'Venus', radius: 6051.8, rotationPeriod: -5832.5, obliquity: 177.4,
    a: [0.72333566, 0.0000039], e: [0.00677672, -0.00004107], i: [3.39467605, -0.0007889],
    L: [181.9790995, 58517.81538729], lp: [131.60246718, 0.00268329], om: [76.67984255, -0.27769418],
  },
  {
    key: 'earth', name: 'Earth', radius: 6371, rotationPeriod: 23.9345, obliquity: 23.44,
    a: [1.00000261, 0.00000562], e: [0.01671123, -0.00004392], i: [-0.00001531, -0.01294668],
    L: [100.46457166, 35999.37244981], lp: [102.93768193, 0.32327364], om: [0, 0],
  },
  {
    key: 'mars', name: 'Mars', radius: 3389.5, rotationPeriod: 24.6229, obliquity: 25.19,
    a: [1.52371034, 0.00001847], e: [0.0933941, 0.00007882], i: [1.84969142, -0.00813131],
    L: [-4.55343205, 19140.30268499], lp: [-23.94362959, 0.44441088], om: [49.55953891, -0.29257343],
  },
  {
    key: 'jupiter', name: 'Jupiter', radius: 69911, rotationPeriod: 9.925, obliquity: 3.13,
    a: [5.202887, -0.00011607], e: [0.04838624, -0.00013253], i: [1.30439695, -0.00183714],
    L: [34.39644051, 3034.74612775], lp: [14.72847983, 0.21252668], om: [100.47390909, 0.20469106],
  },
  {
    key: 'saturn', name: 'Saturn', radius: 58232, rotationPeriod: 10.656, obliquity: 26.73,
    a: [9.53667594, -0.0012506], e: [0.05386179, -0.00050991], i: [2.48599187, 0.00193609],
    L: [49.95424423, 1222.49362201], lp: [92.59887831, -0.41897216], om: [113.66242448, -0.28867794],
  },
  {
    key: 'uranus', name: 'Uranus', radius: 25362, rotationPeriod: -17.24, obliquity: 97.77,
    a: [19.18916464, -0.00196176], e: [0.04725744, -0.00004397], i: [0.77263783, -0.00242939],
    L: [313.23810451, 428.48202785], lp: [170.9542763, 0.40805281], om: [74.01692503, 0.04240589],
  },
  {
    key: 'neptune', name: 'Neptune', radius: 24622, rotationPeriod: 16.11, obliquity: 28.32,
    a: [30.06992276, 0.00026291], e: [0.00859048, 0.00005105], i: [1.77004347, 0.00035372],
    L: [-55.12002969, 218.45945325], lp: [44.96476227, -0.32241464], om: [131.78422574, -0.00508664],
  },
  {
    key: 'pluto', name: 'Pluto', radius: 1188.3, rotationPeriod: -153.29, obliquity: 122.53,
    a: [39.48211675, -0.00031596], e: [0.2488273, 0.0000517], i: [17.14001206, 0.00004818],
    L: [238.92903833, 145.20780515], lp: [224.06891629, -0.04062942], om: [110.30393684, -0.01183482],
  },
];
