import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextureLoader } from 'three';
import './AccurateOrrery.css';

// Import textures (ensure these paths are correct)
import sunTexture from './textures/Sun/sun1.jpg';
import mercuryTexture from './textures/Mercury/mercury.jpg';
import venusTexture from './textures/Venus/venus_surface.jpg';
import earthTexture from './textures/Earth/earth.jpg';
import marsTexture from './textures/Mars/mars.jpg';
import jupiterTexture from './textures/Jupiter/jupiter.jpg';
import saturnTexture from './textures/Saturn/saturn.jpg';
import uranusTexture from './textures/Uranus/uranus.jpg';
import neptuneTexture from './textures/Neptune/neptune.jpg';

function AccurateOrrery() {
  const mountRef = useRef(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    camera.position.set(0, 200, 500);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5); // Soft white light
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 2, 0);
    scene.add(pointLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Planet data (in millions of km, degrees, and Earth days)
    const planetData = [
      {
        name: 'Mercury',
        distance: 57.9,
        radius: 2439.7,
        tilt: 0.034,
        eccentricity: 0.205630,
        orbitalPeriod: 87.97,
        texture: mercuryTexture,
      },
      {
        name: 'Venus',
        distance: 108.2,
        radius: 6051.8,
        tilt: 177.4,
        eccentricity: 0.006772,
        orbitalPeriod: 224.70,
        texture: venusTexture,
      },
      {
        name: 'Earth',
        distance: 149.6,
        radius: 6371,
        tilt: 23.4,
        eccentricity: 0.0167086,
        orbitalPeriod: 365.26,
        texture: earthTexture,
      },
      {
        name: 'Mars',
        distance: 227.9,
        radius: 3389.5,
        tilt: 25.2,
        eccentricity: 0.0934,
        orbitalPeriod: 686.98,
        texture: marsTexture,
      },
      {
        name: 'Jupiter',
        distance: 778.5,
        radius: 69911,
        tilt: 3.1,
        eccentricity: 0.0489,
        orbitalPeriod: 4332.59,
        texture: jupiterTexture,
      },
      {
        name: 'Saturn',
        distance: 1434.0,
        radius: 58232,
        tilt: 26.7,
        eccentricity: 0.0565,
        orbitalPeriod: 10759.22,
        texture: saturnTexture,
      },
      {
        name: 'Uranus',
        distance: 2871.0,
        radius: 25362,
        tilt: 97.8,
        eccentricity: 0.0457,
        orbitalPeriod: 30688.5,
        texture: uranusTexture,
      },
      {
        name: 'Neptune',
        distance: 4495.0,
        radius: 24622,
        tilt: 28.3,
        eccentricity: 0.0113,
        orbitalPeriod: 60182,
        texture: neptuneTexture,
      },
    ];

    // Scale factors
    const sizeScale = 1 / 100000; // Scale down radii
    const distanceScale = 1 / 10; // Scale down distances

    // Texture loader
    const textureLoaderInstance = new TextureLoader();

    // Create Sun
    const sunRadius = 696340; // in km
    const sunGeometry = new THREE.SphereGeometry(sunRadius * sizeScale, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({
      map: textureLoaderInstance.load(sunTexture),
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Optional: Add Sun Light to illuminate planets
    const sunLight = new THREE.PointLight(0xffffff, 1.5, 0);
    sun.add(sunLight);

    // Create Planets
    const planets = planetData.map((planet) => {
      const geometry = new THREE.SphereGeometry(planet.radius * sizeScale, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        map: textureLoaderInstance.load(planet.texture),
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      return mesh;
    });

    // Optional: Create Orbit Lines for Visualization
    const createOrbit = (planet) => {
      const curve = new THREE.EllipseCurve(
        0, 0, // ax, aY
        planet.distance * distanceScale, // xRadius
        planet.distance * distanceScale * Math.sqrt(1 - planet.eccentricity ** 2), // yRadius
        0, 2 * Math.PI, // startAngle, endAngle
        false, // clockwise
        0 // rotation
      );

      const points = curve.getPoints(100);
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
      });
      const orbit = new THREE.Line(orbitGeometry, orbitMaterial);

      // Apply inclination
      orbit.rotation.x = (planet.tilt * Math.PI) / 180;

      scene.add(orbit);
    };

    planetData.forEach(createOrbit);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      const elapsed = Date.now() * 0.0001; // Adjust the multiplier for speed

      planetData.forEach((planet, index) => {
        const orbitRadius = planet.distance * distanceScale;
        const angle = (elapsed / planet.orbitalPeriod) * 2 * Math.PI;

        // Calculate position in elliptical orbit
        const a = orbitRadius; // Semi-major axis
        const e = planet.eccentricity; // Eccentricity
        const b = a * Math.sqrt(1 - e ** 2); // Semi-minor axis

        const x = a * Math.cos(angle);
        const z = b * Math.sin(angle);

        // Apply inclination
        const inclination = (planet.tilt * Math.PI) / 180;
        const y = z * Math.sin(inclination);
        const adjustedZ = z * Math.cos(inclination);

        planets[index].position.set(x, y, adjustedZ);

        // Rotate the planet on its axis
        planets[index].rotation.y += 0.01;
      });

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

    // Clean up on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef}></div>;
}

export default AccurateOrrery;
