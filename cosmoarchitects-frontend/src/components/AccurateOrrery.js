import React, { useRef, useEffect, useState } from 'react';
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
  const [focusedPlanet, setFocusedPlanet] = useState(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1e15
    );
    camera.position.set(0, 1e9, 2e9);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 5, 0);
    scene.add(pointLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 1e12;

    // Planet data (in km, degrees, and Earth days)
    const planetData = [
      {
        name: 'Mercury',
        semiMajorAxis: 57.9e6,
        radius: 2439.7,
        inclination: 7.0,
        eccentricity: 0.205630,
        orbitalPeriod: 87.97,
        texture: mercuryTexture,
      },
      {
        name: 'Venus',
        semiMajorAxis: 108.2e6,
        radius: 6051.8,
        inclination: 3.4,
        eccentricity: 0.006772,
        orbitalPeriod: 224.70,
        texture: venusTexture,
      },
      {
        name: 'Earth',
        semiMajorAxis: 149.6e6,
        radius: 6371,
        inclination: 0.0,
        eccentricity: 0.0167086,
        orbitalPeriod: 365.26,
        texture: earthTexture,
      },
      {
        name: 'Mars',
        semiMajorAxis: 227.9e6,
        radius: 3389.5,
        inclination: 1.9,
        eccentricity: 0.0934,
        orbitalPeriod: 686.98,
        texture: marsTexture,
      },
      {
        name: 'Jupiter',
        semiMajorAxis: 778.5e6,
        radius: 69911,
        inclination: 1.3,
        eccentricity: 0.0489,
        orbitalPeriod: 4332.59,
        texture: jupiterTexture,
      },
      {
        name: 'Saturn',
        semiMajorAxis: 1434.0e6,
        radius: 58232,
        inclination: 2.5,
        eccentricity: 0.0565,
        orbitalPeriod: 10759.22,
        texture: saturnTexture,
      },
      {
        name: 'Uranus',
        semiMajorAxis: 2871.0e6,
        radius: 25362,
        inclination: 0.8,
        eccentricity: 0.0457,
        orbitalPeriod: 30688.5,
        texture: uranusTexture,
      },
      {
        name: 'Neptune',
        semiMajorAxis: 4495.0e6,
        radius: 24622,
        inclination: 1.8,
        eccentricity: 0.0113,
        orbitalPeriod: 60182,
        texture: neptuneTexture,
      },
    ];

    // Texture loader
    const textureLoaderInstance = new TextureLoader();

    // Create Sun
    const sunRadius = 696340; // in km
    const sunGeometry = new THREE.SphereGeometry(sunRadius, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({
      map: textureLoaderInstance.load(sunTexture),
      emissive: 0xffffff,
      emissiveIntensity: 500,
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Add Sun Light to illuminate planets
    const sunLight = new THREE.PointLight(0xffffff, 5000, 0);
    sun.add(sunLight);

    // Create a larger, transparent sphere around the sun for the glow effect
    const glowGeometry = new THREE.SphereGeometry(sunRadius * 15, 64, 64);
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        c: { type: "f", value: 0.5 },
        p: { type: "f", value: 5.5 },
        glowColor: { type: "c", value: new THREE.Color(0xfffff0) },
        viewVector: { type: "v3", value: camera.position }
      },
      vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
          vec3 actual_normal = vec3(modelMatrix * vec4(normal, 0.0));
          intensity = pow( dot(normalize(viewVector), actual_normal), 6.0 );
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4( glow, 1.0 );
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });

    const sunGlow = new THREE.Mesh(glowGeometry, glowMaterial);
    scene.add(sunGlow);

    // Create Planets and Orbits
    const planets = planetData.map((planet) => {
      const planetGroup = new THREE.Group();
      scene.add(planetGroup);

      // Create planet
      const geometry = new THREE.SphereGeometry(planet.radius, 32, 32);
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
        const a = planet.semiMajorAxis;
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

      return { mesh, group: planetGroup, name: planet.name };
    });

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      const elapsed = Date.now() * 0.00001; // Adjust the multiplier for speed

      planetData.forEach((planet, index) => {
        const a = planet.semiMajorAxis;
        const e = planet.eccentricity;
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
      sunGlow.material.uniforms.viewVector.value = new THREE.Vector3().subVectors(camera.position, sunGlow.position);

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

    // Focus on a specific planet
    const focusOnPlanet = (planetName) => {
      const planet = planets.find(p => p.name === planetName);
      if (planet) {
        const position = new THREE.Vector3();
        planet.mesh.getWorldPosition(position);
        controls.target.copy(position);
        camera.position.set(position.x, position.y + planet.mesh.geometry.parameters.radius * 10, position.z + planet.mesh.geometry.parameters.radius * 10);
        controls.update();
      }
    };

    // Add event listener for planet focus
    window.addEventListener('keydown', (event) => {
      const planetIndex = parseInt(event.key) - 1;
      if (planetIndex >= 0 && planetIndex < planets.length) {
        focusOnPlanet(planets[planetIndex].name);
      }
    });

    // Clean up on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', focusOnPlanet);
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div>
      <div ref={mountRef}></div>
      <div style={{position: 'absolute', top: 100, left: 10, color: 'white'}}>
        Press 1-8 to focus on planets (1: Mercury, 2: Venus, ..., 8: Neptune)
      </div>
    </div>
  );
}

export default AccurateOrrery;