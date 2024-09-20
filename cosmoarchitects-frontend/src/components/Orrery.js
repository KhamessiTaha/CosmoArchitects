import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextureLoader, Raycaster, Vector2 } from 'three';
import './Orrery.css';

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
import saturnRingTexture from './textures/Saturn/saturn_ring.png'; // Saturn's rings

function Orrery() {
  const mountRef = useRef(null);
  const cameraRef = useRef(null);     // Camera ref
  const controlsRef = useRef(null);   // Controls ref
  const [showOrbits, setShowOrbits] = useState(true);
  const [speed, setSpeed] = useState(0.00001);
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  let selectedObject = null; // Track selected celestial body

  useEffect(() => {
    // Set up scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    cameraRef.current = camera;  // Store camera in ref

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Set up OrbitControls for camera movement
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Enable inertia for smooth camera movement
    controlsRef.current = controls;  // Store controls in ref

    // Load textures
    const textureLoader = new TextureLoader();
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
    const mercuryGeometry = new THREE.SphereGeometry(0.3, 64, 64);
    const mercuryMaterial = new THREE.MeshStandardMaterial({ map: mercuryTextureMap });
    const mercury = new THREE.Mesh(mercuryGeometry, mercuryMaterial);
    mercury.position.x = 4;  // Adjust orbit radius
    scene.add(mercury);

    // Venus
    const venusGeometry = new THREE.SphereGeometry(0.6, 64, 64);
    const venusMaterial = new THREE.MeshStandardMaterial({ map: venusTextureMap });
    const venus = new THREE.Mesh(venusGeometry, venusMaterial);
    venus.position.x = 5;  // Adjust orbit radius
    scene.add(venus);


    // Earth
    const earthGeometry = new THREE.SphereGeometry(0.5, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTextureMap });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.position.x = 6;
    earth.rotation.z = THREE.MathUtils.degToRad(23.5); // Axial tilt for realism
    scene.add(earth);

    // Earth's Moon
    const moonGeometry = new THREE.SphereGeometry(0.2, 64, 64);
    const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTextureMap });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(6.5, 0, 0);
    scene.add(moon);

    // Mars
    const marsGeometry = new THREE.SphereGeometry(0.6, 64, 64);
    const marsMaterial = new THREE.MeshStandardMaterial({ map: marsTextureMap });
    const mars = new THREE.Mesh(marsGeometry, marsMaterial);
    mars.position.x = 10;
    mars.rotation.z = THREE.MathUtils.degToRad(25); // Axial tilt for realism
    scene.add(mars);

    // Jupiter
    const jupiterGeometry = new THREE.SphereGeometry(2, 64, 64);
    const jupiterMaterial = new THREE.MeshStandardMaterial({ map: jupiterTextureMap });
    const jupiter = new THREE.Mesh(jupiterGeometry, jupiterMaterial);
    jupiter.position.x = 15;  // Adjust orbit radius
    scene.add(jupiter);

    // Example for Saturn:
    const saturnGeometry = new THREE.SphereGeometry(1.8, 64, 64);
    const saturnMaterial = new THREE.MeshStandardMaterial({ map: saturnTextureMap });
    const saturn = new THREE.Mesh(saturnGeometry, saturnMaterial);
    saturn.position.x = 20;  // Adjust orbit radius
    scene.add(saturn);

    // Saturn's rings
    const ringGeometry = new THREE.RingGeometry(2.2, 3.2, 64);
    const ringPos = ringGeometry.attributes.position;
    const ringVec = new THREE.Vector3();
    for (let i = 0; i < ringPos.count; i++) {
      ringVec.fromBufferAttribute(ringPos, i);
      ringGeometry.attributes.uv.setXY(i, ringVec.length() < 2.7 ? 0 : 1, 1); // Adjust UVs for proper texture mapping
    }
    const ringMaterial = new THREE.MeshBasicMaterial({
      map: textureLoader.load(saturnRingTexture),
      side: THREE.DoubleSide,
      transparent: true,
    });
    const rings = new THREE.Mesh(ringGeometry, ringMaterial);
    rings.rotation.x = Math.PI / 2;  // Make the ring horizontal
    rings.position.x = 20;  // Align with Saturn's position
    scene.add(rings);

    // Uranus
    const uranusGeometry = new THREE.SphereGeometry(1.4, 64, 64);
    const uranusMaterial = new THREE.MeshStandardMaterial({ map: uranusTextureMap });
    const uranus = new THREE.Mesh(uranusGeometry, uranusMaterial);
    uranus.position.x = 25;  // Adjust orbit radius
    scene.add(uranus);

    // Neptune
    const neptuneGeometry = new THREE.SphereGeometry(1.3, 64, 64);
    const neptuneMaterial = new THREE.MeshStandardMaterial({ map: neptuneTextureMap });
    const neptune = new THREE.Mesh(neptuneGeometry, neptuneMaterial);
    neptune.position.x = 30;  // Adjust orbit radius
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
      const jupiterOrbit = createOrbit(15, 0xffff00); // Yellow for Jupiter
      const saturnOrbit = createOrbit(20, 0xffa500);  // Orange for Saturn
      const uranusOrbit = createOrbit(25, 0x00ffff);  // Cyan for Uranus
      const neptuneOrbit = createOrbit(30, 0x0000ff); // Blue for Neptune
  
      // Add all orbits to the scene
      scene.add(mercuryOrbit, venusOrbit, earthOrbit, marsOrbit, jupiterOrbit, saturnOrbit, uranusOrbit, neptuneOrbit);
    }


    // Camera position
    camera.position.set(10, 5, 15);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Mercury Orbit and Rotation
      mercury.rotation.y += 0.01;
      mercury.position.x = Math.cos(Date.now() * speed * 1.6) * 4;
      mercury.position.z = Math.sin(Date.now() * speed * 1.6) * 4;

      // Venus Orbit and Rotation
      venus.rotation.y += 0.005;
      venus.position.x = Math.cos(Date.now() * speed * 1.2) * 5;
      venus.position.z = Math.sin(Date.now() * speed * 1.2) * 5;

      // Earth and Moon Orbit and Rotation
      earth.rotation.y += 0.01;
      earth.position.x = Math.cos(Date.now() * speed) * 6;
      earth.position.z = Math.sin(Date.now() * speed) * 6;
      moon.position.x = earth.position.x + Math.cos(Date.now() * 0.005) * 1;
      moon.position.z = earth.position.z + Math.sin(Date.now() * 0.005) * 1;

      // Mars rotation and orbit
      mars.rotation.y += 0.008;
      mars.position.x = Math.cos(Date.now() * speed) * 10;
      mars.position.z = Math.sin(Date.now() * speed) * 10;

      // Jupiter Orbit and Rotation
      jupiter.rotation.y += 0.02;
      jupiter.position.x = Math.cos(Date.now() * speed * 0.4) * 15;
      jupiter.position.z = Math.sin(Date.now() * speed * 0.4) * 15;

      // Saturn Orbit and Rotation (and rings)
      saturn.rotation.y += 0.02;
      saturn.position.x = Math.cos(Date.now() * speed * 0.3) * 20;
      saturn.position.z = Math.sin(Date.now() * speed * 0.3) * 20;
      rings.position.x = saturn.position.x;
      rings.position.z = saturn.position.z;

      // Uranus Orbit and Rotation
      uranus.rotation.y += 0.015;
      uranus.position.x = Math.cos(Date.now() * speed * 0.2) * 25;
      uranus.position.z = Math.sin(Date.now() * speed * 0.2) * 25;

      // Neptune Orbit and Rotation
      neptune.rotation.y += 0.01;
      neptune.position.x = Math.cos(Date.now() * speed * 0.1) * 30;
      neptune.position.z = Math.sin(Date.now() * speed * 0.1) * 30;


      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    const handleDoubleClick = (event) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects([saturn]); // Add other planets as needed

      if (intersects.length > 0) {
        selectedObject = intersects[0].object;
        const targetPosition = new THREE.Vector3(
          selectedObject.position.x + 5,
          selectedObject.position.y + 3,
          selectedObject.position.z + 5
        );

        camera.position.lerp(targetPosition, 0.05);
        controls.target.copy(selectedObject.position);
      }
    };

    window.addEventListener('dblclick', handleDoubleClick);

    // Clean up on component unmount
    return () => {
      mountRef.current.removeChild(renderer.domElement);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [showOrbits, speed]);

  return (
    <div>
      <div style={{ width: '100vw', height: '100vh' }} ref={mountRef}></div>
      <div className="menu">
        <label>
          Show Orbits:
          <input
            type="checkbox"
            checked={showOrbits}
            onChange={() => setShowOrbits(!showOrbits)}
          />
        </label>
        <label>
          Orbit Speed:
          <input
            type="range"
            min="0.0005"
            max="0.005"
            step="0.0001"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
}

export default Orrery;