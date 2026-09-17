import mercury from '../../assets/textures/Mercury/mercury.jpg';
import venus from '../../assets/textures/Venus/venus_surface.jpg';
import earth from '../../assets/textures/Earth/earth.jpg';
import mars from '../../assets/textures/Mars/mars.jpg';
import jupiter from '../../assets/textures/Jupiter/jupiter2.jpg';
import saturn from '../../assets/textures/Saturn/saturn.jpg';
import uranus from '../../assets/textures/Uranus/uranus.jpg';
import neptune from '../../assets/textures/Neptune/neptune.jpg';
import pluto from '../../assets/textures/Pluto/plutomap.jpg';

// Appearance of each planet. `visualRadius` is the enlarged size (scene units) used in visual scale;
// true scale uses the real radius from data/planets.js. `glow` is the atmosphere colour, if any.
export const planetStyles = {
  mercury: { texture: mercury, visualRadius: 0.3, orbitColor: 0xaaaaaa },
  venus: { texture: venus, visualRadius: 0.6, orbitColor: 0xffa500, glow: 0xffa500 },
  earth: { texture: earth, visualRadius: 0.5, orbitColor: 0x3b6cff, glow: 0x0000ff },
  mars: { texture: mars, visualRadius: 0.6, orbitColor: 0xff3b1f, glow: 0xff4500 },
  jupiter: { texture: jupiter, visualRadius: 2, orbitColor: 0xffff00, glow: 0xffff00 },
  saturn: { texture: saturn, visualRadius: 1.8, orbitColor: 0xffa500, glow: 0xfffacd },
  uranus: { texture: uranus, visualRadius: 1.4, orbitColor: 0x00ffff, glow: 0x00ffff },
  neptune: { texture: neptune, visualRadius: 1.3, orbitColor: 0x3b6cff, glow: 0x0000ff },
  pluto: { texture: pluto, visualRadius: 0.3, orbitColor: 0x87ceeb, glow: 0x87ceeb },
};

export const SUN_VISUAL_RADIUS = 3;
export const MOON_VISUAL_RADIUS = 0.2;
// Earth-Moon separation in visual scale (true scale uses the real ~384,400 km).
export const MOON_VISUAL_DISTANCE = 1.5;
// Size of asteroid/comet meshes in visual scale.
export const SMALL_BODY_VISUAL_RADIUS = 0.2;
