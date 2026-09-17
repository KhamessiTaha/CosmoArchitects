import * as THREE from 'three';
import { createStage } from '../core/createStage';
import { createHaloGlowMaterial } from '../core/materials';
import { createBadgeLabel } from '../core/labels';
import { planetElements } from '../../data/planets';
import { fetchNeos } from '../../services/neows';
import {
  J2000,
  KM_PER_AU,
  eclipticToScene,
  elementsToEcliptic,
  julianDateFromMs,
  meanAnomalyAt,
  meanMotionFromAU,
  sampleOrbit,
} from '../../lib/kepler';

import sunTexture from '../../assets/textures/Sun/sun1.jpg';
import mercuryTexture from '../../assets/textures/Mercury/mercury.jpg';
import venusTexture from '../../assets/textures/Venus/venus_surface.jpg';
import earthTexture from '../../assets/textures/Earth/earth.jpg';
import marsTexture from '../../assets/textures/Mars/mars.jpg';
import jupiterTexture from '../../assets/textures/Jupiter/jupiter.jpg';
import saturnTexture from '../../assets/textures/Saturn/saturn.jpg';
import uranusTexture from '../../assets/textures/Uranus/uranus.jpg';
import neptuneTexture from '../../assets/textures/Neptune/neptune.jpg';

const planetTextures = {
  Mercury: mercuryTexture,
  Venus: venusTexture,
  Earth: earthTexture,
  Mars: marsTexture,
  Jupiter: jupiterTexture,
  Saturn: saturnTexture,
  Uranus: uranusTexture,
  Neptune: neptuneTexture,
};

const SUN_RADIUS_KM = 696340;
const HOME_CAMERA = new THREE.Vector3(0, 1e9, 2e9);

function addOrbitLine(scene, elements, segments, material) {
  const points = sampleOrbit(elements, segments, () => new THREE.Vector3());
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), material));
}

/**
 * Builds the true-scale orrery (units: km) inside `mount`, positioned for the current date.
 * Callbacks: onLoadProgress(0..1), onLoaded(), onFocusChange(name | null),
 * onNeoStatus({ state: 'loading' | 'ready' | 'error', count }).
 * Returns a controller the UI drives; call dispose() on unmount.
 */
export function createAccurateOrrery(mount, { onLoadProgress, onLoaded, onFocusChange, onNeoStatus } = {}) {
  // Distances span 1..1e13 km, so a logarithmic depth buffer is needed to avoid z-fighting.
  const stage = createStage(mount, {
    near: 1,
    far: 1e13,
    cameraPosition: HOME_CAMERA,
    renderer: { logarithmicDepthBuffer: true },
    onLoadProgress,
    onLoaded,
  });
  const { scene, camera, controls } = stage;
  controls.dampingFactor = 0.05;
  controls.maxDistance = 1e12;

  // No distance falloff, otherwise planets at 1e8+ km receive effectively zero light.
  scene.add(new THREE.AmbientLight(0x404040, 0.6));
  scene.add(new THREE.PointLight(0xffffff, 3, 0, 0));

  scene.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(SUN_RADIUS_KM, 64, 64),
      new THREE.MeshBasicMaterial({ map: stage.loadTexture(sunTexture, { color: true }) })
    )
  );
  scene.add(new THREE.Mesh(new THREE.SphereGeometry(SUN_RADIUS_KM * 15, 64, 64), createHaloGlowMaterial(0xfffff0, 6)));

  const planetOrbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
  const planets = planetElements.map((planet) => {
    const elements = { ...planet, a: planet.a * KM_PER_AU };
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(planet.radius, 32, 32),
      new THREE.MeshStandardMaterial({ map: stage.loadTexture(planetTextures[planet.name], { color: true }), roughness: 1, metalness: 0 })
    );
    const label = createBadgeLabel(planet.name);
    scene.add(mesh, label);
    addOrbitLine(scene, elements, 1024, planetOrbitMaterial);
    return { ...elements, meanMotion: meanMotionFromAU(planet.a), mesh, label };
  });

  // NEOs: one Points cloud with a fixed pixel size so they stay visible at any zoom, plus orbit lines.
  let neos = [];
  let neoPoints = null;
  const abortController = new AbortController();
  stage.onDispose(() => abortController.abort());
  onNeoStatus?.({ state: 'loading', count: 0 });

  fetchNeos(abortController.signal)
    .then((results) => {
      neos = results;
      const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x00fff0, transparent: true, opacity: 0.3 });
      neos.forEach((neo) => addOrbitLine(scene, neo, 512, orbitMaterial));

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(neos.length * 3), 3));
      neoPoints = new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xff3b3b, size: 4, sizeAttenuation: false }));
      neoPoints.frustumCulled = false;
      scene.add(neoPoints);
      onNeoStatus?.({ state: 'ready', count: neos.length });
    })
    .catch((error) => {
      if (error.name === 'AbortError') return;
      console.error(error);
      onNeoStatus?.({ state: 'error', count: 0 });
    });

  let focused = null;
  let labelsVisible = true;
  const previousFocusPosition = new THREE.Vector3();
  const scratch = new THREE.Vector3();

  stage.start((dt) => {
    const jd = julianDateFromMs(Date.now());

    planets.forEach((planet) => {
      const meanAnomaly = meanAnomalyAt(planet.ma, planet.meanMotion, J2000, jd);
      eclipticToScene(elementsToEcliptic(planet.a, planet.e, planet.i, planet.om, planet.w, meanAnomaly), planet.mesh.position);
      // Real-time spin: one revolution per rotation period.
      planet.mesh.rotation.y += (2 * Math.PI * dt) / (planet.rotationPeriod * 3600000);

      const { label, mesh } = planet;
      label.position.set(mesh.position.x, mesh.position.y + planet.radius * 2, mesh.position.z);
      const scale = camera.position.distanceTo(label.position) * 0.12;
      label.scale.set(scale, scale * 0.5, 1);
      label.visible = labelsVisible && !focused;
    });

    if (neoPoints) {
      const positions = neoPoints.geometry.attributes.position;
      neos.forEach((neo, k) => {
        const meanAnomaly = meanAnomalyAt(neo.ma, neo.meanMotion, neo.epoch, jd);
        eclipticToScene(elementsToEcliptic(neo.a, neo.e, neo.i, neo.om, neo.w, meanAnomaly), scratch);
        positions.setXYZ(k, scratch.x, scratch.y, scratch.z);
      });
      positions.needsUpdate = true;
    }

    if (focused) {
      // Move the camera with the planet so the view doesn't drift as it orbits.
      scratch.subVectors(focused.mesh.position, previousFocusPosition);
      camera.position.add(scratch);
      previousFocusPosition.copy(focused.mesh.position);
      controls.target.copy(focused.mesh.position);
    }
  });

  return {
    planetNames: planets.map((planet) => planet.name),
    focusPlanet(index) {
      const planet = planets[index];
      if (!planet) return;
      focused = planet;
      controls.target.copy(planet.mesh.position);
      camera.position.copy(planet.mesh.position).add(new THREE.Vector3(0, planet.radius * 5, planet.radius * 10));
      previousFocusPosition.copy(planet.mesh.position);
      onFocusChange?.(planet.name);
    },
    toggleLabels() {
      labelsVisible = !labelsVisible;
    },
    resetCamera() {
      focused = null;
      camera.position.copy(HOME_CAMERA);
      controls.target.set(0, 0, 0);
      onFocusChange?.(null);
    },
    dispose: stage.dispose,
  };
}
