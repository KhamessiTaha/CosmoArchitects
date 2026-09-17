import mercury from '../../assets/textures/Mercury/mercury.jpg';
import venus from '../../assets/textures/Venus/venus_surface.jpg';
import earth from '../../assets/textures/Earth/earth.jpg';
import mars from '../../assets/textures/Mars/mars.jpg';
import jupiter from '../../assets/textures/Jupiter/jupiter2.jpg';
import saturn from '../../assets/textures/Saturn/saturn.jpg';
import uranus from '../../assets/textures/Uranus/uranus.jpg';
import neptune from '../../assets/textures/Neptune/neptune.jpg';
import pluto from '../../assets/textures/Pluto/plutomap.jpg';

// Compressed, evenly spaced layout for the Visual Orrery. `orbit` is the ring radius (see lib/visualScale),
// `orbitSpeed` and `spin` are relative to Earth, `glow` is the atmosphere colour.
export const planetLayout = {
  mercury: { texture: mercury, radius: 0.3, orbit: 8, orbitSpeed: 2, spin: 1, orbitColor: 0xaaaaaa },
  venus: { texture: venus, radius: 0.6, orbit: 12, orbitSpeed: 1.5, spin: 0.5, orbitColor: 0xffa500, glow: 0xffa500 },
  earth: { texture: earth, radius: 0.5, orbit: 16, orbitSpeed: 1, spin: 1, orbitColor: 0x0000ff, glow: 0x0000ff, tilt: 23.5 },
  mars: { texture: mars, radius: 0.6, orbit: 22, orbitSpeed: 0.8, spin: 0.8, orbitColor: 0xff0000, glow: 0xff4500, tilt: 25 },
  jupiter: { texture: jupiter, radius: 2, orbit: 30, orbitSpeed: 0.6, spin: 2, orbitColor: 0xffff00, glow: 0xffff00 },
  saturn: { texture: saturn, radius: 1.8, orbit: 40, orbitSpeed: 0.5, spin: 1.8, orbitColor: 0xffa500, glow: 0xfffacd },
  uranus: { texture: uranus, radius: 1.4, orbit: 50, orbitSpeed: 0.3, spin: 1.5, orbitColor: 0x00ffff, glow: 0x00ffff },
  neptune: { texture: neptune, radius: 1.3, orbit: 60, orbitSpeed: 0.25, spin: 1.2, orbitColor: 0x0000ff, glow: 0x0000ff },
  pluto: { texture: pluto, radius: 0.3, orbit: 70, orbitSpeed: 0.2, spin: 1.2, orbitColor: 0x87ceeb, glow: 0x87ceeb },
};

// Simulation clock: radians of Earth's orbit per millisecond at 1x speed.
export const EARTH_ORBIT_RATE = 0.00009;
// Planet self-rotation in radians per millisecond at 1x speed.
export const SPIN_RATE = 0.0006;
