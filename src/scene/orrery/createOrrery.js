import * as THREE from 'three';
import StatsJS from 'stats.js';
import { createStage } from '../core/createStage';
import { createSun, createPlanet, createMoon } from './bodies';
import { createSmallBodySet } from './smallBodies';
import { createOrbitLine } from './orbitLines';
import { createCameraRig } from './cameraRig';
import { pickNearest } from './picking';
import { planetStyles, MOON_VISUAL_DISTANCE } from './visualLayout';
import { planetElements } from '../../data/planets';
import { asteroids } from '../../data/asteroids';
import featuredBodies from '../../data/featuredBodies.json';
import { comets } from '../../data/comets';
import { celestialFacts } from '../../data/celestialFacts';
import { smallBodyFacts } from '../../data/smallBodyFacts';
import { fetchNeos } from '../../services/neows';
import { eclipticToScene } from '../../lib/kepler';
import { moonGeocentricPosition, planetElementsAt, planetPosition } from '../../lib/ephemeris';
import { createClock, msFromJulianDate } from '../../lib/clock';
import { UNITS_PER_AU, blendSize, easeInOutCubic, scalePosition } from '../../lib/scale';

import asteroidTexture from '../../assets/textures/Asteroid/asteroid3.jpg';
import skyRight from '../../assets/textures/skybox/right.png';
import skyLeft from '../../assets/textures/skybox/left.png';
import skyTop from '../../assets/textures/skybox/top.png';
import skyBottom from '../../assets/textures/skybox/bottom.png';
import skyFront from '../../assets/textures/skybox/front.png';
import skyBack from '../../assets/textures/skybox/back.png';

const HOME_CAMERA = new THREE.Vector3(12, 16, 42);
const SCALE_TRANSITION_SECONDS = 1.8;
// Earth-Moon mass ratio: Earth's centre sits 1/82.3 of the Moon's offset away from the barycenter.
const EARTH_MOON_MASS_RATIO = 82.3;
// Faster simulated spin looks like noise; cap the on-screen rotation rate (radians per real second).
const MAX_SPIN_RATE = 2;
const TIME_REPORT_INTERVAL_MS = 250;

function addStarfield(scene, count = 1500) {
  const positions = new Float32Array(count * 3);
  const direction = new THREE.Vector3();
  for (let k = 0; k < count; k++) {
    direction.randomDirection().multiplyScalar(30000 + Math.random() * 20000).toArray(positions, k * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  scene.add(new THREE.Points(geometry, new THREE.PointsMaterial({ color: 0xffffff, size: 1.5, sizeAttenuation: false })));
}

/**
 * The CosmicVue orrery: every body positioned from its orbital elements for the simulation date,
 * shown at visual (compressed) or true scale with an animated transition between the two.
 *
 * options: initialScale ('visual' | 'true'), initialJd, speedIndex, paused, showStats
 * callbacks: onLoadProgress(0..1), onLoaded(), onTime({ jd, offsetFromNowMs }), onSelect({ key, facts } | null),
 *            onNeoStatus({ state: 'idle' | 'loading' | 'ready' | 'error', count })
 * Body keys: 'sun', 'moon', planet keys ('mars'), or slugs of small-body names ('1p-halley').
 */
export function createOrrery(mount, options = {}) {
  const {
    initialScale = 'visual',
    initialJd,
    speedIndex = 4,
    paused = false,
    showStats = false,
    onLoadProgress,
    onLoaded,
    onTime,
    onSelect,
    onNeoStatus,
  } = options;

  // The clock holds still until textures have loaded, so the date on screen starts at "now".
  let ready = false;
  const stage = createStage(mount, {
    // True scale spans a 1,000 km moon up close to Pluto's orbit, so depth must be logarithmic.
    near: 1e-6,
    far: 1e5,
    cameraPosition: HOME_CAMERA,
    renderer: { logarithmicDepthBuffer: true },
    onLoadProgress,
    onLoaded: () => {
      ready = true;
      onLoaded?.();
    },
  });
  const { scene, camera, controls, renderer } = stage;
  controls.maxDistance = 5000;

  scene.background = new THREE.CubeTextureLoader(stage.loadingManager).load([skyRight, skyLeft, skyTop, skyBottom, skyFront, skyBack]);
  addStarfield(scene);
  scene.add(new THREE.AmbientLight(0x404040, 0.6));
  // No distance falloff: at true scale Neptune would otherwise be black.
  scene.add(new THREE.PointLight(0xffffff, 3, 0, 0));

  // Bodies
  const sun = createSun(stage);
  const planets = planetElements.map((planet) => createPlanet(stage, planet));
  const planetByKey = Object.fromEntries(planets.map((planet) => [planet.key, planet]));
  const moon = createMoon(stage);

  const clock = createClock({ jd: initialJd, speedIndex, paused });

  let planetOrbits = [];
  let orbitsSampledAt = null;
  const planetOrbitGroup = new THREE.Group();
  scene.add(planetOrbitGroup);
  const samplePlanetOrbits = (jd) => {
    planetOrbits.forEach((orbit) => {
      orbit.line.geometry.dispose();
      orbit.line.material.dispose();
    });
    planetOrbitGroup.clear();
    planetOrbits = planets.map((planet) => {
      const material = new THREE.LineBasicMaterial({ color: planetStyles[planet.key].orbitColor, transparent: true, opacity: 0.8 });
      const orbit = createOrbitLine(planetElementsAt(planet.elements, jd), 512, material);
      planetOrbitGroup.add(orbit.line);
      return orbit;
    });
    orbitsSampledAt = jd;
  };
  samplePlanetOrbits(clock.jd);

  const catalogSets = [
    createSmallBodySet(stage, [...Object.values(asteroids), ...Object.values(featuredBodies)], {
      kind: 'asteroid',
      pointColor: 0xff6b6b,
      orbitColor: 0xff0000,
      meshMaterial: new THREE.MeshBasicMaterial({ map: stage.loadTexture(asteroidTexture, { color: true }) }),
      labels: true,
    }),
    createSmallBodySet(stage, Object.values(comets), {
      kind: 'comet',
      pointColor: 0xffffff,
      orbitColor: 0xa9a9a9,
      meshMaterial: new THREE.MeshBasicMaterial({ color: 0xffffff }),
      labels: true,
    }),
  ];
  let liveNeoSet = null;
  let neoRequest = null;

  // Scale mode
  const initialT = initialScale === 'true' ? 1 : 0;
  const scale = { t: initialT, from: initialT, to: initialT, elapsed: 0, animating: false };
  const setOrbitBlend = () => {
    planetOrbits.forEach((orbit) => orbit.setBlend(scale.t));
    catalogSets.forEach((set) => set.setOrbitBlend(scale.t));
    liveNeoSet?.setOrbitBlend(scale.t);
  };
  setOrbitBlend();

  // Visibility
  let visibility = { orbits: true, planetLabels: true, smallBodies: false, smallBodyLabels: false, liveNeos: false };
  const abortController = new AbortController();
  stage.onDispose(() => abortController.abort());

  const ensureLiveNeos = () => {
    if (neoRequest) return;
    onNeoStatus?.({ state: 'loading', count: 0 });
    neoRequest = fetchNeos(abortController.signal)
      .then((neos) => {
        liveNeoSet = createSmallBodySet(stage, neos, { kind: 'neo', pointColor: 0xff3b3b, orbitColor: 0x00fff0, orbitOpacity: 0.3 });
        liveNeoSet.setOrbitBlend(scale.t);
        applyVisibility();
        onNeoStatus?.({ state: 'ready', count: neos.length });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        console.error(error);
        neoRequest = null; // allow a retry on the next toggle
        onNeoStatus?.({ state: 'error', count: 0 });
      });
  };

  const applyVisibility = () => {
    planetOrbitGroup.visible = visibility.orbits;
    catalogSets.forEach((set) =>
      set.setVisibility({ bodies: visibility.smallBodies, orbits: visibility.orbits, labels: visibility.smallBodyLabels })
    );
    liveNeoSet?.setVisibility({ bodies: visibility.liveNeos, orbits: visibility.orbits, labels: false });
    if (visibility.liveNeos) ensureLiveNeos();
  };
  applyVisibility();

  // Camera & selection
  const rig = createCameraRig(camera, controls, HOME_CAMERA);
  let selectedKey = null;

  const bodyCandidates = () => [
    { key: 'sun', body: sun, kind: 'star' },
    { key: 'moon', body: moon, kind: 'moon' },
    ...planets.map((planet) => ({ key: planet.key, body: planet, kind: planet.key === 'pluto' ? 'dwarf planet' : 'planet' })),
  ].map(({ key, body, kind }) => ({
    key,
    name: body.name,
    kind,
    position: body.root.position,
    radius: body.root.scale.x,
    subject: { getPosition: () => body.root.position, getRadius: () => body.root.scale.x },
    getFacts: () => celestialFacts[key],
  }));

  const smallBodyCandidates = ({ visibleOnly }) =>
    [...catalogSets, liveNeoSet]
      .filter((set) => set && (!visibleOnly || set.visible))
      .flatMap((set) =>
        set.entries.map((entry) => ({
          key: entry.key,
          name: entry.body.name,
          kind: entry.kind,
          position: entry.position,
          radius: entry.radius,
          subject: { getPosition: () => entry.position, getRadius: () => entry.radius },
          getFacts: () => smallBodyFacts(entry.body, entry.kind),
        }))
      );

  // Small bodies are enlarged spheres at visual scale; frame them with surrounding context rather than filling the view.
  const SMALL_BODY_KINDS = new Set(['asteroid', 'comet', 'neo']);
  const select = (candidate, { viewRadii = SMALL_BODY_KINDS.has(candidate.kind) ? 40 : 4 } = {}) => {
    selectedKey = candidate.key;
    // Approach from the sunward side, slightly above the ecliptic, so bodies arrive lit.
    const position = candidate.subject.getPosition();
    const sunward = position.lengthSq() > 0 ? position.clone().negate().normalize().add(new THREE.Vector3(0, 0.35, 0)).normalize() : null;
    rig.flyTo(candidate.subject, { preferredDirection: sunward, viewRadii });
    onSelect?.({ key: candidate.key, facts: candidate.getFacts() });
  };

  // Click/tap (not drag) picks the nearest body on screen; planets win over small bodies.
  const pointerDown = { x: 0, y: 0, time: 0 };
  const handlePointerDown = (event) => Object.assign(pointerDown, { x: event.clientX, y: event.clientY, time: performance.now() });
  const handlePointerUp = (event) => {
    const moved = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
    if (moved > 6 || performance.now() - pointerDown.time > 400) return;
    const rect = renderer.domElement.getBoundingClientRect();
    const pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
    const hit =
      pickNearest(bodyCandidates(), camera, rect, pointer) ||
      pickNearest(smallBodyCandidates({ visibleOnly: true }), camera, rect, pointer, 10);
    if (hit) select(hit);
  };
  renderer.domElement.addEventListener('pointerdown', handlePointerDown);
  renderer.domElement.addEventListener('pointerup', handlePointerUp);
  stage.onDispose(() => {
    renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
    renderer.domElement.removeEventListener('pointerup', handlePointerUp);
  });

  let stats = null;
  if (showStats) {
    stats = new StatsJS();
    Object.assign(stats.dom.style, { position: 'absolute', top: '70px', left: '10px' });
    mount.appendChild(stats.dom);
    stage.onDispose(() => stats.dom.remove());
  }

  // Frame update
  const position = new THREE.Vector3();
  const scratch = new THREE.Vector3();
  const moonOffset = new THREE.Vector3();
  const moonVisualOffset = new THREE.Vector3();
  let sinceTimeReport = Infinity;
  // Reports the simulated date and how far it is from the real present (ms, positive = future).
  const reportTime = () => onTime?.({ jd: clock.jd, offsetFromNowMs: msFromJulianDate(clock.jd) - Date.now() });

  // Places every body for date `jd` at scale blend `t`.
  const updateBodies = (jd, t) => {
    // Resample planet orbits after large time jumps (their elements drift slowly).
    if (Math.abs(jd - orbitsSampledAt) > 3652.5) {
      samplePlanetOrbits(jd);
      setOrbitBlend();
      applyVisibility();
    }

    const moonGeocentric = eclipticToScene(moonGeocentricPosition(jd), moonOffset);

    planets.forEach((planet) => {
      eclipticToScene(planetPosition(planet.elements, jd), position);
      if (planet.key === 'earth') position.addScaledVector(moonGeocentric, -1 / EARTH_MOON_MASS_RATIO);
      scalePosition(position, t, scratch);
      planet.root.position.copy(position);
      planet.root.scale.setScalar(blendSize(planet.visualRadius, planet.trueRadius, t));
      planet.label.position.copy(position);
      planet.label.visible = visibility.planetLabels && selectedKey !== planet.key;
    });

    sun.root.scale.setScalar(blendSize(sun.visualRadius, sun.trueRadius, t));

    // Moon: real direction from Earth; distance blends from the visual separation to the real one.
    moonVisualOffset.copy(moonGeocentric).normalize().multiplyScalar(MOON_VISUAL_DISTANCE);
    moonOffset.multiplyScalar(UNITS_PER_AU).lerp(moonVisualOffset, 1 - t);
    moon.root.position.copy(planetByKey.earth.root.position).add(moonOffset);
    moon.root.scale.setScalar(blendSize(moon.visualRadius, moon.trueRadius, t));
    moon.label.position.copy(moon.root.position);
    // Only label the Moon once the camera is close enough to separate it from Earth.
    moon.label.visible =
      visibility.planetLabels && selectedKey !== 'moon' && camera.position.distanceTo(moon.root.position) < moonOffset.length() * 12;

    // Hidden sets are updated too, so searching or deep-linking to a hidden body lands on its true position.
    catalogSets.forEach((set) => set.update(jd, t));
    liveNeoSet?.update(jd, t);
  };

  updateBodies(clock.jd, scale.t);

  stage.start(
    (dt) => {
      stats?.begin();
      const jd = ready ? clock.tick(dt) : clock.jd;

      if (scale.animating) {
        scale.elapsed += dt / 1000;
        const p = Math.min(scale.elapsed / SCALE_TRANSITION_SECONDS, 1);
        scale.t = scale.from + (scale.to - scale.from) * easeInOutCubic(p);
        if (p >= 1) scale.animating = false;
        setOrbitBlend();
      }

      updateBodies(jd, scale.t);

      if (!clock.paused) {
        const spinRate = (dt / 1000) * clock.daysPerSecond * 24 * 2 * Math.PI;
        planets.forEach((planet) => {
          const rate = spinRate / planet.elements.rotationPeriod;
          const capped = Math.sign(rate) * Math.min(Math.abs(rate), (MAX_SPIN_RATE * dt) / 1000);
          planet.spin.rotation.y += capped;
          if (planet.clouds) planet.clouds.rotation.y += capped * 0.15;
        });
      }

      rig.update(dt);

      sinceTimeReport += dt;
      if (sinceTimeReport >= TIME_REPORT_INTERVAL_MS) {
        sinceTimeReport = 0;
        reportTime();
      }
    },
    () => stats?.end()
  );

  const planetKeys = planets.map((planet) => planet.key);

  return {
    planetKeys,
    setScale(mode) {
      const to = mode === 'true' ? 1 : 0;
      if (to === scale.to && (scale.animating || scale.t === to)) return;
      Object.assign(scale, { from: scale.t, to, elapsed: 0, animating: true });
    },
    setVisibility(next) {
      visibility = { ...visibility, ...next };
      applyVisibility();
    },
    setSpeedIndex(index) {
      clock.setSpeedIndex(index);
    },
    setPaused(paused) {
      clock.setPaused(paused);
    },
    setJulianDate(jd) {
      clock.setJulianDate(jd);
      // Move bodies now, so a focus() right after a date jump flies to the new positions.
      updateBodies(jd, scale.t);
      reportTime();
    },
    // Returns false if no body has that key (e.g. a live NEO that hasn't loaded).
    focus(key, { viewRadii } = {}) {
      const candidate =
        bodyCandidates().find((c) => c.key === key) || smallBodyCandidates({ visibleOnly: false }).find((c) => c.key === key);
      if (!candidate) return false;
      select(candidate, viewRadii ? { viewRadii } : {});
      return true;
    },
    // Everything that can be focused: [{ key, name, kind }].
    getSearchEntries() {
      const seen = new Set();
      return [...bodyCandidates(), ...smallBodyCandidates({ visibleOnly: false })]
        .filter(({ key }) => !seen.has(key) && seen.add(key))
        .map(({ key, name, kind }) => ({ key, name, kind }));
    },
    resetCamera() {
      selectedKey = null;
      rig.goHome();
      onSelect?.(null);
    },
    clearSelection() {
      selectedKey = null;
      onSelect?.(null);
    },
    dispose: stage.dispose,
  };
}
