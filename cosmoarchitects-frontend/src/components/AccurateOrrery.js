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
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
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
        semiMajorAxis: 57.9,
        radius: 2439.7,
        inclination: 7.0,
        eccentricity: 0.205630,
        orbitalPeriod: 87.97,
        texture: mercuryTexture,
      },
      {
        name: 'Venus',
        semiMajorAxis: 108.2,
        radius: 6051.8,
        inclination: 3.4,
        eccentricity: 0.006772,
        orbitalPeriod: 224.70,
        texture: venusTexture,
      },
      {
        name: 'Earth',
        semiMajorAxis: 149.6,
        radius: 6371,
        inclination: 0.0,
        eccentricity: 0.0167086,
        orbitalPeriod: 365.26,
        texture: earthTexture,
      },
      {
        name: 'Mars',
        semiMajorAxis: 227.9,
        radius: 3389.5,
        inclination: 1.9,
        eccentricity: 0.0934,
        orbitalPeriod: 686.98,
        texture: marsTexture,
      },
      {
        name: 'Jupiter',
        semiMajorAxis: 778.5,
        radius: 69911,
        inclination: 1.3,
        eccentricity: 0.0489,
        orbitalPeriod: 4332.59,
        texture: jupiterTexture,
      },
      {
        name: 'Saturn',
        semiMajorAxis: 1434.0,
        radius: 58232,
        inclination: 2.5,
        eccentricity: 0.0565,
        orbitalPeriod: 10759.22,
        texture: saturnTexture,
      },
      {
        name: 'Uranus',
        semiMajorAxis: 2871.0,
        radius: 25362,
        inclination: 0.8,
        eccentricity: 0.0457,
        orbitalPeriod: 30688.5,
        texture: uranusTexture,
      },
      {
        name: 'Neptune',
        semiMajorAxis: 4495.0,
        radius: 24622,
        inclination: 1.8,
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

    // Add Sun Light to illuminate planets
    const sunLight = new THREE.PointLight(0xffffff, 1.5, 0);
    sun.add(sunLight);

    // Create Planets and Orbits
    const planets = planetData.map((planet) => {
      const planetGroup = new THREE.Group();
      scene.add(planetGroup);

      // Create planet
      const geometry = new THREE.SphereGeometry(planet.radius * sizeScale, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        map: textureLoaderInstance.load(planet.texture),
      });
      const mesh = new THREE.Mesh(geometry, material);
      planetGroup.add(mesh);

      // Create orbit
      const orbitGeometry = new THREE.BufferGeometry();
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.3,
      });
      const orbitPoints = [];
      const segments = 256;

      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const e = planet.eccentricity;
        const a = planet.semiMajorAxis * distanceScale;
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        orbitPoints.push(new THREE.Vector3(x, 0, y));
      }

      orbitGeometry.setFromPoints(orbitPoints);
      const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
      planetGroup.add(orbit);

      // Apply inclination to the entire group
      planetGroup.rotation.x = (planet.inclination * Math.PI) / 180;

      return { mesh, group: planetGroup };
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      const elapsed = Date.now() * 0.00001; // Adjust the multiplier for speed

      planetData.forEach((planet, index) => {
        const a = planet.semiMajorAxis * distanceScale; // Semi-major axis
        const e = planet.eccentricity; // Eccentricity
        const angle = (elapsed / planet.orbitalPeriod) * 2 * Math.PI;

        // Calculate position in elliptical orbit
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(angle));
        const x = r * Math.cos(angle);
        const z = r * Math.sin(angle);

        // Update planet position
        planets[index].mesh.position.set(x, 0, z);

        // Rotate the planet on its axis (simplified)
        planets[index].mesh.rotation.y += 0.01 / planet.orbitalPeriod;
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