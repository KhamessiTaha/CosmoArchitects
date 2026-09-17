// Curated moments in time. Each claim is checked against the app's own ephemeris in moments.test.js.
// `start` is where the clock jumps (ISO, UTC); `event` is the instant the description refers to.
// `focus` is a body key (planet key or slug), `viewRadii` the camera distance in radii of that body.
export const moments = [
  {
    id: 'apophis-2029',
    title: 'Apophis skims past Earth',
    event: '2029-04-13T21:46:00Z',
    start: '2029-04-13T18:46:00Z',
    description:
      'The 340 m asteroid 99942 Apophis passes about 38,000 km from Earth, closer than the Moon. It streaks past a few seconds after the jump, at one hour per second.',
    focus: 'earth',
    viewRadii: 30,
    scale: 'true',
    speed: '1h',
    show: { smallBodies: true, smallBodyLabels: true },
  },
  {
    id: 'mars-2003',
    title: 'Mars at its closest in 60,000 years',
    event: '2003-08-27T09:51:00Z',
    start: '2003-08-10T00:00:00Z',
    description: 'Earth overtook Mars when both were near the ideal points of their orbits: just 0.373 AU (55.8 million km) apart.',
    focus: 'mars',
    viewRadii: 30,
    scale: 'visual',
    speed: '1d',
    show: {},
  },
  {
    id: 'halley-1986',
    title: "Halley's Comet at perihelion",
    event: '1986-02-09T00:00:00Z',
    start: '1985-11-01T00:00:00Z',
    description: "Comet Halley's last swing around the Sun, passing inside Venus's orbit. It returns in 2061.",
    focus: '1p-halley',
    viewRadii: 80,
    scale: 'visual',
    speed: '1d',
    show: { smallBodies: true, smallBodyLabels: true },
  },
  {
    id: 'pluto-1989',
    title: 'Pluto closer to the Sun than Neptune',
    event: '1989-09-05T00:00:00Z',
    start: '1989-09-05T00:00:00Z',
    description: "From 1979 to 1999 Pluto's eccentric orbit carried it inside Neptune's. Their orbits never actually meet.",
    focus: 'pluto',
    viewRadii: 150,
    scale: 'visual',
    speed: '1y',
    show: {},
  },
];
