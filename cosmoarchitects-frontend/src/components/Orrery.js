import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextureLoader, Raycaster, Vector2 } from 'three';
import './Orrery.css';

// Textures for Sun, Earth, Moon, Mars
import earthTexture from './textures/earth.jpg';
import sunTexture from './textures/sun.jpg';
import marsTexture from './textures/mars.jpg';
import moonTexture from './textures/moon.jpg';
import milkywayTexture from './textures/milkyway.jpg';

function Orrery() {
  const mountRef = useRef(null);
  const [showOrbits, setShowOrbits] = useState(true);
  const [speed, setSpeed] = useState(0.00001);
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  let selectedObject = null; // Track selected celestial body
  let controls, camera;

  useEffect(() => {
    // Set up scene, camera, and renderer
    const scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Set up OrbitControls for camera movement
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.1;
    controls.enableZoom = true;
    controls.enablePan = true;

    // Load textures
    const textureLoader = new TextureLoader();
    const sunTextureMap = textureLoader.load(sunTexture);
    const earthTextureMap = textureLoader.load(earthTexture);
    const marsTextureMap = textureLoader.load(marsTexture);
    const moonTextureMap = textureLoader.load(moonTexture);
    const milkywayTextureMap = textureLoader.load(milkywayTexture);

    // Background
    // scene.background = milkywayTextureMap;

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

    // Orbits
    const createOrbit = (radius, color) => {
      const orbitGeometry = new THREE.RingGeometry(radius, radius + 0.05, 64);
      const orbitMaterial = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2;
      return orbit;
    };

    if (showOrbits) {
      const earthOrbit = createOrbit(6, 0x0000ff); // Blue for Earth
      const marsOrbit = createOrbit(10, 0xff0000); // Red for Mars
      
      scene.add(earthOrbit, marsOrbit);
    }

    // Camera position
    camera.position.set(10, 5, 15);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate Earth
      earth.rotation.y += 0.01;

      // Orbit Earth and Moon
      earth.position.x = Math.cos(Date.now() * speed) * 6;
      earth.position.z = Math.sin(Date.now() * speed) * 6;
      moon.position.x = earth.position.x + Math.cos(Date.now() * 0.005) * 1;
      moon.position.z = earth.position.z + Math.sin(Date.now() * 0.005) * 1;

      // Mars rotation and orbit
      mars.rotation.y += 0.008;
      mars.position.x = Math.cos(Date.now() * speed) * 10;
      mars.position.z = Math.sin(Date.now() * speed) * 10;

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

    // Handle double-click to select objects and smoothly move the camera
    const handleDoubleClick = (event) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);

      const intersects = raycaster.intersectObjects([earth, moon, mars]);
      if (intersects.length > 0) {
        selectedObject = intersects[0].object; // Select the first intersected object
        const targetPosition = new THREE.Vector3(
          selectedObject.position.x + 5,
          selectedObject.position.y + 3,
          selectedObject.position.z + 5
        );

        // Animate camera movement toward the selected object
        new THREE.Vector3().lerpVectors(camera.position, targetPosition, 0.05);

        controls.target.copy(selectedObject.position); // Focus camera on the selected object
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
      <div ref={mountRef} className="orrery-container"></div>
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
