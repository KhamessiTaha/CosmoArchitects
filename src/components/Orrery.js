import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { gsap } from 'gsap';
import './Orrery.css';
import StatsJS from 'stats.js';
import { Maximize2, Minimize2, Rewind, RotateCcw, FastForward, Pause, Play } from 'lucide-react';
import ObjectCard from './ObjectCard';
import { asteroids } from '../data/asteroids';
import { comets } from '../data/comets';
import { elementsToEcliptic, eclipticToScene, sampleOrbit } from '../lib/kepler';
import { toVisualScale } from '../lib/visualScale';
import { disposeScene } from '../lib/disposeScene';

// Textures for celestial bodies
import earthTexture from './textures/Earth/earth.jpg';
import sunTexture from './textures/Sun/sun.jpg';
import marsTexture from './textures/Mars/mars.jpg';
import moonTexture from './textures/Earth/moon.jpg';
import mercuryTexture from './textures/Mercury/mercury.jpg';
import venusTexture from './textures/Venus/venus_surface.jpg';
import jupiterTexture from './textures/Jupiter/jupiter2.jpg';
import saturnTexture from './textures/Saturn/saturn.jpg';
import uranusTexture from './textures/Uranus/uranus.jpg';
import neptuneTexture from './textures/Neptune/neptune.jpg';
import saturnRingTexture from './textures/Saturn/saturn_ring.png';
import earthbump from './textures/Earth/earthbump.jpg';
import earthcloud from './textures/Earth/earthcloud.jpg';
import earthcloudtrans from './textures/Earth/earthcloudtrans.jpg';
import earthspec from './textures/Earth/earthspec.jpg';
import plutoTexture from './textures/Pluto/plutomap.jpg';
import asteroidTexture from './textures/Asteroid/asteroid3.jpg';

import music1 from '../assets/music/Stars in Our Eyes.mp3';
import music2 from '../assets/music/Some Sand.mp3';
import music3 from '../assets/music/Whispers of the Stars.mp3';

import x1 from './textures/skybox/right.png';
import x2 from './textures/skybox/left.png';
import y1 from './textures/skybox/top.png';
import y2 from './textures/skybox/bottom.png';
import z1 from './textures/skybox/front.png';
import z2 from './textures/skybox/back.png';

const playlist = [music2, music1, music3];

const celestialData = {
  sun: {
    name: 'Sun',
    radius: 696340,
    distanceFromSun: 0,
    atmosphere: 'No',
    type: 'Star',
    starType: 'G-type Main Sequence (G2V)',
    composition: 'Hydrogen, Helium',
    age: '4.6 billion years',
    temperature: '5500°C (surface), 15 million°C (core)',
    discoveredBy: 'Ancient civilizations',
  },
  mercury: {
    name: 'Mercury',
    radius: 2439.7,
    distanceFromSun: 57.91,
    atmosphere: 'No',
    type: 'Planet',
    planetType: 'Terrestrial',
    orbitalPeriod: '88 days',
    temperature: '-173°C to 427°C',
    moonsCount: 0,
    discoveredBy: 'Ancient civilizations',
    age: '4.5 billion years',
  },
  venus: {
    name: 'Venus',
    radius: 6051.8,
    distanceFromSun: 108.2,
    atmosphere: 'Yes (Carbon Dioxide, Nitrogen)',
    type: 'Planet',
    planetType: 'Terrestrial',
    orbitalPeriod: '225 days',
    temperature: '462°C',
    moonsCount: 0,
    discoveredBy: 'Ancient civilizations',
    age: '4.5 billion years',
  },
  earth: {
    name: 'Earth',
    radius: 6371,
    distanceFromSun: 149.6,
    atmosphere: 'Yes (Nitrogen, Oxygen)',
    type: 'Planet',
    planetType: 'Terrestrial',
    orbitalPeriod: '365.25 days',
    temperature: 'Average 15°C',
    moonsCount: 1,
    hasLife: 'Yes',
    discoveredBy: 'Not applicable',
    age: '4.54 billion years',
  },
  mars: {
    name: 'Mars',
    radius: 3389.5,
    distanceFromSun: 227.9,
    atmosphere: 'Yes (Carbon Dioxide, Argon, Nitrogen)',
    type: 'Planet',
    planetType: 'Terrestrial',
    orbitalPeriod: '687 days',
    temperature: '-60°C (average)',
    moonsCount: 2,
    discoveredBy: 'Ancient civilizations',
    age: '4.6 billion years',
  },
  jupiter: {
    name: 'Jupiter',
    radius: 69911,
    distanceFromSun: 778.5,
    atmosphere: 'Yes (Hydrogen, Helium)',
    type: 'Planet',
    planetType: 'Gas Giant',
    orbitalPeriod: '11.86 years',
    temperature: '-145°C',
    moonsCount: 79,
    hasRings: 'Yes',
    discoveredBy: 'Galileo Galilei (1610)',
    age: '4.6 billion years',
  },
  saturn: {
    name: 'Saturn',
    radius: 58232,
    distanceFromSun: 1434,
    atmosphere: 'Yes (Hydrogen, Helium)',
    type: 'Planet',
    planetType: 'Gas Giant',
    orbitalPeriod: '29.45 years',
    temperature: '-178°C',
    moonsCount: 83,
    hasRings: 'Yes',
    discoveredBy: 'Galileo Galilei (1610)',
    age: '4.6 billion years',
  },
  uranus: {
    name: 'Uranus',
    radius: 25362,
    distanceFromSun: 2871,
    atmosphere: 'Yes (Hydrogen, Helium, Methane)',
    type: 'Planet',
    planetType: 'Ice Giant',
    orbitalPeriod: '84 years',
    temperature: '-224°C',
    moonsCount: 27,
    hasRings: 'Yes',
    discoveredBy: 'William Herschel (1781)',
    age: '4.5 billion years',
  },
  neptune: {
    name: 'Neptune',
    radius: 24622,
    distanceFromSun: 4495,
    atmosphere: 'Yes (Hydrogen, Helium, Methane)',
    type: 'Planet',
    planetType: 'Ice Giant',
    orbitalPeriod: '164.8 years',
    temperature: '-214°C',
    moonsCount: 14,
    hasRings: 'Yes',
    discoveredBy: 'Johann Galle (1846)',
    age: '4.5 billion years',
  },
  moon: {
    name: 'Moon',
    radius: 1737.1,
    distanceFromEarth: 0.384,
    atmosphere: 'No',
    type: 'Moon',
    planetType: 'Natural Satellite',
    orbitalPeriod: '27.3 days',
    discoveredBy: 'Not applicable',
    age: '4.5 billion years',
  },
  pluto: {
    name: 'Pluto',
    radius: 1188.3,
    distanceFromSun: 5906.4,
    atmosphere: 'Yes (Nitrogen, Methane, Carbon Monoxide)',
    type: 'Dwarf Planet',
    planetType: 'Ice Dwarf',
    orbitalPeriod: '248 years',
    temperature: '-229°C',
    moonsCount: 5,
    discoveredBy: 'Clyde Tombaugh (1930)',
    age: '4.5 billion years',
  },
};

// Visual-scale layout: orbit radius, relative orbital speed, relative spin speed, atmosphere glow.
const planetLayout = {
  mercury: { radius: 0.3, orbit: 8, orbitSpeed: 2, spin: 1 },
  venus: { radius: 0.6, orbit: 12, orbitSpeed: 1.5, spin: 0.5, glow: 0xffa500 },
  earth: { radius: 0.5, orbit: 16, orbitSpeed: 1, spin: 1, glow: 0x0000ff },
  mars: { radius: 0.6, orbit: 22, orbitSpeed: 0.8, spin: 0.8, glow: 0xff4500 },
  jupiter: { radius: 2, orbit: 30, orbitSpeed: 0.6, spin: 2, glow: 0xffff00 },
  saturn: { radius: 1.8, orbit: 40, orbitSpeed: 0.5, spin: 1.8, glow: 0xfffacd },
  uranus: { radius: 1.4, orbit: 50, orbitSpeed: 0.3, spin: 1.5, glow: 0x00ffff },
  neptune: { radius: 1.3, orbit: 60, orbitSpeed: 0.25, spin: 1.2, glow: 0x0000ff },
  pluto: { radius: 0.3, orbit: 70, orbitSpeed: 0.2, spin: 1.2, glow: 0x87ceeb },
};
const orbitColors = {
  mercury: 0xaaaaaa,
  venus: 0xffa500,
  earth: 0x0000ff,
  mars: 0xff0000,
  jupiter: 0xffff00,
  saturn: 0xffa500,
  uranus: 0x00ffff,
  neptune: 0x0000ff,
  pluto: 0x87ceeb,
};

// Simulation clock: radians of Earth's orbit per millisecond at 1x speed.
const EARTH_ORBIT_RATE = 0.00009;
// Planet self-rotation in radians per millisecond at 1x speed.
const SPIN_RATE = 0.0006;
const DEFAULT_CAMERA = { x: 10, y: 5, z: 30 };

// Rim-glow shader; the intensity is computed from the true per-vertex view direction.
function createGlowMaterial(color, base, power) {
  return new THREE.ShaderMaterial({
    uniforms: { glowColor: { value: new THREE.Color(color) } },
    vertexShader: `
      varying float intensity;
      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vec3 viewNormal = normalize(normalMatrix * normal);
        vec3 viewDirection = normalize(-viewPosition.xyz);
        intensity = pow(max(${base.toFixed(2)} - dot(viewNormal, viewDirection), 0.0), ${power.toFixed(1)});
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      varying float intensity;
      void main() {
        gl_FragColor = vec4(glowColor * intensity, 1.0);
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
}

function createLabel(text) {
  const fontSize = 60;
  const padding = 20;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = `${fontSize}px Arial`;
  canvas.width = Math.ceil(context.measureText(text).width + padding * 2);
  canvas.height = fontSize + padding;

  context.fillStyle = 'rgba(0, 0, 0, 0.7)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.font = `${fontSize}px Arial`;
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthWrite: false }));
  const height = 0.4;
  label.scale.set((height * canvas.width) / canvas.height, height, 1);
  return label;
}

function Orrery({ onLoadProgress, onLoaded }) {
  const mountRef = useRef(null);
  const orreryContainerRef = useRef(null);
  const audioRef = useRef(null);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showNeos, setShowNeos] = useState(false);
  const [showNeoLabels, setShowNeoLabels] = useState(false);
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedObjectData, setSelectedObjectData] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);

  // Values read by the render loop without re-running the scene setup.
  const simRef = useRef({ timeSpeed: 1, isPaused: false });
  // Scene objects whose visibility is driven by the menu toggles.
  const toggleablesRef = useRef(null);

  // Keep loader callbacks in refs so the scene is not rebuilt when a parent re-renders.
  const loadCallbacksRef = useRef({ onLoadProgress, onLoaded });
  loadCallbacksRef.current = { onLoadProgress, onLoaded };

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      orreryContainerRef.current.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 0, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (_url, loaded, total) => {
      loadCallbacksRef.current.onLoadProgress?.(loaded / total);
    };
    loadingManager.onLoad = () => loadCallbacksRef.current.onLoaded?.();

    const textureLoader = new THREE.TextureLoader(loadingManager);
    const loadColorTexture = (url) => {
      const texture = textureLoader.load(url);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    scene.background = new THREE.CubeTextureLoader(loadingManager).load([x1, x2, y1, y2, z1, z2]);

    // Starfield as a single draw call.
    const starPositions = new Float32Array(500 * 3);
    for (let k = 0; k < 500; k++) {
      const direction = new THREE.Vector3().randomDirection();
      direction.multiplyScalar(500 + Math.random() * 500).toArray(starPositions, k * 3);
    }
    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    scene.add(new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.8 })));

    // Lighting
    scene.add(new THREE.AmbientLight(0x404040, 0.2));
    scene.add(new THREE.PointLight(0xffffff, 250, 0));

    // Sun
    const sunRadius = 3;
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(sunRadius, 64, 64),
      new THREE.MeshBasicMaterial({ map: loadColorTexture(sunTexture) })
    );
    scene.add(sun);
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(sunRadius * 1.5, 64, 64), createGlowMaterial(0xffb34d, 0.7, 4)));

    // Planets
    const planetTextures = {
      mercury: mercuryTexture,
      venus: venusTexture,
      earth: earthTexture,
      mars: marsTexture,
      jupiter: jupiterTexture,
      saturn: saturnTexture,
      uranus: uranusTexture,
      neptune: neptuneTexture,
      pluto: plutoTexture,
    };
    const planets = {};
    Object.entries(planetLayout).forEach(([key, layout]) => {
      const materialOptions = { map: loadColorTexture(planetTextures[key]), shininess: 5 };
      if (key === 'earth') {
        Object.assign(materialOptions, {
          bumpMap: textureLoader.load(earthbump),
          bumpScale: 0.2,
          specularMap: textureLoader.load(earthspec),
          specular: new THREE.Color('black'),
        });
      }
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(layout.radius, 64, 64),
        new THREE.MeshPhongMaterial(materialOptions)
      );
      if (key === 'earth') mesh.rotation.z = THREE.MathUtils.degToRad(23.5);
      if (key === 'mars') mesh.rotation.z = THREE.MathUtils.degToRad(25);

      const group = new THREE.Group();
      group.add(mesh);
      if (layout.glow !== undefined) {
        const atmosphereRadius = layout.radius * 1.025;
        group.add(new THREE.Mesh(new THREE.SphereGeometry(atmosphereRadius, 64, 64), createGlowMaterial(layout.glow, 0.5, 2)));
      }
      group.position.x = layout.orbit;
      group.userData.objectKey = key;
      scene.add(group);
      planets[key] = group;
    });

    const clouds = new THREE.Mesh(
      new THREE.SphereGeometry(0.51, 64, 64),
      new THREE.MeshPhongMaterial({
        map: loadColorTexture(earthcloud),
        alphaMap: textureLoader.load(earthcloudtrans),
        transparent: true,
        opacity: 0.2,
        depthWrite: false,
      })
    );
    scene.add(clouds);

    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 64, 64),
      new THREE.MeshStandardMaterial({ map: loadColorTexture(moonTexture), roughness: 1, metalness: 0 })
    );
    moon.userData.objectKey = 'moon';
    scene.add(moon);

    // Saturn's rings: RingGeometry has one radial segment, so u = 0 (inner) / 1 (outer) spans the strip texture.
    const ringGeometry = new THREE.RingGeometry(2.2, 3.2, 120);
    const ringPositions = ringGeometry.attributes.position;
    const ringVertex = new THREE.Vector3();
    for (let k = 0; k < ringPositions.count; k++) {
      ringVertex.fromBufferAttribute(ringPositions, k);
      ringGeometry.attributes.uv.setXY(k, ringVertex.length() < 2.7 ? 0 : 1, 1);
    }
    const rings = new THREE.Mesh(
      ringGeometry,
      new THREE.MeshBasicMaterial({ map: loadColorTexture(saturnRingTexture), side: THREE.DoubleSide, transparent: true })
    );
    rings.rotation.x = Math.PI / 2;
    scene.add(rings);

    // Planet orbit rings
    const planetOrbits = Object.entries(planetLayout).map(([key, { orbit }]) => {
      const mesh = new THREE.Mesh(
        new THREE.RingGeometry(orbit, orbit + 0.05, 256),
        new THREE.MeshBasicMaterial({ color: orbitColors[key], side: THREE.DoubleSide })
      );
      mesh.rotation.x = Math.PI / 2;
      scene.add(mesh);
      return mesh;
    });

    // Asteroids and comets share geometry and materials; positions come from their real orbital elements.
    const smallBodyGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const asteroidMaterial = new THREE.MeshBasicMaterial({ map: loadColorTexture(asteroidTexture) });
    const cometMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const asteroidOrbitMaterial = new THREE.LineBasicMaterial({ color: 0xff0000, opacity: 0.7, transparent: true });
    const cometOrbitMaterial = new THREE.LineBasicMaterial({ color: 0xa9a9a9, opacity: 0.7, transparent: true });

    const smallBodies = [];
    const addSmallBodies = (catalog, material, orbitMaterial) => {
      Object.values(catalog).forEach((body) => {
        const mesh = new THREE.Mesh(smallBodyGeometry, material);
        const orbitPoints = sampleOrbit(body, 360, () => new THREE.Vector3(), toVisualScale);
        const orbit = new THREE.Line(new THREE.BufferGeometry().setFromPoints(orbitPoints), orbitMaterial);
        const label = createLabel(body.name);
        scene.add(mesh, orbit, label);
        smallBodies.push({ ...body, mesh, orbit, label });
      });
    };
    addSmallBodies(asteroids, asteroidMaterial, asteroidOrbitMaterial);
    addSmallBodies(comets, cometMaterial, cometOrbitMaterial);

    toggleablesRef.current = { planetOrbits, smallBodies };
    applyVisibility();

    // Stats
    const stats = new StatsJS();
    stats.showPanel(0);
    Object.assign(stats.dom.style, { position: 'absolute', top: '70px', left: '10px' });
    mount.appendChild(stats.dom);

    // Selection & camera tracking
    const selectable = [sun, moon, ...Object.values(planets)];
    let trackedObject = null;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handleDoubleClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(selectable, true)[0];

      if (!hit) {
        trackedObject = null;
        setSelectedObjectData(null);
        return;
      }

      let target = hit.object;
      while (target.parent && !selectable.includes(target)) target = target.parent;
      trackedObject = target;

      const bounds = new THREE.Sphere();
      new THREE.Box3().setFromObject(target).getBoundingSphere(bounds);
      const offset = bounds.radius * 3;
      controls.target.copy(target.position);
      gsap.to(camera.position, {
        duration: 2,
        x: target.position.x + offset,
        y: target.position.y + offset * 0.5,
        z: target.position.z + offset,
        ease: 'power2.inOut',
      });

      const key = target === sun ? 'sun' : target.userData.objectKey;
      setSelectedObjectData(celestialData[key] || null);
    };
    renderer.domElement.addEventListener('dblclick', handleDoubleClick);

    const handleKeyDown = (event) => {
      if (event.key.toLowerCase() !== 'r' || event.target.closest?.('input, textarea')) return;
      trackedObject = null;
      setSelectedObjectData(null);
      gsap.to(camera.position, { duration: 2, ...DEFAULT_CAMERA, ease: 'power2.inOut' });
      gsap.to(controls.target, { duration: 2, x: 0, y: 0, z: 0, ease: 'power2.inOut' });
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation loop
    let simTime = 0;
    let lastFrame = performance.now();
    let frameId;
    const ecliptic = new THREE.Vector3();

    const animate = (now) => {
      frameId = requestAnimationFrame(animate);
      stats.begin();

      // Clamp so returning to a background tab doesn't make everything jump.
      const dt = Math.min(now - lastFrame, 100);
      lastFrame = now;
      const { timeSpeed: speed, isPaused: paused } = simRef.current;

      if (!paused) {
        simTime += dt * EARTH_ORBIT_RATE * speed;
        const spin = dt * SPIN_RATE * speed;

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
          eclipticToScene(elementsToEcliptic(body.a, body.e, body.i, body.om, body.w, meanAnomaly), ecliptic);
          toVisualScale(ecliptic);
          body.mesh.position.copy(ecliptic);
          body.label.position.set(ecliptic.x, ecliptic.y + 0.5, ecliptic.z);
        });
      }

      if (trackedObject) controls.target.copy(trackedObject.position);
      controls.update();
      renderer.render(scene, camera);
      stats.end();
    };
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      gsap.killTweensOf(camera.position);
      gsap.killTweensOf(controls.target);
      renderer.domElement.removeEventListener('dblclick', handleDoubleClick);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      toggleablesRef.current = null;
      controls.dispose();
      disposeScene(scene);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
      mount.removeChild(stats.dom);
    };
    // applyVisibility reads refs only, so the scene is intentionally built once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibilityRef = useRef({ showOrbits, showNeos, showNeoLabels });
  visibilityRef.current = { showOrbits, showNeos, showNeoLabels };

  function applyVisibility() {
    const objects = toggleablesRef.current;
    if (!objects) return;
    const { showOrbits: orbits, showNeos: neos, showNeoLabels: labels } = visibilityRef.current;
    objects.planetOrbits.forEach((orbit) => {
      orbit.visible = orbits;
    });
    objects.smallBodies.forEach((body) => {
      body.mesh.visible = neos;
      body.orbit.visible = neos && orbits;
      body.label.visible = neos && labels;
    });
  }

  useEffect(applyVisibility, [showOrbits, showNeos, showNeoLabels]);

  useEffect(() => {
    simRef.current.timeSpeed = timeSpeed;
    simRef.current.isPaused = isPaused;
  }, [timeSpeed, isPaused]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = isMuted;
    if (!isMuted) {
      // Browsers block autoplay until the user interacts; fall back to the muted state.
      audio.play().catch(() => setIsMuted(true));
    }
  }, [isMuted, trackIndex]);

  useEffect(() => {
    const handleFullScreenChange = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const handleTimeControl = (factor) => {
    setTimeSpeed((prev) => Math.max(0.01, Math.min(prev * factor, 10)));
  };

  return (
    <div className={`orrery-container ${isFullScreen ? 'fullscreen' : ''}`} ref={orreryContainerRef}>
      <div style={{ width: '100%', height: '100%' }} ref={mountRef}></div>
      <audio
        ref={audioRef}
        src={playlist[trackIndex]}
        preload="none"
        onEnded={() => setTrackIndex((index) => (index + 1) % playlist.length)}
      />
      {selectedObjectData && (
        <ObjectCard objectData={selectedObjectData} onClose={() => setSelectedObjectData(null)} />
      )}
      <div className={`menu-toggle ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(!isMenuOpen)}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>

      {isMenuOpen && (
        <div className="menu space-theme">
          <label className="orbit-toggle">
            <input type="checkbox" checked={showOrbits} onChange={() => setShowOrbits(!showOrbits)} />
            <span className="slider"></span>
            <span className="label-text">Show Orbits</span>
          </label>
          <label className="comet-toggle">
            <input type="checkbox" checked={showNeos} onChange={() => setShowNeos(!showNeos)} />
            <span className="slider"></span>
            <span className="label-text">Show NEOs</span>
          </label>
          <label className="asteroid-toggle">
            <input type="checkbox" checked={showNeoLabels} onChange={() => setShowNeoLabels(!showNeoLabels)} />
            <span className="slider"></span>
            <span className="label-text">Show NEO Names</span>
          </label>
          <div className="time-control">
            <h3>Time Control</h3>
            <div className="button-group">
              <button onClick={() => handleTimeControl(0.5)} className="time-button slow">
                <Rewind size={14} /> Slower
              </button>
              <button onClick={() => setTimeSpeed(1)} className="time-button normal">
                <RotateCcw size={14} /> Normal
              </button>
              <button onClick={() => handleTimeControl(2)} className="time-button fast">
                <FastForward size={14} /> Faster
              </button>
              <button onClick={() => setIsPaused(!isPaused)} className={`time-button ${isPaused ? 'play' : 'pause'}`}>
                {isPaused ? <Play size={14} /> : <Pause size={14} />} {isPaused ? 'Play' : 'Pause'}
              </button>
            </div>
            <div className="speed-display">Current Speed: {timeSpeed.toFixed(2)}x</div>
          </div>
        </div>
      )}

      <button
        className="fullscreen-button"
        onClick={toggleFullScreen}
        aria-label={isFullScreen ? 'Exit full screen' : 'Enter full screen'}
      >
        {isFullScreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
      </button>
      <div className="controls-text">
        <p>Press 'R' to reset the camera.</p>
        <p>Double click on a celestial object to select/track it and view details.</p>
        <p>Control Menu is on Top Right.</p>
        <button className="mute-button" onClick={() => setIsMuted(!isMuted)}>
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>
    </div>
  );
}

export default Orrery;
