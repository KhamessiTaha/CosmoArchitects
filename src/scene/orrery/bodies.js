import * as THREE from 'three';
import { createRimGlowMaterial } from '../core/materials';
import { createGlareSprite, createScreenLabel } from '../core/labels';
import { kmToUnits } from '../../lib/scale';
import { planetStyles, SUN_VISUAL_RADIUS, MOON_VISUAL_RADIUS } from './visualLayout';

import sunTexture from '../../assets/textures/Sun/sun.jpg';
import moonTexture from '../../assets/textures/Earth/moon.jpg';
import saturnRingTexture from '../../assets/textures/Saturn/saturn_ring.png';
import earthBump from '../../assets/textures/Earth/earthbump.jpg';
import earthSpecular from '../../assets/textures/Earth/earthspec.jpg';
import earthClouds from '../../assets/textures/Earth/earthcloud.jpg';
import earthCloudAlpha from '../../assets/textures/Earth/earthcloudtrans.jpg';

// Bodies are built at unit radius; each frame the root group is scaled to the blended radius,
// so atmospheres, clouds and rings follow automatically.
const unitSphere = () => new THREE.SphereGeometry(1, 64, 64);

export function createSun(stage) {
  const root = new THREE.Group();
  root.add(new THREE.Mesh(unitSphere(), new THREE.MeshBasicMaterial({ map: stage.loadTexture(sunTexture, { color: true }) })));
  root.add(new THREE.Mesh(new THREE.SphereGeometry(1.5, 64, 64), createRimGlowMaterial(0xffb34d, 0.7, 4)));
  // Hidden inside the disc at visual scale; keeps the Sun visible when it's tiny at true scale.
  const glare = createGlareSprite();
  stage.scene.add(root, glare);

  return {
    key: 'sun',
    name: 'Sun',
    root,
    label: null,
    visualRadius: SUN_VISUAL_RADIUS,
    trueRadius: kmToUnits(696340),
  };
}

export function createPlanet(stage, planet) {
  const style = planetStyles[planet.key];
  const root = new THREE.Group();
  const tilt = new THREE.Group();
  tilt.rotation.z = THREE.MathUtils.degToRad(planet.obliquity);
  const spin = new THREE.Group();
  root.add(tilt);
  tilt.add(spin);

  const materialOptions = { map: stage.loadTexture(style.texture, { color: true }), shininess: 5 };
  if (planet.key === 'earth') {
    Object.assign(materialOptions, {
      bumpMap: stage.loadTexture(earthBump),
      bumpScale: 0.2,
      specularMap: stage.loadTexture(earthSpecular),
      specular: new THREE.Color('black'),
    });
  }
  spin.add(new THREE.Mesh(unitSphere(), new THREE.MeshPhongMaterial(materialOptions)));

  let clouds = null;
  if (planet.key === 'earth') {
    clouds = new THREE.Mesh(
      new THREE.SphereGeometry(1.02, 64, 64),
      new THREE.MeshPhongMaterial({
        map: stage.loadTexture(earthClouds, { color: true }),
        alphaMap: stage.loadTexture(earthCloudAlpha),
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
      })
    );
    spin.add(clouds);
  }

  if (planet.key === 'saturn') {
    tilt.add(createSaturnRings(stage));
  }

  if (style.glow !== undefined) {
    root.add(new THREE.Mesh(new THREE.SphereGeometry(1.025, 64, 64), createRimGlowMaterial(style.glow, 0.5, 2)));
  }

  const label = createScreenLabel(planet.name);
  stage.scene.add(root, label);

  return {
    key: planet.key,
    name: planet.name,
    elements: planet,
    root,
    spin,
    clouds,
    label,
    visualRadius: style.visualRadius,
    trueRadius: kmToUnits(planet.radius),
  };
}

// Ring extent in planet radii (inner C ring to outer A ring, ~74,500-136,800 km).
function createSaturnRings(stage) {
  const inner = 1.24;
  const outer = 2.27;
  const geometry = new THREE.RingGeometry(inner, outer, 128);
  const positions = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  // RingGeometry has one radial segment, so u = 0 (inner edge) / 1 (outer edge) spans the strip texture.
  for (let k = 0; k < positions.count; k++) {
    vertex.fromBufferAttribute(positions, k);
    geometry.attributes.uv.setXY(k, vertex.length() < (inner + outer) / 2 ? 0 : 1, 1);
  }
  const rings = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      map: stage.loadTexture(saturnRingTexture, { color: true }),
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
    })
  );
  rings.rotation.x = Math.PI / 2;
  return rings;
}

export function createMoon(stage, moonTextureUrl = moonTexture) {
  const root = new THREE.Group();
  root.add(
    new THREE.Mesh(
      unitSphere(),
      new THREE.MeshStandardMaterial({ map: stage.loadTexture(moonTextureUrl, { color: true }), roughness: 1, metalness: 0 })
    )
  );
  const label = createScreenLabel('Moon', { height: 0.028 });
  stage.scene.add(root, label);
  return {
    key: 'moon',
    name: 'Moon',
    root,
    label,
    visualRadius: MOON_VISUAL_RADIUS,
    trueRadius: kmToUnits(1737.4),
  };
}
