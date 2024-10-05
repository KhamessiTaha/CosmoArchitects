import React, { useRef, useEffect, useState , useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextureLoader } from 'three';
import { gsap } from 'gsap';
import './Orrery.css';
import StatsJS from 'stats.js';
import { Maximize2, Minimize2 } from 'lucide-react';
import ObjectCard from './ObjectCard';
import { asteroids } from './asteroids.js';
import { comets } from './comets.js';



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
import asteroidTexture from "./textures/Asteroid/asteroid3.jpg";

import music1 from "./Stars in Our Eyes.mp3";
import music2 from "./Some Sand.mp3";
import music3 from "./Whispers of the Stars.mp3";

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


function keplerianToCartesian(a, e, i, om, w, ma) {
 
  i = THREE.MathUtils.degToRad(i);
  om = THREE.MathUtils.degToRad(om);
  w = THREE.MathUtils.degToRad(w);
  ma = THREE.MathUtils.degToRad(ma);

  // Solve Kepler's Equation for eccentric anomaly E
  let E = ma;
  for (let j = 0; j < 10; j++) {
      E = ma + e * Math.sin(E);
  }

  // True anomaly v
  const nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));

  // Distance r
  const r = a * (1 - e * e) / (1 + e * Math.cos(nu));


  // Convert to 3D space
  const x = (Math.cos(om) * Math.cos(w + nu) - Math.sin(om) * Math.sin(w + nu) * Math.cos(i)) * r;
  const y = (Math.sin(om) * Math.cos(w + nu) + Math.cos(om) * Math.sin(w + nu) * Math.cos(i)) * r;
  const z = Math.sin(w + nu) * Math.sin(i) * r;

  return new THREE.Vector3(x, z, -y);
}



function Orrery({ isInitializing,  }) {
  const mountRef = useRef(null);
  const cameraRef = useRef(null);     
  const controlsRef = useRef(null);  
  const sceneRef = useRef(null);
  const [showOrbits, setShowOrbits] = useState(true);
  const [timeSpeed, setTimeSpeed] = useState(1);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedObjectData, setSelectedObjectData] = useState(null);
  const [showAsteroids, setShowAsteroids] = useState(false);
  const [showComets, setShowComets] = useState(false);
  const orreryContainerRef = useRef(null);
  const statsRef = useRef(null);
  const asteroidsRef = useRef([]);
  const cometsRef = useRef([]);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);


  const playlist = [
    music2,
    music1,
    music3
  ];

  // Function to toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
        audioRef.current.muted = !isMuted;
        setIsMuted((prev) => !prev);
        
        if (!isMuted) {
            audioRef.current.play(); 
        }
    }
  };

  



  const animationRef = useRef({
    showOrbits: true,
    showAsteroids: true,
    showComets: true,
    timeSpeed: 1,
    lastTime: 0,
    elapsedTime: 0,
    isPaused: false,
  });


  const handleCloseCard = () => {
    setSelectedObjectData(null); 
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

  function createAsteroidOrbit(asteroid) {
    const segments = 1000;
    const points = [];
    const a = asteroid.a * 100;  // Scale the semi-major axis for visualization
    const e = asteroid.e;
    const i = asteroid.i;  
    const om = asteroid.om;
    const w = asteroid.w;

    for (let j = 0; j <= segments; j++) {
        const meanAnomaly = (j / segments) * 360;
        const position = keplerianToCartesian(a, e, i, om, w, meanAnomaly);
        points.push(position);
    }

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0xff0000,  
        opacity: 0.7,
        transparent: true,
    });

    const orbit = new THREE.Line(orbitGeometry, orbitMaterial);

   

    return orbit;
}

function createCometsOrbit(comet) {
  const segments = 1000; 
  const points = [];
  const a = comet.a * 100;  
  const e = comet.e;
  const i = comet.i; 
  const om = comet.om;
  const w = comet.w;

  for (let j = 0; j <= segments; j++) {
      const meanAnomaly = (j / segments) * 360;
      const position = keplerianToCartesian(a, e, i, om, w, meanAnomaly);
      points.push(position);
  }

  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const orbitMaterial = new THREE.LineBasicMaterial({
      color: 0xa9a9a9, 
      opacity: 0.7,
      transparent: true,
  });

  const orbit = new THREE.Line(orbitGeometry, orbitMaterial);

 

  return orbit;
}



  useEffect(() => {
    // Set up scene, camera, and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    cameraRef.current = camera;  // Store camera in ref

    const currentMountRef = mountRef.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Set up OrbitControls for camera movement
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; 
    controlsRef.current = controls; 

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
    const asteroidTextureMap = textureLoader.load(asteroidTexture);

    // Create starfield
    const createStars = (scene, numStars, minDistance, maxDistance) => {
      const starGeometry = new THREE.SphereGeometry(0.4, 24, 24);
      const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    
      for (let i = 0; i < numStars; i++) {
        const star = new THREE.Mesh(starGeometry, starMaterial);
    
        
        const theta = Math.random() * Math.PI * 2;  
        const phi = Math.random() * Math.PI;  
        
        
        const distance = Math.random() * (maxDistance - minDistance) + minDistance;
    
        star.position.x = distance * Math.sin(phi) * Math.cos(theta);
        star.position.y = distance * Math.sin(phi) * Math.sin(theta);
        star.position.z = distance * Math.cos(phi);
    
        scene.add(star);
      }
    };

    createStars(scene, 500, 500, 1000); 

    
    
    function addAsteroids(scene) {
      Object.values(asteroids).forEach(asteroid => {
        // Create asteroid mesh
        const asteroidGeometry = new THREE.SphereGeometry(0.2, 32, 32);
        const asteroidMaterial = new THREE.MeshBasicMaterial({ map: asteroidTextureMap,
          color: 0xffffff });
        const asteroidMesh = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    
        // Create orbit
        const orbit = createAsteroidOrbit(asteroid);
    
        // Calculate initial position of the asteroid
        const position = keplerianToCartesian(asteroid.a * 100, asteroid.e, asteroid.i, asteroid.om, asteroid.w, asteroid.ma);
        asteroidMesh.position.copy(position); // Set asteroid position
    
        // Create asteroid name label using THREE.Sprite
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
    
        // Adjust canvas size dynamically based on text
        const text = asteroid.name;
        const fontSize = 60; // Adjust font size if needed
        context.font = `${fontSize}px Arial`;
        const textWidth = context.measureText(text).width;
    
        // Calculate canvas dimensions for the rectangle
        const padding = 20; // Padding inside the rectangle
        const rectWidth = textWidth + padding * 5; // Add padding on both sides
        const rectHeight = fontSize + padding; // Add padding above and below text
    
        // Set canvas size to fit the text and background rectangle
        canvas.width = rectWidth ;
        canvas.height = rectHeight * 5;
    
        // Draw rectangular background
        context.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Semi-transparent black background
        context.fillRect(0, 0, rectWidth, rectHeight);
    
        // Draw the text on top of the rectangle
        context.font = `${fontSize}px Arial`;
        context.fillStyle = 'white'; // White text color
        context.textAlign = 'center';
        context.textBaseline = 'middle'; // Vertically center the text
        context.fillText(text, rectWidth / 2, rectHeight / 2); // Draw text in the center of the rectangle
    
        // Create a texture from the canvas and make it a sprite
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
    
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const label = new THREE.Sprite(spriteMaterial);
    
        // Set label's initial position slightly above the asteroid
        label.position.copy(position);
        label.position.y += 0.5;
    
        // Add mesh, orbit, and label to the scene
        scene.add(asteroidMesh);
        scene.add(orbit);
        scene.add(label);
    
        // Store asteroid and label references
        asteroidsRef.current.push({
          mesh: asteroidMesh,
          orbit: orbit,
          a: asteroid.a * 100, // Scale the semi-major axis
          e: asteroid.e,
          i: asteroid.i,
          om: asteroid.om,
          w: asteroid.w,
          ma: asteroid.ma,
          label: label // Store the label
        });
      });
    }
    
    function addComets(scene) {
      Object.values(comets).forEach(comet => {
        const cometGeometry = new THREE.SphereGeometry(0.2, 32, 32);
        const cometMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const cometMesh = new THREE.Mesh(cometGeometry, cometMaterial);

        const orbit = createCometsOrbit(comet);

        cometsRef.current.push({ 
          mesh: cometMesh, 
          orbit: orbit,
          a: comet.a * 100, // Scale the semi-major axis
          e: comet.e,
          i: comet.i,
          om: comet.om,
          w: comet.w,
          ma: comet.ma
        });

        scene.add(cometMesh);
        scene.add(orbit);
      });
    }

    addAsteroids(scene);  
    addComets(scene);  
    

   

    // Lighting
    const sunRadius = 3;

    const ambientLight = new THREE.AmbientLight(0x404040, 0.2); 
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 250, 0);  
    pointLight.position.set(0, 0); 
    pointLight.castShadow = true;  
    pointLight.shadow.mapSize.width = 4096; 
    pointLight.shadow.mapSize.height = 4096;
    pointLight.shadow.camera.near = 1;
    pointLight.shadow.camera.far = 5000; 

    scene.add(pointLight);


    

    
    // Function to create a planet with realistic lighting and atmosphere
    const createPlanetWithAtmosphere = (planet, radius, atmosphereRadius, color, intensity, opacity) => {
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
      emissive: new THREE.Color(0x111111),  
      emissiveIntensity: 0.5,   });
    const mercury = new THREE.Mesh(mercuryGeometry, mercuryMaterial);
    mercury.position.x = 8;  
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
    const cloudGeometry = new THREE.SphereGeometry(0.51, 64, 64);
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
      ringGeometry.attributes.uv.setXY(i, ringVec.length() < 2.7 ? 0 : 1, 1);
    }
    const ringMaterial = new THREE.MeshBasicMaterial({
      map: textureLoader.load(saturnRingTexture),
      side: THREE.DoubleSide,
      transparent: true,
      roughness: 1,
      metalness: 0,
    });
    const rings = new THREE.Mesh(ringGeometry, ringMaterial);
    rings.rotation.x = Math.PI / 2; 
    rings.position.x = 40;  
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
    

    // Shadow Casting
    // Sun
    sun.castShadow = false; 
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
    rings.castShadow = true; 
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

    renderer.shadowMap.enabled = true;  
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; 
    
    const updatePlanetLighting = (planet, lightPosition) => {
      if (planet.material && planet.material.emissive) { 
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

    scene.background = reflectionMap;  


    const getObjectRadius = (object) => {
      if (object.geometry && object.geometry.boundingSphere) {
        return object.geometry.boundingSphere.radius;
      } else if (object.children && object.children.length > 0) {
        return object.children[0].geometry.boundingSphere.radius;
      }
      return 1; 
    };
    
    // SelectableObjects
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
    let selectedObject = null;  
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
    
        while (targetObject.parent && !selectableObjects.includes(targetObject)) {
          targetObject = targetObject.parent;
        }
    
        selectedObject = targetObject;
        isTracking = true;
    
        controls.target.copy(selectedObject.position);
    
        const objectRadius = getObjectRadius(targetObject);
        const offsetDistance = objectRadius * 3;
    
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
        else if (targetObject === sun) objectKey = 'sun'; 
    
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
        setSelectedObjectData(null); 
      }
    };
    
    
    
    

    window.addEventListener('dblclick', handleDoubleClick);

    // Reset camera on "R" key press
    const handleKeyPress = (event) => {
      if (event.key === 'r' || event.key === 'R') {
        gsap.to(camera.position, {
          duration: 2,
          x: 10,  
          y: 5,
          z: 30,
          ease: 'power2.inOut',
          onUpdate: () => {
            camera.lookAt(0, 0, 0); 
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
        setSelectedObjectData(null);  
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
      orbit.rotation.x = Math.PI / 2; 
      orbit.isOrbit = true;
      return orbit;
    };

  
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


    

    // Animation loop!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    const animate = (currentTime) => {
      requestAnimationFrame(animate);
      if (!isInitializing && !animationRef.current.isPaused) {
        

      const { showOrbits, timeSpeed, lastTime } = animationRef.current;

      stats.begin();
      const deltaTime = currentTime - lastTime;
      animationRef.current.lastTime = currentTime;
      animationRef.current.elapsedTime += deltaTime * 0.0009 * timeSpeed;
      
      scene.children.filter(child => child.isOrbit).forEach(orbit => {
        orbit.visible = showOrbits;
      });


      // Update asteroid visibility
      asteroidsRef.current.forEach(({ mesh, orbit }) => {
        mesh.visible = animationRef.current.showAsteroids;
        orbit.visible = animationRef.current.showAsteroids && animationRef.current.showOrbits;
      });

      // Update comet visibility
      cometsRef.current.forEach(({ mesh, orbit }) => {
        mesh.visible = animationRef.current.showComets;
        orbit.visible = animationRef.current.showComets && animationRef.current.showOrbits;
      });

      // Animate asteroids
      asteroidsRef.current.forEach((asteroidObj) => {
        const { mesh, a, e, i, om, w, ma, label } = asteroidObj;
      
        const meanAnomaly = (ma + animationRef.current.elapsedTime * 0.1) % 360;
        const position = keplerianToCartesian(a, e, i, om, w, meanAnomaly);
      
        // Update the asteroid's position
        mesh.position.copy(position);
      
        // Update the label's position to stay above the asteroid
        label.position.copy(position);
        label.position.y += 0.5;
      
        // Update visibility based on "Show NEOs" toggle
        const showAsteroids = animationRef.current.showAsteroids;
        mesh.visible = showAsteroids;
        label.visible = showAsteroids; // Label is shown when the asteroid is visible
        asteroidObj.orbit.visible = showAsteroids && animationRef.current.showOrbits;
      });

      // Animate comets
      asteroidsRef.current.forEach((cometObj) => {
        const { mesh, a, e, i, om, w, ma } = cometObj;
        
        const meanAnomaly = (ma + animationRef.current.elapsedTime * 0.1) % 360;
        const position = keplerianToCartesian(a, e, i, om, w, meanAnomaly);
        
        mesh.position.copy(position);
        mesh.visible = animationRef.current.showComets;
        cometObj.orbit.visible = animationRef.current.showComets && animationRef.current.showOrbits;
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
      
        //Planets Orbits and Rotations (Scaled Down for better Visibility/Control)
        // Mercury Orbit and Rotation
      
      mercury.position.x = Math.cos(time * 2) * 8;
      mercury.position.z = Math.sin(time * 2) * 8;

      // Venus Orbit and Rotation
      
      venusWithAtmosphere.position.x = Math.cos(time * 1.5) * 12; 
      venusWithAtmosphere.position.z = Math.sin(time * 1.5) * 12; 

      // Earth Orbit and Rotation
      
      earthWithAtmosphere.position.x = Math.cos(time) * 16; 
      earthWithAtmosphere.position.z = Math.sin(time) * 16;  
      cloudMesh.rotation.y += 0.008;
      cloudMesh.position.x = earthWithAtmosphere.position.x;
      cloudMesh.position.z = earthWithAtmosphere.position.z;


      // Moon's Orbit and Rotation (relative to Earth)
      moon.position.x = earthWithAtmosphere.position.x + Math.cos(time * 10) * 1.5; 
      moon.position.z = earthWithAtmosphere.position.z + Math.sin(time * 10) * 1.5;
      moon.rotation.y += 0; // Moon rotation

      // Mars rotation and orbit
      
      marsWithAtmosphere.position.x = Math.cos(time * 0.8) * 22; 
      marsWithAtmosphere.position.z = Math.sin(time * 0.8) * 22; 


      // Jupiter rotation and orbit
      
      jupiterWithAtmosphere.position.x = Math.cos(time * 0.6) * 30; 
      jupiterWithAtmosphere.position.z = Math.sin(time * 0.6) * 30; 

      // Saturn rotation and orbit
      
      saturnWithAtmosphere.position.x = Math.cos(time * 0.5) * 40; 
      saturnWithAtmosphere.position.z = Math.sin(time * 0.5) * 40; 
      rings.position.x = saturnWithAtmosphere.position.x;
      rings.position.z = saturnWithAtmosphere.position.z;

      // Uranus rotation and orbit
      
      uranusWithAtmosphere.position.x = Math.cos(time * 0.3) * 50; 
      uranusWithAtmosphere.position.z = Math.sin(time * 0.3) * 50; 


      // Neptune rotation and orbit
      
      neptuneWithAtmosphere.position.x = Math.cos(time * 0.25) * 60; 
      neptuneWithAtmosphere.position.z = Math.sin(time * 0.25) * 60; 
      
      // Pluto rotation and orbit
      
      plutoWithAtmosphere.position.x = Math.cos(time * 0.20) * 70; 
      plutoWithAtmosphere.position.z = Math.sin(time * 0.20) * 70; 

      const sunPosition = new THREE.Vector3(0, 0, 0);
      updatePlanetLighting(earthWithAtmosphere, sunPosition);
      updatePlanetLighting(venusWithAtmosphere, sunPosition);
      updatePlanetLighting(marsWithAtmosphere, sunPosition);
      updatePlanetLighting(jupiterWithAtmosphere, sunPosition);
      updatePlanetLighting(saturnWithAtmosphere, sunPosition);
      updatePlanetLighting(uranusWithAtmosphere, sunPosition);
      updatePlanetLighting(neptuneWithAtmosphere, sunPosition);
      updatePlanetLighting(plutoWithAtmosphere, sunPosition);


      // If a planet is selected we have to keep the camera focused and tracking its movement!!
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
      if (currentMountRef && currentMountRef.contains(renderer.domElement)) {
          currentMountRef.removeChild(renderer.domElement);
          currentMountRef.removeChild(stats.dom);
      }
      
      // remove event listeners
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('dblclick', handleDoubleClick);
      window.removeEventListener('keypress', handleKeyPress);
  };
  }, [isInitializing]);
  
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  useEffect(() => {
    animationRef.current.showOrbits = showOrbits;
  }, [showOrbits]);
  useEffect(() => {
    // If music is started, set muted state
    if (audioRef.current) {
        audioRef.current.muted = isMuted;
    }
    const playAudio = () => {
      if (audioRef.current && !isMuted) {
          audioRef.current.play().catch((error) => {
              console.error("Audio playback failed:", error);
          });
      }
  };
    playAudio();
}, [isMuted]);
  useEffect(() => {
    animationRef.current.showAsteroids = showAsteroids;
  }, [showAsteroids]);
  useEffect(() => {
    animationRef.current.showComets = showComets;
  }, [showComets]);
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
      <audio ref={audioRef} loop>
        {playlist.map((track, index) => (
          <source key={index} src={track} type="audio/mpeg" />
          ))}
          Your browser does not support the audio element.
      </audio>
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
          <label className="comet-toggle">
            <input
              type="checkbox"
              checked={showComets}
              onChange={() => setShowComets(!showComets)}
            />
            <span className="slider"></span>
            <span className="label-text">Show NEOs</span> 
          </label>
          <label className="asteroid-toggle">
            <input
            type="checkbox"
            checked={showAsteroids}
            onChange={() => setShowAsteroids(!showAsteroids)}
            />
            <span className="slider"></span>
            <span className="label-text">Show NEO Names</span>
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
      <div className="controls-text" style={{ position: 'absolute', bottom: '10px', left: '10px', color: 'white', fontSize: '14px' }}>
        <p>Press 'R' to reset the camera. </p>
        <p>Double click on a celestial object to select/track it and view details.</p> 
        <p>Control Menu is on Top Right.</p>   
        <button className="mute-button" onClick={toggleMute}>
          {isMuted ? 'Unmute' : 'Mute'}
        </button>
      </div>
    </div>
  );
}

export default Orrery;