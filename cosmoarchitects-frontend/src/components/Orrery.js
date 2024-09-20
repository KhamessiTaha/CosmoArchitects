import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextureLoader, Raycaster, Vector2 } from 'three';
import './Orrery.css';
import LoadingScreen from './LoadingScreen';

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
import saturnRingTexture from './textures/Saturn/rings.jpg'; // Saturn's rings

function Orrery() {
  const mountRef = useRef(null);
  const [loadingProgress, setLoadingProgress] = useState(0); // Track loading progress
  const [isLoaded, setIsLoaded] = useState(false); // Toggle when loading completes
  const cameraRef = useRef(null);     // Camera ref
  const controlsRef = useRef(null);   // Controls ref
  const [showOrbits, setShowOrbits] = useState(true);
  const [speed, setSpeed] = useState(0.00001);
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  let selectedObject = null; // Track selected celestial body

  useLayoutEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      console.error("Mount reference is not available.");
      return;
    }

    // Set up scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    cameraRef.current = camera;  // Store camera in ref

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    // Loading Manager to track progress
    const loadingManager = new THREE.LoadingManager(
      () => {
        // On Load Completion
        setIsLoaded(true);
      },
      (itemUrl, itemsLoaded, itemsTotal) => {
        // Update progress based on loaded items
        const progress = Math.round((itemsLoaded / itemsTotal) * 100);
        console.log(`Loading: ${progress}%`);  // Added log to track progress
        setLoadingProgress(progress);
      }
    );
    
    loadingManager.onError = (url) => {
      console.error(`Error loading ${url}`);
    };

    // Set up OrbitControls for camera movement
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Enable inertia for smooth camera movement
    controlsRef.current = controls;  // Store controls in ref

    // Load textures
    const textureLoader = new TextureLoader(loadingManager);
    const sunTextureMap = textureLoader.load(sunTexture);
    const earthTextureMap = textureLoader.load(earthTexture);
    const marsTextureMap = textureLoader.load(marsTexture);
    const moonTextureMap = textureLoader.load(moonTexture);
    const mercuryTextureMap = textureLoader.load(mercuryTexture);
    const venusTextureMap = textureLoader.load(venusTexture);
    const jupiterTextureMap = textureLoader.load(jupiterTexture);
    const saturnTextureMap = textureLoader.load(saturnTexture);
    const uranusTextureMap = textureLoader.load(uranusTexture);
    const neptuneTextureMap = textureLoader.load(neptuneTexture);

    // Lighting
    const pointLight = new THREE.PointLight(0xffffff, 2, 1000);
    pointLight.position.set(0, 0, 0); // Sun as light source
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);

    // Sun
    const sunGeometry = new THREE.SphereGeometry(3, 64, 64);
    const sunMaterial = new THREE.MeshStandardMaterial({
      map: sunTextureMap,
      emissive: 0xffff00,
      emissiveIntensity: 3,
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Mercury
    const mercuryGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const mercuryMaterial = new THREE.MeshStandardMaterial({ map: mercuryTextureMap });
    const mercury = new THREE.Mesh(mercuryGeometry, mercuryMaterial);
    mercury.position.set(4, 0, 0);
    scene.add(mercury);

    // Venus
    const venusGeometry = new THREE.SphereGeometry(0.8, 32, 32);
    const venusMaterial = new THREE.MeshStandardMaterial({ map: venusTextureMap });
    const venus = new THREE.Mesh(venusGeometry, venusMaterial);
    venus.position.set(5, 0, 0);
    scene.add(venus);

    // Earth
    const earthGeometry = new THREE.SphereGeometry(1, 32, 32);
    const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTextureMap });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.position.set(6, 0, 0);
    scene.add(earth);

    // Mars
    const marsGeometry = new THREE.SphereGeometry(0.7, 32, 32);
    const marsMaterial = new THREE.MeshStandardMaterial({ map: marsTextureMap });
    const mars = new THREE.Mesh(marsGeometry, marsMaterial);
    mars.position.set(10, 0, 0);
    scene.add(mars);

    // Jupiter
    const jupiterGeometry = new THREE.SphereGeometry(2, 32, 32);
    const jupiterMaterial = new THREE.MeshStandardMaterial({ map: jupiterTextureMap });
    const jupiter = new THREE.Mesh(jupiterGeometry, jupiterMaterial);
    jupiter.position.set(15, 0, 0);
    scene.add(jupiter);

    // Saturn
    const saturnGeometry = new THREE.SphereGeometry(1.8, 32, 32);
    const saturnMaterial = new THREE.MeshStandardMaterial({ map: saturnTextureMap });
    const saturn = new THREE.Mesh(saturnGeometry, saturnMaterial);
    saturn.position.set(20, 0, 0);
    scene.add(saturn);

    // Saturn Rings
    const ringGeometry = new THREE.RingGeometry(2.2, 3, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      map: textureLoader.load(saturnRingTexture),
      side: THREE.DoubleSide,
      transparent: true,
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2; // Tilt the rings
    saturn.add(ring);

    // Uranus
    const uranusGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const uranusMaterial = new THREE.MeshStandardMaterial({ map: uranusTextureMap });
    const uranus = new THREE.Mesh(uranusGeometry, uranusMaterial);
    uranus.position.set(25, 0, 0);
    scene.add(uranus);

    // Neptune
    const neptuneGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const neptuneMaterial = new THREE.MeshStandardMaterial({ map: neptuneTextureMap });
    const neptune = new THREE.Mesh(neptuneGeometry, neptuneMaterial);
    neptune.position.set(30, 0, 0);
    scene.add(neptune);

    // Orbits
    const createOrbit = (radius, color) => {
      const orbitGeometry = new THREE.RingGeometry(radius, radius + 0.05, 64);
      const orbitMaterial = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2; // Make the ring horizontal
      return orbit;
    };

    if (showOrbits) {
      // Create orbits for all planets with distinct colors
      const mercuryOrbit = createOrbit(4, 0xaaaaaa);  // Gray for Mercury
      const venusOrbit = createOrbit(5, 0xffa500);    // Orange for Venus
      const earthOrbit = createOrbit(6, 0x0000ff);    // Blue for Earth
      const marsOrbit = createOrbit(10, 0xff0000);    // Red for Mars
      const jupiterOrbit = createOrbit(15, 0xffc0cb); // Pink for Jupiter
      const saturnOrbit = createOrbit(20, 0xffd700);  // Gold for Saturn
      const uranusOrbit = createOrbit(25, 0x00ffff);  // Cyan for Uranus
      const neptuneOrbit = createOrbit(30, 0x800080); // Purple for Neptune

      scene.add(mercuryOrbit, venusOrbit, earthOrbit, marsOrbit, jupiterOrbit, saturnOrbit, uranusOrbit, neptuneOrbit);
    }

    // Track the pointer and highlight the celestial body it's hovering over
    const onPointerMove = (event) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      raycaster.setFromCamera(pointer, camera);

      const intersects = raycaster.intersectObjects(scene.children);
      if (intersects.length > 0) {
        if (selectedObject) {
          selectedObject.material.emissive.setHex(0x000000); // Reset previously selected object's color
        }
        selectedObject = intersects[0].object;
        selectedObject.material.emissive.setHex(0x00ff00); // Highlight the new object
      }

      // Rotate planets
      sun.rotation.y += speed * 10;  // Sun rotation
      mercury.rotation.y += speed * 58.6; // Mercury day length
      venus.rotation.y += speed * 243;  // Venus day length
      earth.rotation.y += speed;  // Earth day length
      mars.rotation.y += speed * 1.03;  // Mars day length
      jupiter.rotation.y += speed * 0.413; // Jupiter day length
      saturn.rotation.y += speed * 0.445; // Saturn day length
      uranus.rotation.y += speed * 0.718; // Uranus day length
      neptune.rotation.y += speed * 0.671; // Neptune day length

      renderer.render(scene, camera);
    };

    window.addEventListener('pointermove', onPointerMove);
    animate();

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      mount.removeChild(renderer.domElement);
    };
  }, [showOrbits, speed]);

  return (
    <div>
      {!isLoaded ? ( // Show loading screen until fully loaded
        <LoadingScreen progress={loadingProgress} />
      ) : (
        <>
          <div ref={mountRef} className="orrery-container" />
          <div className="orrery-controls">
            <label>
              Show Orbits:
              <input
                type="checkbox"
                checked={showOrbits}
                onChange={(e) => setShowOrbits(e.target.checked)}
              />
            </label>
            <label>
              Simulation Speed:
              <input
                type="range"
                min="0.00001"
                max="0.001"
                step="0.00001"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
              />
            </label>
          </div>
        </>
      )}
    </div>
  );
}

export default Orrery;
