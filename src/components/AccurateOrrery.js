import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './AccurateOrrery.css';
import { planetElements } from '../data/planets';
import {
  J2000,
  KM_PER_AU,
  eclipticToScene,
  elementsToEcliptic,
  julianDateFromMs,
  meanAnomalyAt,
  meanMotionFromAU,
  sampleOrbit,
} from '../lib/kepler';
import { disposeScene } from '../lib/disposeScene';

import sunTexture from './textures/Sun/sun1.jpg';
import mercuryTexture from './textures/Mercury/mercury.jpg';
import venusTexture from './textures/Venus/venus_surface.jpg';
import earthTexture from './textures/Earth/earth.jpg';
import marsTexture from './textures/Mars/mars.jpg';
import jupiterTexture from './textures/Jupiter/jupiter.jpg';
import saturnTexture from './textures/Saturn/saturn.jpg';
import uranusTexture from './textures/Uranus/uranus.jpg';
import neptuneTexture from './textures/Neptune/neptune.jpg';

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

// Set REACT_APP_NASA_API_KEY in .env.local; DEMO_KEY works but is heavily rate limited.
// Note: anything prefixed REACT_APP_ is embedded in the public bundle.
const NASA_API_KEY = process.env.REACT_APP_NASA_API_KEY || 'DEMO_KEY';
const SUN_RADIUS_KM = 696340;
const INITIAL_CAMERA = new THREE.Vector3(0, 1e9, 2e9);

async function fetchNeos(signal) {
  const response = await fetch(`https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=${NASA_API_KEY}`, { signal });
  if (!response.ok) throw new Error(`NASA NeoWs request failed (${response.status})`);
  const data = await response.json();

  return data.near_earth_objects
    .map(({ name, orbital_data: o }) => {
      if (!o) return null;
      const elements = {
        name,
        a: parseFloat(o.semi_major_axis) * KM_PER_AU,
        e: parseFloat(o.eccentricity),
        i: parseFloat(o.inclination),
        om: parseFloat(o.ascending_node_longitude),
        w: parseFloat(o.perihelion_argument),
        ma: parseFloat(o.mean_anomaly),
        meanMotion: parseFloat(o.mean_motion),
        epoch: parseFloat(o.epoch_osculation),
      };
      const valid = Object.values(elements).every((v) => typeof v === 'string' || Number.isFinite(v));
      return valid && elements.e < 1 ? elements : null;
    })
    .filter(Boolean);
}

function createLabel(name) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 512;
  canvas.height = 256;

  context.fillStyle = 'rgba(0, 0, 0, 0.7)';
  context.beginPath();
  context.roundRect(0, 0, canvas.width, canvas.height, 20);
  context.fill();

  context.font = 'Bold 72px Arial';
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(name, 256, 128);

  context.strokeStyle = 'white';
  context.lineWidth = 4;
  context.beginPath();
  context.roundRect(2, 2, canvas.width - 4, canvas.height - 4, 18);
  context.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false }));
}

// The glow shell is drawn from the inside (BackSide) and brightens toward the centre of the Sun.
// Custom shaders must include the log-depth chunks to depth-test correctly with logarithmicDepthBuffer.
function createSunGlowMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { glowColor: { value: new THREE.Color(0xfffff0) } },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying float intensity;
      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vec3 viewNormal = normalize(normalMatrix * normal);
        intensity = pow(max(dot(viewNormal, normalize(viewPosition.xyz)), 0.0), 6.0);
        gl_Position = projectionMatrix * viewPosition;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      #include <logdepthbuf_pars_fragment>
      uniform vec3 glowColor;
      varying float intensity;
      void main() {
        #include <logdepthbuf_fragment>
        gl_FragColor = vec4(glowColor * intensity, 1.0);
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
}

function AccurateOrrery({ onLoadProgress, onLoaded }) {
  const mountRef = useRef(null);
  const [focusedPlanet, setFocusedPlanet] = useState(null);
  const [neoStatus, setNeoStatus] = useState({ state: 'loading', count: 0 });
  const [now, setNow] = useState(() => new Date());

  const loadCallbacksRef = useRef({ onLoadProgress, onLoaded });
  loadCallbacksRef.current = { onLoadProgress, onLoaded };

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();

    // Distances are in km, so a logarithmic depth buffer is needed to avoid z-fighting across 1..1e13.
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1e13);
    camera.position.copy(INITIAL_CAMERA);

    const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 1e12;

    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (_url, loaded, total) => loadCallbacksRef.current.onLoadProgress?.(loaded / total);
    loadingManager.onLoad = () => loadCallbacksRef.current.onLoaded?.();
    const textureLoader = new THREE.TextureLoader(loadingManager);
    const loadColorTexture = (url) => {
      const texture = textureLoader.load(url);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    // Lighting: no distance falloff, otherwise planets at 1e8+ km receive effectively zero light.
    scene.add(new THREE.AmbientLight(0x404040, 0.6));
    scene.add(new THREE.PointLight(0xffffff, 3, 0, 0));

    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(SUN_RADIUS_KM, 64, 64),
      new THREE.MeshBasicMaterial({ map: loadColorTexture(sunTexture) })
    );
    scene.add(sun);
    scene.add(new THREE.Mesh(new THREE.SphereGeometry(SUN_RADIUS_KM * 15, 64, 64), createSunGlowMaterial()));

    const planets = planetElements.map((planet) => {
      const elements = { ...planet, a: planet.a * KM_PER_AU };
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(planet.radius, 32, 32),
        new THREE.MeshStandardMaterial({ map: loadColorTexture(planetTextures[planet.name]), roughness: 1, metalness: 0 })
      );
      scene.add(mesh);

      const orbitPoints = sampleOrbit(elements, 1024, () => new THREE.Vector3());
      scene.add(
        new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(orbitPoints),
          new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 })
        )
      );

      const label = createLabel(planet.name);
      scene.add(label);

      return { ...elements, meanMotion: meanMotionFromAU(planet.a), mesh, label };
    });

    // NEOs: one Points cloud (fixed pixel size so they stay visible at any zoom) plus orbit lines.
    let neos = [];
    let neoPoints = null;
    const abortController = new AbortController();
    fetchNeos(abortController.signal)
      .then((results) => {
        neos = results;
        const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x00fff0, transparent: true, opacity: 0.3 });
        neos.forEach((neo) => {
          const points = sampleOrbit(neo, 512, () => new THREE.Vector3());
          scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), orbitMaterial));
        });
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(neos.length * 3), 3));
        neoPoints = new THREE.Points(
          geometry,
          new THREE.PointsMaterial({ color: 0xff3b3b, size: 4, sizeAttenuation: false })
        );
        neoPoints.frustumCulled = false;
        scene.add(neoPoints);
        setNeoStatus({ state: 'ready', count: neos.length });
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        console.error(error);
        setNeoStatus({ state: 'error', count: 0 });
      });

    let focused = null;
    let labelsVisible = true;
    const previousFocusPosition = new THREE.Vector3();

    const focusOnPlanet = (planet) => {
      focused = planet;
      setFocusedPlanet(planet.name);
      controls.target.copy(planet.mesh.position);
      camera.position.copy(planet.mesh.position).add(new THREE.Vector3(0, planet.radius * 5, planet.radius * 10));
      previousFocusPosition.copy(planet.mesh.position);
    };

    const resetCamera = () => {
      focused = null;
      setFocusedPlanet(null);
      camera.position.copy(INITIAL_CAMERA);
      controls.target.set(0, 0, 0);
    };

    const handleKeyDown = (event) => {
      if (event.target.closest?.('input, textarea')) return;
      const index = parseInt(event.key, 10) - 1;
      if (index >= 0 && index < planets.length) focusOnPlanet(planets[index]);
      else if (event.key.toLowerCase() === 'l') labelsVisible = !labelsVisible;
      else if (event.key.toLowerCase() === 'r') resetCamera();
    };
    window.addEventListener('keydown', handleKeyDown);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const scratch = new THREE.Vector3();
    let lastFrame = performance.now();
    let frameId;

    const animate = (nowMs) => {
      frameId = requestAnimationFrame(animate);
      const dt = Math.min(nowMs - lastFrame, 100);
      lastFrame = nowMs;
      const jd = julianDateFromMs(Date.now());

      planets.forEach((planet) => {
        const meanAnomaly = meanAnomalyAt(planet.ma, planet.meanMotion, J2000, jd);
        eclipticToScene(
          elementsToEcliptic(planet.a, planet.e, planet.i, planet.om, planet.w, meanAnomaly),
          planet.mesh.position
        );
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

      controls.update();
      renderer.render(scene, camera);
    };
    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
      abortController.abort();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      controls.dispose();
      disposeScene(scene);
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="orrery-container">
      <div ref={mountRef}></div>
      <div className="controls-info">
        <p>Press 1-8 to focus on planets (1: Mercury, 2: Venus, ..., 8: Neptune)</p>
        <p>Press 'L' to toggle labels, 'R' to reset camera</p>
        <p>
          {neoStatus.state === 'loading' && 'Loading near-Earth objects from NASA...'}
          {neoStatus.state === 'ready' && `${neoStatus.count} near-Earth objects (red) from NASA NeoWs`}
          {neoStatus.state === 'error' && 'Could not load near-Earth objects from NASA right now.'}
        </p>
      </div>
      <div className="focused-planet-info">
        <div>{focusedPlanet ? `Focused on: ${focusedPlanet}` : 'Viewing entire solar system'}</div>
        <div>Positions for {now.toLocaleString()}</div>
      </div>
    </div>
  );
}

export default AccurateOrrery;
