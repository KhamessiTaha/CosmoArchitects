import React, { useRef, useEffect, useState , useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextureLoader } from 'three';
import { gsap } from 'gsap';
import './Orrery.css';
import StatsJS from 'stats.js';
import { Maximize2, Minimize2 } from 'lucide-react';
import ObjectCard from './ObjectCard';



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
import earthbump from "./textures/Earth/earthbump.jpg" ;
import earthcloud from "./textures/Earth/earthcloud.jpg" ;
import earthcloudtrans from "./textures/Earth/earthcloudtrans.jpg" ;
import earthlights from "./textures/Earth/earthlights.jpg" ;
import earthspec from "./textures/Earth/earthspec.jpg" ;
import plutoTexture from "./textures/Pluto/plutomap.jpg";
import asteroidTexture from './textures/Asteroid/asteroid.avif';

import x1 from './textures/skybox/right.png' ;
import x2 from './textures/skybox/left.png' ;
import y1 from './textures/skybox/top.png' ;
import y2 from './textures/skybox/bottom.png' ;
import z1 from './textures/skybox/front.png'  ;
import z2 from './textures/skybox/back.png'  ;

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
    distanceFromSun: '0.384 (from Earth)', // distance from Earth in million km
    atmosphere: 'No',
    type: 'Moon',
    planetType: 'Natural Satellite',
    orbitalPeriod: '27.3 days',
    discoveredBy: 'Not applicable',
    age: '4.5 billion years', // Added age
  },
  pluto: {
    name: 'Pluto',
    radius: 1188.3, // in km
    distanceFromSun: 5906.4, // in million km
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

const neoData = [
  {
    name: 'Bennu',
    type: 'Near-Earth Asteroid',
    radius: 0.262,
    a: 1.126, // semi-major axis (AU)
    e: 0.204, // eccentricity
    i: 6.035, // inclination (degrees)
    omega: 2.061, // longitude of ascending node (degrees)
    w: 66.223, // argument of perihelion (degrees)
    M: 101.704, // mean anomaly (degrees)
    epoch: 2459000.5, // Julian date of orbital elements
    texture: asteroidTexture
  },
  {
    name: '99942 Apophis',
    type: 'Potentially Hazardous Asteroid',
    radius: 0.170,
    a: 0.922,
    e: 0.191,
    i: 3.331,
    omega: 204.058,
    w: 126.404,
    M: 180.977,
    epoch: 2459000.5,
    texture: asteroidTexture
  },
  {
    name: 'Comet NEOWISE',
    type: 'Near-Earth Comet',
    radius: 0.5,
    a: 3.045,
    e: 0.678,
    i: 128.937,
    omega: 317.291,
    w: 198.815,
    M: 0, // Assuming it's at perihelion at epoch
    epoch: 2459000.5,
    texture: asteroidTexture
  },
  // Add more NEOs as needed
];




function Orrery({ isInitializing,  }) {
  const mountRef = useRef(null);
  const cameraRef = useRef(null);     // Camera ref
  const controlsRef = useRef(null);   // Controls ref
  const sceneRef = useRef(null);
  const [showOrbits, setShowOrbits] = useState(true);
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedObjectData, setSelectedObjectData] = useState(null);
  const orreryContainerRef = useRef(null);
  const statsRef = useRef(null);
  const [showNEOs, setShowNEOs] = useState(true);
  const neosRef = useRef([]);
  const neoOrbitRefs = useRef([]);

  const animationRef = useRef({
    showOrbits: true,
    timeSpeed: 1,
    lastTime: 0,
    elapsedTime: 0,
    isPaused: false,
  });

  // Function to close the object card
  const handleCloseCard = () => {
    setSelectedObjectData(null); // Close the card by clearing the data
  };

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      if (orreryContainerRef.current.requestFullscreen) {
        orreryContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

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
    const bumpMap = textureLoader.load(earthbump);
    const specularMap = textureLoader.load(earthspec);
    const cloudTexture = textureLoader.load(earthcloud);
    const cloudTransparency = textureLoader.load(earthcloudtrans);
    const nightLights = textureLoader.load(earthlights);
    const plutoTextureMap = textureLoader.load(plutoTexture);

    // Create starfield
    const createStars = (scene, numStars, minDistance, maxDistance) => {
      const starGeometry = new THREE.SphereGeometry(0.4, 24, 24);
      const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
      for (let i = 0; i < numStars; i++) {
        const star = new THREE.Mesh(starGeometry, starMaterial);
    
        
        const theta = Math.random() * Math.PI * 2;  
        const phi = Math.random() * Math.PI;  
        
        // Ensure stars are placed beyond a minimum distance
        const distance = Math.random() * (maxDistance - minDistance) + minDistance;
    
        star.position.x = distance * Math.sin(phi) * Math.cos(theta);
        star.position.y = distance * Math.sin(phi) * Math.sin(theta);
        star.position.z = distance * Math.cos(phi);
    
        scene.add(star);
      }
    };

    createStars(scene, 500, 200, 500); 


   
    // Function to create a NEO
    const createNEO = (data) => {
      const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
      const material = new THREE.MeshStandardMaterial({
        map: textureLoader.load(data.texture),
        roughness: 1,
        metalness: 0,
      });
      const neo = new THREE.Mesh(geometry, material);
      neo.userData = data;
      return neo;
    };

    // Create NEOs
    neoData.forEach(data => {
      const neo = createNEO(data);
      neosRef.current.push(neo);
      scene.add(neo);
    });

    // Function to calculate NEO position using Kepler's equations
    const calculateNEOPosition = (neo, time) => {
      const { a, e, i, omega, w, M, epoch } = neo.userData;
      
      // Convert angles to radians
      const iRad = i * Math.PI / 180;
      const omegaRad = omega * Math.PI / 180;
      const wRad = w * Math.PI / 180;

      // Calculate mean anomaly at current time
      const n = Math.sqrt(1 / (a * a * a)); // mean motion
      const daysElapsed = (time - epoch) / 86400; // convert seconds to days
      const M0 = M * Math.PI / 180; // initial mean anomaly in radians
      const Mt = M0 + n * daysElapsed;

      // Solve Kepler's equation iteratively
      let E = Mt;
      for (let j = 0; j < 10; j++) {
        E = Mt + e * Math.sin(E);
      }

      // Calculate true anomaly
      const nu = 2 * Math.atan(Math.sqrt((1 + e) / (1 - e)) * Math.tan(E / 2));

      // Calculate distance from Sun
      const r = a * (1 - e * Math.cos(E));

      // Calculate position in orbital plane
      const x = r * (Math.cos(nu));
      const y = r * (Math.sin(nu));

      // Rotate to correct orbital orientation
      const xEcliptic = (Math.cos(wRad) * Math.cos(omegaRad) - Math.sin(wRad) * Math.sin(omegaRad) * Math.cos(iRad)) * x
                      + (-Math.sin(wRad) * Math.cos(omegaRad) - Math.cos(wRad) * Math.sin(omegaRad) * Math.cos(iRad)) * y;
      const yEcliptic = (Math.cos(wRad) * Math.sin(omegaRad) + Math.sin(wRad) * Math.cos(omegaRad) * Math.cos(iRad)) * x
                      + (-Math.sin(wRad) * Math.sin(omegaRad) + Math.cos(wRad) * Math.cos(omegaRad) * Math.cos(iRad)) * y;
      const zEcliptic = Math.sin(wRad) * Math.sin(iRad) * x + Math.cos(wRad) * Math.sin(iRad) * y;

      // Convert AU to your scene units (assuming 1 AU = 10 units in your scene)
      const sceneScale = 10;
      return new THREE.Vector3(xEcliptic * sceneScale, zEcliptic * sceneScale, -yEcliptic * sceneScale);
    };

    // Function to update NEO positions
    const updateNEOs = (time) => {
      neosRef.current.forEach(neo => {
        const position = calculateNEOPosition(neo, time);
        neo.position.copy(position);
        neo.rotation.y += 0.01;
      });
    };

    // Function to create an NEO orbit
    const createNEOOrbit = (neoData) => {
      const { a, e } = neoData;
      const segments = 128;
      const points = [];

      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const r = a * (1 - e * e) / (1 + e * Math.cos(theta));
        const x = r * Math.cos(theta);
        const z = r * Math.sin(theta);
        points.push(new THREE.Vector3(x * 10, 0, z * 10)); // Scale up the orbit for visibility
      }

      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffff00, opacity: 0.5, transparent: true });
      const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2; // Make the orbit horizontal
      return orbit;
    };

    // Create NEO orbits
    neoData.forEach((data, index) => {
      const neoOrbit = createNEOOrbit(data);
      neoOrbitRefs.current[index] = neoOrbit;
      scene.add(neoOrbit);
    });
   

    // Lighting
    const sunRadius = 3;

    const ambientLight = new THREE.AmbientLight(0x404040, 0.2); // Soft white light
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 250, 0);  // Brightness and range of light
    pointLight.position.set(0, 0); // Sun's position
    pointLight.castShadow = true;  // Enable shadow casting
    pointLight.shadow.mapSize.width = 4096; // Higher resolution shadows
    pointLight.shadow.mapSize.height = 4096;
    pointLight.shadow.camera.near = 1;
    pointLight.shadow.camera.far = 5000;  // Distance of shadow rendering

    scene.add(pointLight);


    

    
    // Function to create a planet with realistic lighting and atmosphere
    const createPlanetWithAtmosphere = (planet, radius, atmosphereRadius, color, intensity, opacity) => {
      // Update planet material for better light interaction
      planet.material = new THREE.MeshPhongMaterial({
        map: planet.material.map,
        bumpMap: planet.material.bumpMap,
        bumpScale: planet.material.bumpScale,
        specularMap: planet.material.specularMap,
        specular: planet.material.specular,
        shininess: 5,
      });

      const atmosphereGeometry = new THREE.SphereGeometry(atmosphereRadius, 64, 64);
      const atmosphereMaterial = new THREE.ShaderMaterial({
        uniforms: {
          sunPosition: { value: new THREE.Vector3(1, 0, 0) },
          planetPosition: { value: planet.position },
          c: { value: 0.1 },
          p: { value: 4.5 },
          glowColor: { value: new THREE.Color(color) },
          viewVector: { value: camera.position }
        },
        vertexShader: `
          uniform vec3 viewVector;
          varying float intensity;
          void main() {
            vec3 vNormal = normalize(normalMatrix * normal);
            vec3 vNormel = normalize(normalMatrix * viewVector);
            intensity = pow(0.5 - dot(vNormal, vNormel), 2.0);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 glowColor;
          varying float intensity;
          void main() {
            gl_FragColor = vec4(glowColor, 1.0) * intensity;
          }
        `,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
      });

      const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);

      const planetGroup = new THREE.Group();
      planetGroup.add(planet);
      planetGroup.add(atmosphere);

      return planetGroup;
    };
    // Planet parameters for atmospheres
    const planets = {
      earth: { radius: 0.5, atmosphereRadius: 0.511, color: 0x0000ff, intensity: 0.7, opacity: 0.1, positionX: 16 },
      venus: { radius: 0.6, atmosphereRadius: 0.621, color: 0xFFA500, intensity: 0.5, opacity: 0.4, positionX: 12 },
      mars: { radius: 0.6, atmosphereRadius: 0.624, color: 0xFF4500, intensity: 0.5, opacity: 0.25, positionX: 22 },
      jupiter: { radius: 2, atmosphereRadius: 2.05, color: 0xFFFF00, intensity: 0.4, opacity: 0.2, positionX: 30 },
      saturn: { radius: 1.8, atmosphereRadius: 1.85, color: 0xFFFACD, intensity: 0.3, opacity: 0.2, positionX: 40 },
      uranus: { radius: 1.4, atmosphereRadius: 1.47, color: 0x00FFFF, intensity: 0.3, opacity: 0.2, positionX: 50 },
      neptune: { radius: 1.3, atmosphereRadius: 1.33, color: 0x0000FF, intensity: 0.4, opacity: 0.25, positionX: 60 },
      pluto: { radius: 0.3, atmosphereRadius: 0.31, color: 0x87CEEB, intensity: 0.4, opacity: 0.15, positionX: 70 }
    };


    
    // Sun
    const sunGeometry = new THREE.SphereGeometry(sunRadius, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({
      map: sunTextureMap,
      emissive: new THREE.Color(0xffff00),
      emissiveIntensity: 100
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.castShadow = false;
    sun.receiveShadow = false;
    scene.add(sun);
    
    // Add a glow effect to the sun
    const sunGlowGeometry = new THREE.SphereGeometry(sunRadius * 1.5, 64, 64);
    const sunGlowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        viewVector: { value: camera.position }
      },
      vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(0.7 - dot(vNormal, vNormel), 4.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying float intensity;
        void main() {
          gl_FragColor = vec4(1.0, 0.7, 0.3, 1.0) * intensity;
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
    scene.add(sunGlow);

    
    

    // Mercury
    const mercuryGeometry = new THREE.SphereGeometry(0.3, 64, 64);
    const mercuryMaterial = new THREE.MeshStandardMaterial({ map: mercuryTextureMap,
      roughness: 1,
      metalness: 0, 
      emissive: new THREE.Color(0x111111),  // Add emissive property
      emissiveIntensity: 0.5,   });
    const mercury = new THREE.Mesh(mercuryGeometry, mercuryMaterial);
    mercury.position.x = 8;  // Adjust orbit radius
    scene.add(mercury);

    // Venus
    const venusGeometry = new THREE.SphereGeometry(planets.venus.radius, 64, 64);
    const venusMaterial = new THREE.MeshStandardMaterial({ map: venusTextureMap, 
      roughness: 1,
      metalness: 0,  });
    const venus = new THREE.Mesh(venusGeometry, venusMaterial);

    const venusWithAtmosphere = createPlanetWithAtmosphere(venus, planets.venus.radius , planets.venus.atmosphereRadius, planets.venus.color, planets.venus.intensity, planets.venus.opacity);
    venusWithAtmosphere.position.x = planets.venus.positionX;
    scene.add(venusWithAtmosphere);


    // Earth
    const earthGeometry = new THREE.SphereGeometry(planets.earth.radius, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({ map: earthTextureMap,
      bumpMap: bumpMap,
      bumpScale: 0.2,
      specularMap: specularMap,
      specular: new THREE.Color('black'),
      emissiveMap: nightLights,
      emissive: new THREE.Color('white'),
      emissiveIntensity: 1,
      color: new THREE.Color('rgb(70,130,180)'),
      roughness: 1,
      metalness: 0, 
  
    
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.rotation.z = THREE.MathUtils.degToRad(23.5); // Earth's axial tilt

    const earthWithAtmosphere = createPlanetWithAtmosphere(earth, planets.earth.radius, planets.earth.atmosphereRadius, planets.earth.color, planets.earth.intensity, planets.earth.opacity);
    earthWithAtmosphere.position.x = planets.earth.positionX;
    scene.add(earthWithAtmosphere);
    // Add cloud layer
    const cloudGeometry = new THREE.SphereGeometry(0.51, 64, 64); // Slightly larger than Earth
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: cloudTexture,
      alphaMap: cloudTransparency,
      transparent: true,
      opacity: 0.2,
      depthWrite: false,
    });
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloudMesh.position.x = earthWithAtmosphere.position.x;
    cloudMesh.position.y = earthWithAtmosphere.position.y;

    scene.add(cloudMesh);

    // Earth's Moon
    const moonGeometry = new THREE.SphereGeometry(0.2, 64, 64);
    const moonMaterial = new THREE.MeshStandardMaterial({ map: moonTextureMap,
      roughness: 1,
      metalness: 0,  });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(6.5, 0, 0);
    scene.add(moon);

    // Mars
    const marsGeometry = new THREE.SphereGeometry(planets.mars.radius, 64, 64);
    const marsMaterial = new THREE.MeshStandardMaterial({ map: marsTextureMap,
      roughness: 1,
      metalness: 0,  });
    const mars = new THREE.Mesh(marsGeometry, marsMaterial);
    mars.rotation.z = THREE.MathUtils.degToRad(25); // Mars's axial tilt

    const marsWithAtmosphere = createPlanetWithAtmosphere(mars,planets.mars.radius , planets.mars.atmosphereRadius, planets.mars.color, planets.mars.intensity, planets.mars.opacity);
    marsWithAtmosphere.position.x = planets.mars.positionX;
    scene.add(marsWithAtmosphere);

    // Jupiter
    const jupiterGeometry = new THREE.SphereGeometry(planets.jupiter.radius, 64, 64);
    const jupiterMaterial = new THREE.MeshStandardMaterial({ map: jupiterTextureMap,
      roughness: 1,
      metalness: 0,  });
    const jupiter = new THREE.Mesh(jupiterGeometry, jupiterMaterial);

    const jupiterWithAtmosphere = createPlanetWithAtmosphere(jupiter,planets.jupiter.radius , planets.jupiter.atmosphereRadius, planets.jupiter.color, planets.jupiter.intensity, planets.jupiter.opacity);
    jupiterWithAtmosphere.position.x = planets.jupiter.positionX;
    scene.add(jupiterWithAtmosphere);


    // Saturn
    const saturnGeometry = new THREE.SphereGeometry(planets.saturn.radius, 64, 64);
    const saturnMaterial = new THREE.MeshStandardMaterial({ map: saturnTextureMap,
      roughness: 1,
      metalness: 0,  });
    const saturn = new THREE.Mesh(saturnGeometry, saturnMaterial);

    const saturnWithAtmosphere = createPlanetWithAtmosphere(saturn,planets.saturn.radius , planets.saturn.atmosphereRadius, planets.saturn.color, planets.saturn.intensity, planets.saturn.opacity);
    saturnWithAtmosphere.position.x = planets.saturn.positionX;
    scene.add(saturnWithAtmosphere);

    // Saturn's rings
    const ringGeometry = new THREE.RingGeometry(2.2, 3.2, 120);
    const ringPos = ringGeometry.attributes.position;
    const ringVec = new THREE.Vector3();
    for (let i = 0; i < ringPos.count; i++) {
      ringVec.fromBufferAttribute(ringPos, i);
      ringGeometry.attributes.uv.setXY(i, ringVec.length() < 2.7 ? 0 : 1, 1); // UVs for texture mapping
    }
    const ringMaterial = new THREE.MeshBasicMaterial({
      map: textureLoader.load(saturnRingTexture),
      side: THREE.DoubleSide,
      transparent: true,
      roughness: 1,
      metalness: 0,
    });
    const rings = new THREE.Mesh(ringGeometry, ringMaterial);
    rings.rotation.x = Math.PI / 2;  // Make the ring horizontal
    rings.position.x = 40;  // Align with Saturn's position
    scene.add(rings);

    // Uranus
    const uranusGeometry = new THREE.SphereGeometry(planets.uranus.radius, 64, 64);
    const uranusMaterial = new THREE.MeshStandardMaterial({ map: uranusTextureMap,
      roughness: 1,
      metalness: 0,  });
    const uranus = new THREE.Mesh(uranusGeometry, uranusMaterial);

    const uranusWithAtmosphere = createPlanetWithAtmosphere(uranus,planets.uranus.radius , planets.uranus.atmosphereRadius, planets.uranus.color, planets.uranus.intensity, planets.uranus.opacity);
    uranusWithAtmosphere.position.x = planets.uranus.positionX;
    scene.add(uranusWithAtmosphere);

    // Neptune
    const neptuneGeometry = new THREE.SphereGeometry(planets.neptune.radius, 64, 64);
    const neptuneMaterial = new THREE.MeshStandardMaterial({ map: neptuneTextureMap,
      roughness: 1,
      metalness: 0,  });
    const neptune = new THREE.Mesh(neptuneGeometry, neptuneMaterial);

    const neptuneWithAtmosphere = createPlanetWithAtmosphere(neptune,planets.neptune.radius , planets.neptune.atmosphereRadius, planets.neptune.color, planets.neptune.intensity, planets.neptune.opacity);
    neptuneWithAtmosphere.position.x = planets.neptune.positionX;
    scene.add(neptuneWithAtmosphere);

    // Pluto
    const plutoGeometry = new THREE.SphereGeometry(planets.pluto.radius, 64, 64);
    const plutoMaterial = new THREE.MeshStandardMaterial({ map: plutoTextureMap, 
      roughness: 1,
      metalness: 0,  });
    const pluto = new THREE.Mesh(plutoGeometry, plutoMaterial);

    const plutoWithAtmosphere = createPlanetWithAtmosphere(pluto, planets.pluto.radius , planets.pluto.atmosphereRadius, planets.pluto.color, planets.pluto.intensity, planets.pluto.opacity);
    plutoWithAtmosphere.position.x = planets.pluto.positionX;
    scene.add(plutoWithAtmosphere);

    // Sun
    sun.castShadow = false; // The Sun doesn't cast shadows on itself
    sun.receiveShadow = false;

    // Mercury
    mercury.castShadow = true;
    mercury.receiveShadow = true;

    // Venus
    venus.castShadow = true;
    venus.receiveShadow = true;

    // Earth
    earth.castShadow = true;
    earth.receiveShadow = true;

    // Moon
    moon.castShadow = true;
    moon.receiveShadow = true;

    // Mars
    mars.castShadow = true;
    mars.receiveShadow = true;

    // Jupiter
    jupiter.castShadow = true;
    jupiter.receiveShadow = true;

    // Saturn and Rings
    saturn.castShadow = true;
    saturn.receiveShadow = true;
    rings.castShadow = true; // Enable shadows on Saturn's rings
    rings.receiveShadow = true;

    // Uranus 
    uranus.castShadow = true;
    uranus.receiveShadow = true;
    
    // Neptune
    neptune.castShadow = true;
    neptune.receiveShadow = true;

    // Pluto
    pluto.castShadow = true;
    pluto.receiveShadow = true;

    renderer.shadowMap.enabled = true;  // Enable shadows globally
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;  // Soft shadows for smooth transitions
    
    const updatePlanetLighting = (planet, lightPosition) => {
      if (planet.material && planet.material.emissive) {  // Check if emissive property exists
        const planetPosition = planet.position.clone();
        const lightDirection = lightPosition.clone().sub(planetPosition).normalize();
        // Calculate how much light the planet gets on the sun-facing side
        const lightIntensity = Math.max(0, lightDirection.dot(planetPosition.normalize())) * 0.7;
        planet.material.emissive.setHSL(0.1, 0.9, lightIntensity);
      }
    };


    const cubeTextureLoader = new THREE.CubeTextureLoader();
    const reflectionMap = cubeTextureLoader.load([
      x1, // +X face
      x2, // -X face
      y1, // +Y face
      y2, // -Y face
      z1, // +Z face
      z2, // -Z face
    ]);

    scene.background = reflectionMap;  // Use this as the scene's skybox background for realism


    const getObjectRadius = (object) => {
      if (object.geometry && object.geometry.boundingSphere) {
        return object.geometry.boundingSphere.radius;
      } else if (object.children && object.children.length > 0) {
        // For groups (planets with atmospheres), get the radius of the first child
        return object.children[0].geometry.boundingSphere.radius;
      }
      return 1; // Default radius if we can't determine it
    };
    
    // Planets with and without atmospheres (only planet meshes are selectable)
    const selectableObjects = [
      mercury, 
      venusWithAtmosphere,
      earthWithAtmosphere,
      marsWithAtmosphere,
      jupiterWithAtmosphere,
      saturnWithAtmosphere,
      uranusWithAtmosphere,
      neptuneWithAtmosphere,
      plutoWithAtmosphere,
      moon,
      sun
    ];
    let selectedObject = null;  // Store the selected planet
    let isTracking = false; 



    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    // HandleDoubleClick function
    const handleDoubleClick = (event) => {
      event.preventDefault();
    
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(selectableObjects, true);
    
      if (intersects.length > 0) {
        let targetObject = intersects[0].object;
    
        // Find the top-level parent (either the planet mesh or the atmosphere group)
        while (targetObject.parent && !selectableObjects.includes(targetObject)) {
          targetObject = targetObject.parent;
        }
    
        selectedObject = targetObject;
        isTracking = true;
    
        controls.target.copy(selectedObject.position);
    
        const objectRadius = getObjectRadius(targetObject);
        const offsetDistance = objectRadius * 3;
    
        // gsap zoom-in effect to focus the camera on the selected object
        gsap.to(camera.position, {
          duration: 2,
          x: targetObject.position.x + offsetDistance,
          y: targetObject.position.y + offsetDistance * 0.5,
          z: targetObject.position.z + offsetDistance,
          ease: 'power2.inOut',
          onUpdate: () => {
            controls.update();
          }
        });
    
        // Map the selected object to its celestial data
        let objectKey = '';
    
        if (targetObject === mercury) objectKey = 'mercury';
        else if (targetObject === venusWithAtmosphere) objectKey = 'venus';
        else if (targetObject === earthWithAtmosphere) objectKey = 'earth';
        else if (targetObject === marsWithAtmosphere) objectKey = 'mars';
        else if (targetObject === jupiterWithAtmosphere) objectKey = 'jupiter';
        else if (targetObject === saturnWithAtmosphere) objectKey = 'saturn';
        else if (targetObject === uranusWithAtmosphere) objectKey = 'uranus';
        else if (targetObject === neptuneWithAtmosphere) objectKey = 'neptune';
        else if (targetObject === plutoWithAtmosphere) objectKey = 'pluto';
        else if (targetObject === moon) objectKey = 'moon';
        else if (targetObject === sun) objectKey = 'sun'; // Handle the Sun selection
    
        // Retrieve object data from celestialData
        const objectData = celestialData[objectKey] || {
          name: 'Unknown Object',
          type: targetObject.type || 'Unknown',
          radius: 'Unknown',
          distanceFromSun: 'Unknown',
          atmosphere: 'Unknown',
          planetType: 'Unknown',
          hasRings: 'Unknown',
        };
    
        // Update the card with the selected object data
        setSelectedObjectData(objectData);
      } else {
        selectedObject = null;
        isTracking = false;
        setSelectedObjectData(null); // Clear the data when no object is selected
      }
    };
    
    
    
    

    window.addEventListener('dblclick', handleDoubleClick);

    // Handle reset camera on "R" key press
    const handleKeyPress = (event) => {
      if (event.key === 'r' || event.key === 'R') {
        // Reset the camera to its default position
        gsap.to(camera.position, {
          duration: 2,
          x: 10,  // Default camera position
          y: 5,
          z: 30,
          ease: 'power2.inOut',
          onUpdate: () => {
            camera.lookAt(0, 0, 0);  // Focus back to the center (default)
            controls.update();
          }
        });
        gsap.to(controls.target, {
          duration: 2,
          x: 0,
          y: 0,
          z: 0,
          ease: 'power2.inOut',
          onUpdate: () => {
            controls.update();
          }
        });

        selectedObject = sun;
        setSelectedObjectData(null);  // Clear the selected planet
        isTracking = false;     // Disable tracking
      }
    };
    window.addEventListener('keypress', handleKeyPress);

    sceneRef.current = scene;
    cameraRef.current = camera;
    controlsRef.current = controls;


    // Orbits
    const createOrbit = (radius, color) => {
      const orbitGeometry = new THREE.RingGeometry(radius, radius + 0.05, 256);
      const orbitMaterial = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
      const orbit = new THREE.Mesh(orbitGeometry, orbitMaterial);
      orbit.rotation.x = Math.PI / 2; // Make the ring horizontal
      orbit.isOrbit = true;
      return orbit;
    };

    
      // Create orbits for all planets with distinct colors
      const mercuryOrbit = createOrbit(8, 0xaaaaaa);  // Gray for Mercury
      const venusOrbit = createOrbit(12, 0xffa500);    // Orange for Venus
      const earthOrbit = createOrbit(16, 0x0000ff);    // Blue for Earth
      const marsOrbit = createOrbit(22, 0xff0000);    // Red for Mars
      const jupiterOrbit = createOrbit(30, 0xffff00); // Yellow for Jupiter
      const saturnOrbit = createOrbit(40, 0xffa500);  // Orange for Saturn
      const uranusOrbit = createOrbit(50, 0x00ffff);  // Cyan for Uranus
      const neptuneOrbit = createOrbit(60, 0x0000ff); // Blue for Neptune
      const plutoOrbit = createOrbit(70, 0x87CEEB); 

      const orbits = [
        createOrbit(8, 0xaaaaaa),
        createOrbit(12, 0xffa500),
        createOrbit(16, 0x0000ff),
        createOrbit(22, 0xff0000),
        createOrbit(30, 0xffff00),
        createOrbit(40, 0xffa500),
        createOrbit(50, 0x00ffff),
        createOrbit(60, 0x0000ff),
        createOrbit(70, 0x87CEEB)
      ];
  
      // Add all orbits to the scene
      orbits.forEach(orbit => {
        orbit.visible = animationRef.current.showOrbits;
        scene.add(orbit);
      });
      

    // Set up stats.js
    const stats = new StatsJS();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    stats.dom.style.position = 'absolute';
    stats.dom.style.top = '70px';
    stats.dom.style.left = '10px';
    mountRef.current.appendChild(stats.dom);
    statsRef.current = stats;


    

    // Animation loop!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    const animate = (currentTime) => {
      requestAnimationFrame(animate);
      if (!isInitializing && !animationRef.current.isPaused) {
        

      const { showOrbits, timeSpeed, lastTime, elapsedTime } = animationRef.current;

      stats.begin();
      // Calculate delta time and update elapsed time
      const deltaTime = currentTime - lastTime;
      animationRef.current.lastTime = currentTime;
      animationRef.current.elapsedTime += deltaTime * 0.0009 * timeSpeed; // Convert to seconds and apply time speed
      
      scene.children.filter(child => child.isOrbit).forEach(orbit => {
        orbit.visible = showOrbits;
      });

      const time = animationRef.current.elapsedTime*0.1;
      const rotationSpeed = 0.01 * timeSpeed;
        mercury.rotation.y += rotationSpeed * 1;
        venusWithAtmosphere.rotation.y += rotationSpeed * 0.5;
        earthWithAtmosphere.rotation.y += rotationSpeed;
        cloudMesh.rotation.y += rotationSpeed * 0.8;
        marsWithAtmosphere.rotation.y += rotationSpeed * 0.8;
        jupiterWithAtmosphere.rotation.y += rotationSpeed * 2;
        saturnWithAtmosphere.rotation.y += rotationSpeed * 1.8;
        uranusWithAtmosphere.rotation.y += rotationSpeed * 1.5;
        neptuneWithAtmosphere.rotation.y += rotationSpeed * 1.2;
        plutoWithAtmosphere.rotation.y += rotationSpeed * 1.2;
      // Mercury Orbit and Rotation
      
      mercury.position.x = Math.cos(time * 2) * 8;
      mercury.position.z = Math.sin(time * 2) * 8;

      // Venus Orbit and Rotation
      
      venusWithAtmosphere.position.x = Math.cos(time * 1.5) * 12; // Venus orbit x position
      venusWithAtmosphere.position.z = Math.sin(time * 1.5) * 12; // Venus orbit z position

      // Earth Orbit and Rotation
      
      earthWithAtmosphere.position.x = Math.cos(time) * 16; // Earth's orbit x position
      earthWithAtmosphere.position.z = Math.sin(time) * 16; // Earth's orbit z position 
      cloudMesh.rotation.y += 0.008;
      cloudMesh.position.x = earthWithAtmosphere.position.x;
      cloudMesh.position.z = earthWithAtmosphere.position.z;


      // Moon's Orbit and Rotation (relative to Earth)
      moon.position.x = earthWithAtmosphere.position.x + Math.cos(time * 10) * 1.5; // Moon orbit x position
      moon.position.z = earthWithAtmosphere.position.z + Math.sin(time * 10) * 1.5; // Moon orbit z position
      moon.rotation.y += 0; // Moon rotation

      // Mars rotation and orbit
      
      marsWithAtmosphere.position.x = Math.cos(time * 0.8) * 22; // Mars orbit x position
      marsWithAtmosphere.position.z = Math.sin(time * 0.8) * 22; // Mars orbit z position


      // Jupiter rotation and orbit
      
      jupiterWithAtmosphere.position.x = Math.cos(time * 0.6) * 30; // Jupiter orbit x position
      jupiterWithAtmosphere.position.z = Math.sin(time * 0.6) * 30; // Jupiter orbit z position

      // Saturn rotation and orbit
      
      saturnWithAtmosphere.position.x = Math.cos(time * 0.5) * 40; // Saturn orbit x position
      saturnWithAtmosphere.position.z = Math.sin(time * 0.5) * 40; // Saturn orbit z position
      rings.position.x = saturnWithAtmosphere.position.x;
      rings.position.z = saturnWithAtmosphere.position.z;

      // Uranus rotation and orbit
      
      uranusWithAtmosphere.position.x = Math.cos(time * 0.3) * 50; // Uranus orbit x position
      uranusWithAtmosphere.position.z = Math.sin(time * 0.3) * 50; // Uranus orbit z position


      // Neptune rotation and orbit
      
      neptuneWithAtmosphere.position.x = Math.cos(time * 0.25) * 60; // Neptune orbit x position
      neptuneWithAtmosphere.position.z = Math.sin(time * 0.25) * 60; // Neptune orbit z position
      
      // Pluto rotation and orbit
      
      plutoWithAtmosphere.position.x = Math.cos(time * 0.20) * 70; // Pluto orbit x position
      plutoWithAtmosphere.position.z = Math.sin(time * 0.20) * 70; // Pluto orbit z position

      const sunPosition = new THREE.Vector3(0, 0, 0);
      updatePlanetLighting(earthWithAtmosphere, sunPosition);
      updatePlanetLighting(venusWithAtmosphere, sunPosition);
      updatePlanetLighting(marsWithAtmosphere, sunPosition);
      updatePlanetLighting(jupiterWithAtmosphere, sunPosition);
      updatePlanetLighting(saturnWithAtmosphere, sunPosition);
      updatePlanetLighting(uranusWithAtmosphere, sunPosition);
      updatePlanetLighting(neptuneWithAtmosphere, sunPosition);
      updatePlanetLighting(plutoWithAtmosphere, sunPosition);


      // Update NEO positions and orbit visibility
      neosRef.current.forEach((neo, index) => {
        const position = calculateNEOPosition(neo, animationRef.current.elapsedTime + 2459000.5 * 86400);
        neo.position.copy(position);
        neo.rotation.y += 0.01;
        
        // Update orbit visibility
        if (neoOrbitRefs.current[index]) {
          neoOrbitRefs.current[index].visible = showNEOs;
        }
      });

      // Update NEO visibility
      neosRef.current.forEach(neo => {
        neo.visible = showNEOs;
      });


      // If a planet is selected, keep the camera focused and tracking its movement
      if (selectedObject && isTracking) {
        controls.target.copy(selectedObject.position);
      }
      controlsRef.current.update();
      renderer.render(scene, camera);
      }
      stats.end();
    };
    
    animate(0);

    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    

    


    // Clean up on component unmount
    return () => {
      mountRef.current.removeChild(renderer.domElement);
      mountRef.current.removeChild(stats.dom);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('dblclick', handleDoubleClick);
      window.removeEventListener('keypress', handleKeyPress);
      neosRef.current.forEach(neo => scene.remove(neo));
      neoOrbitRefs.current.forEach(orbit => scene.remove(orbit));

    };
  }, [isInitializing]);
  // Toggle the menu visibility
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  useEffect(() => {
    animationRef.current.showOrbits = showOrbits;
  }, [showOrbits]);
  useEffect(() => {
    animationRef.current.timeSpeed = timeSpeed;
  }, [timeSpeed]);
  useEffect(() => {
    animationRef.current.isPaused = isPaused;
  }, [isPaused]);
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, []);

  const handleTimeControl = (adjustment) => {
    setTimeSpeed(prevSpeed => {
      const newSpeed = prevSpeed * adjustment;
      
      return Math.max(0.01, Math.min(newSpeed, 10));
    });
  
  };
  const togglePause = () => {
    setIsPaused(!isPaused);
  };
  return (
    <div className={`orrery-container ${isFullScreen ? 'fullscreen' : ''}`} ref={orreryContainerRef}>
      <div style={{ width: '100%', height: '100%' }} ref={mountRef}></div>
      {selectedObjectData && (
        <ObjectCard objectData={selectedObjectData} onClose={handleCloseCard} />
      )}
      <div className={`menu-toggle ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>

      {isMenuOpen && (
        <div className="menu space-theme">
          <label className="orbit-toggle">
            <input
              type="checkbox"
              checked={showOrbits}
              onChange={() => setShowOrbits(!showOrbits)}
            />
            <span className="slider"></span>
            <span className="label-text">Show Orbits</span>
          </label>
          <label className="neo-toggle">
            <input
              type="checkbox"
              checked={showNEOs}
              onChange={() => setShowNEOs(!showNEOs)}
            />
            <span className="slider"></span>
            <span className="label-text">Show NEOs and Orbits</span>
          </label>
          <div className="time-control">
            <h3>Time Control</h3>
            <div className="button-group">
              <button onClick={() => handleTimeControl(0.5)} className="time-button slow">
                <i className="fas fa-backward"></i> Slower
              </button>
              <button onClick={() => setTimeSpeed(1)} className="time-button normal">
                <i className="fas fa-sync"></i> Normal
              </button>
              <button onClick={() => handleTimeControl(2)} className="time-button fast">
                <i className="fas fa-forward"></i> Faster
              </button>
              <button onClick={togglePause} className={`time-button ${isPaused ? 'play' : 'pause'}`}>
                <i className={`fas fa-${isPaused ? 'play' : 'pause'}`}></i> {isPaused ? 'Play' : 'Pause'}
              </button>
            </div>
            <div className="speed-display">
              Current Speed: {timeSpeed.toFixed(2)}x
            </div>
          </div>
        </div>
      )}
      
      <button 
        className="fullscreen-button" 
        onClick={toggleFullScreen}
        aria-label={isFullScreen ? "Exit full screen" : "Enter full screen"}
      >
        {isFullScreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
      </button>
    </div>
  );
}

export default Orrery;