import * as THREE from 'three';
import { gsap } from 'gsap';
import StatsJS from 'stats.js';
import { createStage } from '../core/createStage';
import { createRimGlowMaterial } from '../core/materials';
import { createTextLabel } from '../core/labels';
import { elementsToEcliptic, eclipticToScene, sampleOrbit } from '../../lib/kepler';
import { toVisualScale } from '../../lib/visualScale';
import { asteroids } from '../../data/asteroids';
import { comets } from '../../data/comets';
import { planetLayout, EARTH_ORBIT_RATE, SPIN_RATE } from './layout';

import sunTexture from '../../assets/textures/Sun/sun.jpg';
import moonTexture from '../../assets/textures/Earth/moon.jpg';
import saturnRingTexture from '../../assets/textures/Saturn/saturn_ring.png';
import earthBump from '../../assets/textures/Earth/earthbump.jpg';
import earthSpecular from '../../assets/textures/Earth/earthspec.jpg';
import earthClouds from '../../assets/textures/Earth/earthcloud.jpg';
import earthCloudAlpha from '../../assets/textures/Earth/earthcloudtrans.jpg';
import asteroidTexture from '../../assets/textures/Asteroid/asteroid3.jpg';
import skyRight from '../../assets/textures/skybox/right.png';
import skyLeft from '../../assets/textures/skybox/left.png';
import skyTop from '../../assets/textures/skybox/top.png';
import skyBottom from '../../assets/textures/skybox/bottom.png';
import skyFront from '../../assets/textures/skybox/front.png';
import skyBack from '../../assets/textures/skybox/back.png';

const HOME_CAMERA = { x: 10, y: 5, z: 30 };
const SUN_RADIUS = 3;

function addStarfield(scene, count = 500) {
  const positions = new Float32Array(count * 3);
  const direction = new THREE.Vector3();
  for (let k = 0; k < count; k++) {
    direction.randomDirection().multiplyScalar(500 + Math.random() * 500).toArray(positions, k * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.8 })));
}

function createPlanet(key, layout, stage) {
  const materialOptions = { map: stage.loadTexture(layout.texture, { color: true }), shininess: 5 };
  if (key === 'earth') {
    Object.assign(materialOptions, {
      bumpMap: stage.loadTexture(earthBump),
      bumpScale: 0.2,
      specularMap: stage.loadTexture(earthSpecular),
      specular: new THREE.Color('black'),
    });
  }
  const body = new THREE.Mesh(new THREE.SphereGeometry(layout.radius, 64, 64), new THREE.MeshPhongMaterial(materialOptions));
  if (layout.tilt) body.rotation.z = THREE.MathUtils.degToRad(layout.tilt);

  const group = new THREE.Group();
  group.add(body);
  if (layout.glow !== undefined) {
    group.add(new THREE.Mesh(new THREE.SphereGeometry(layout.radius * 1.025, 64, 64), createRimGlowMaterial(layout.glow, 0.5, 2)));
  }
  group.position.x = layout.orbit;
  group.userData.objectKey = key;
  return group;
}

function createSaturnRings(stage) {
  // RingGeometry has one radial segment, so u = 0 (inner edge) / 1 (outer edge) spans the strip texture.
  const geometry = new THREE.RingGeometry(2.2, 3.2, 120);
  const positions = geometry.attributes.position;
  const vertex = new THREE.Vector3();
  for (let k = 0; k < positions.count; k++) {
    vertex.fromBufferAttribute(positions, k);
    geometry.attributes.uv.setXY(k, vertex.length() < 2.7 ? 0 : 1, 1);
  }
  const rings = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ map: stage.loadTexture(saturnRingTexture, { color: true }), side: THREE.DoubleSide, transparent: true })
  );
  rings.rotation.x = Math.PI / 2;
  return rings;
}

// Asteroids and comets share geometry and materials; their orbits come from real Keplerian elements.
function addSmallBodies(stage) {
  const { scene } = stage;
  const geometry = new THREE.SphereGeometry(0.2, 16, 16);
  const kinds = [
    {
      catalog: asteroids,
      material: new THREE.MeshBasicMaterial({ map: stage.loadTexture(asteroidTexture, { color: true }) }),
      orbitMaterial: new THREE.LineBasicMaterial({ color: 0xff0000, opacity: 0.7, transparent: true }),
    },
    {
      catalog: comets,
      material: new THREE.MeshBasicMaterial({ color: 0xffffff }),
      orbitMaterial: new THREE.LineBasicMaterial({ color: 0xa9a9a9, opacity: 0.7, transparent: true }),
    },
  ];

  return kinds.flatMap(({ catalog, material, orbitMaterial }) =>
    Object.values(catalog).map((body) => {
      const mesh = new THREE.Mesh(geometry, material);
      const points = sampleOrbit(body, 360, () => new THREE.Vector3(), toVisualScale);
      const orbit = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), orbitMaterial);
      const label = createTextLabel(body.name);
      scene.add(mesh, orbit, label);
      return { ...body, mesh, orbit, label };
    })
  );
}

/**
 * Builds the stylised, compressed-scale orrery inside `mount`.
 * Callbacks: onLoadProgress(0..1), onLoaded(), onSelect(objectKey | null).
 * Returns a controller the UI drives; call dispose() on unmount.
 */
export function createVisualOrrery(mount, { onLoadProgress, onLoaded, onSelect, showStats = false } = {}) {
  const stage = createStage(mount, {
    near: 0.1,
    far: 2000,
    cameraPosition: new THREE.Vector3(0, 0, 30),
    onLoadProgress,
    onLoaded,
  });
  const { scene, camera, controls, renderer } = stage;

  scene.background = new THREE.CubeTextureLoader(stage.loadingManager).load([skyRight, skyLeft, skyTop, skyBottom, skyFront, skyBack]);
  addStarfield(scene);
  scene.add(new THREE.AmbientLight(0x404040, 0.2));
  scene.add(new THREE.PointLight(0xffffff, 250, 0));

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(SUN_RADIUS, 64, 64),
    new THREE.MeshBasicMaterial({ map: stage.loadTexture(sunTexture, { color: true }) })
  );
  sun.userData.objectKey = 'sun';
  scene.add(sun);
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(SUN_RADIUS * 1.5, 64, 64), createRimGlowMaterial(0xffb34d, 0.7, 4)));

  const planets = Object.fromEntries(
    Object.entries(planetLayout).map(([key, layout]) => {
      const planet = createPlanet(key, layout, stage);
      scene.add(planet);
      return [key, planet];
    })
  );

  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(0.51, 64, 64),
    new THREE.MeshPhongMaterial({
      map: stage.loadTexture(earthClouds, { color: true }),
      alphaMap: stage.loadTexture(earthCloudAlpha),
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    })
  );
  scene.add(clouds);

  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 64, 64),
    new THREE.MeshStandardMaterial({ map: stage.loadTexture(moonTexture, { color: true }), roughness: 1, metalness: 0 })
  );
  moon.userData.objectKey = 'moon';
  scene.add(moon);

  const rings = createSaturnRings(stage);
  scene.add(rings);

  const planetOrbits = Object.values(planetLayout).map(({ orbit, orbitColor }) => {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(orbit, orbit + 0.05, 256),
      new THREE.MeshBasicMaterial({ color: orbitColor, side: THREE.DoubleSide })
    );
    ring.rotation.x = Math.PI / 2;
    scene.add(ring);
    return ring;
  });

  const smallBodies = addSmallBodies(stage);

  let stats = null;
  if (showStats) {
    stats = new StatsJS();
    Object.assign(stats.dom.style, { position: 'absolute', top: '70px', left: '10px' });
    mount.appendChild(stats.dom);
    stage.onDispose(() => stats.dom.remove());
  }

  // Selection & camera tracking
  const selectable = [sun, moon, ...Object.values(planets)];
  let tracked = null;
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const handleDoubleClick = (event) => {
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(selectable, true)[0];

    if (!hit) {
      tracked = null;
      onSelect?.(null);
      return;
    }

    let target = hit.object;
    while (target.parent && !selectable.includes(target)) target = target.parent;
    tracked = target;

    const bounds = new THREE.Box3().setFromObject(target).getBoundingSphere(new THREE.Sphere());
    const offset = bounds.radius * 3;
    controls.target.copy(target.position);
    gsap.to(camera.position, {
      duration: 2,
      x: target.position.x + offset,
      y: target.position.y + offset * 0.5,
      z: target.position.z + offset,
      ease: 'power2.inOut',
    });
    onSelect?.(target.userData.objectKey);
  };
  renderer.domElement.addEventListener('dblclick', handleDoubleClick);
  stage.onDispose(() => {
    renderer.domElement.removeEventListener('dblclick', handleDoubleClick);
    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(controls.target);
  });

  // Simulation
  const state = { timeSpeed: 1, paused: false };
  let simTime = 0;
  const position = new THREE.Vector3();

  stage.start(
    (dt) => {
      stats?.begin();
      if (!state.paused) {
        simTime += dt * EARTH_ORBIT_RATE * state.timeSpeed;
        const spin = dt * SPIN_RATE * state.timeSpeed;

        // Planets orbit counter-clockwise seen from above (prograde), matching the Keplerian bodies.
        Object.entries(planets).forEach(([key, group]) => {
          const { orbit, orbitSpeed, spin: spinFactor } = planetLayout[key];
          const angle = simTime * orbitSpeed;
          group.position.set(Math.cos(angle) * orbit, 0, -Math.sin(angle) * orbit);
          group.rotation.y += spin * spinFactor;
        });

        const earth = planets.earth.position;
        clouds.position.copy(earth);
        clouds.rotation.y += spin * 1.3;
        moon.position.set(earth.x + Math.cos(simTime * 10) * 1.5, 0, earth.z - Math.sin(simTime * 10) * 1.5);
        rings.position.copy(planets.saturn.position);

        // Mean motion scales with a^-1.5 (Kepler's third law), relative to Earth's orbit.
        const earthOrbitDegrees = THREE.MathUtils.radToDeg(simTime);
        smallBodies.forEach((body) => {
          const meanAnomaly = body.ma + earthOrbitDegrees / Math.pow(body.a, 1.5);
          toVisualScale(eclipticToScene(elementsToEcliptic(body.a, body.e, body.i, body.om, body.w, meanAnomaly), position));
          body.mesh.position.copy(position);
          body.label.position.set(position.x, position.y + 0.5, position.z);
        });
      }
      if (tracked) controls.target.copy(tracked.position);
    },
    () => stats?.end()
  );

  return {
    setVisibility({ showOrbits, showNeos, showNeoLabels }) {
      planetOrbits.forEach((ring) => {
        ring.visible = showOrbits;
      });
      smallBodies.forEach((body) => {
        body.mesh.visible = showNeos;
        body.orbit.visible = showNeos && showOrbits;
        body.label.visible = showNeos && showNeoLabels;
      });
    },
    setTimeSpeed(speed) {
      state.timeSpeed = speed;
    },
    setPaused(paused) {
      state.paused = paused;
    },
    resetCamera() {
      tracked = null;
      onSelect?.(null);
      gsap.to(camera.position, { duration: 2, ...HOME_CAMERA, ease: 'power2.inOut' });
      gsap.to(controls.target, { duration: 2, x: 0, y: 0, z: 0, ease: 'power2.inOut' });
    },
    dispose: stage.dispose,
  };
}
