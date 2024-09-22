import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextureLoader, Raycaster, Vector2 } from 'three';
import { gsap } from 'gsap';
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
import saturnRingTexture from './textures/Saturn/saturn_ring.png'; 
import earthbump from "./textures/Earth/earthbump.jpg" ;
import earthcloud from "./textures/Earth/earthcloud.jpg" ;
import earthcloudtrans from "./textures/Earth/earthcloudtrans.jpg" ;
import earthlights from "./textures/Earth/earthlights.jpg" ;
import earthspec from "./textures/Earth/earthspec.jpg" ;

import x1 from './textures/skybox/right.png' ;
import x2 from './textures/skybox/left.png' ;
import y1 from './textures/skybox/top.png' ;
import y2 from './textures/skybox/bottom.png' ;
import z1 from './textures/skybox/front.png'  ;
import z2 from './textures/skybox/back.png'  ;



function Orrery() {
  const mountRef = useRef(null);
  const cameraRef = useRef(null);     // Camera ref
  const controlsRef = useRef(null);   // Controls ref
  const [showOrbits, setShowOrbits] = useState(true);
  const [speed, setSpeed] = useState(0.00001);
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  let selectedObject = null; // select celestial body
  let isTracking = false; // Track celestial booty
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

    // Create starfield
    const createStars = (scene, numStars, minDistance, maxDistance) => {
      const starGeometry = new THREE.SphereGeometry(0.2, 24, 24);
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

    createStars(scene, 500, 100, 300); 

    // Lighting
    const sunRadius = 3;
    const lightOffset = 5;


    const planetaryData = {
      mercury: {
        a: 0.38709927, aRate: 0.00000037,
        e: 0.20563593, eRate: 0.00001906,
        i: 7.00497902, iRate: -0.00594749,
        L: 252.25032350, LRate: 149472.67411175,
        longPeri: 77.45779628, longPeriRate: 0.16047689,
        longNode: 48.33076593, longNodeRate: -0.12534081
      },
      venus: {
        a: 0.72333566, aRate: 0.00000390,
        e: 0.00677672, eRate: -0.00004107,
        i: 3.39467605, iRate: -0.00078890,
        L: 181.97909950, LRate: 58517.81538729,
        longPeri: 131.60246718, longPeriRate: 0.00268329,
        longNode: 76.67984255, longNodeRate: -0.27769418
      },
      earth: {
        a: 1.00000261, aRate: 0.00000562,
        e: 0.01671123, eRate: -0.00004392,
        i: -0.00001531, iRate: -0.01294668,
        L: 100.46457166, LRate: 35999.37244981,
        longPeri: 102.93768193, longPeriRate: 0.32327364,
        longNode: 0.0, longNodeRate: 0.0
      },
      mars: {
        a: 1.52371034, aRate: 0.00001847,
        e: 0.09339410, eRate: 0.00007882,
        i: 1.84969142, iRate: -0.00813131,
        L: -4.55343205, LRate: 19140.30268499,
        longPeri: -23.94362959, longPeriRate: 0.44441088,
        longNode: 49.55953891, longNodeRate: -0.29257343
      },
      jupiter: {
        a: 5.20288700, aRate: -0.00011607,
        e: 0.04838624, eRate: -0.00013253,
        i: 1.30439695, iRate: -0.00183714,
        L: 34.39644051, LRate: 3034.74612775,
        longPeri: 14.72847983, longPeriRate: 0.21252668,
        longNode: 100.47390909, longNodeRate: 0.20469106
      },
      saturn: {
        a: 9.53667594, aRate: -0.00125060,
        e: 0.05386179, eRate: -0.00050991,
        i: 2.48599187, iRate: 0.00193609,
        L: 49.95424423, LRate: 1222.49362201,
        longPeri: 92.59887831, longPeriRate: -0.41897216,
        longNode: 113.66242448, longNodeRate: -0.28867794
      },
      uranus: {
        a: 19.18916464, aRate: -0.00196176,
        e: 0.04725744, eRate: -0.00004397,
        i: 0.77263783, iRate: -0.00242939,
        L: 313.23810451, LRate: 428.48202785,
        longPeri: 170.95427630, longPeriRate: 0.40805281,
        longNode: 74.01692503, longNodeRate: 0.04240589
      },
      neptune: {
        a: 30.06992276, aRate: 0.00026291,
        e: 0.00859048, eRate: 0.00005105,
        i: 1.77004347, iRate: 0.00035372,
        L: -55.12002969, LRate: 218.45945325,
        longPeri: 44.96476227, longPeriRate: -0.32241464,
        longNode: 131.78422574, longNodeRate: -0.00508664
      }
    };
    // Function to calculate Keplerian elements at a given time
    const calculateElements = (planet, T) => {
      const data = planetaryData[planet];
      return {
        a: data.a + data.aRate * T,
        e: data.e + data.eRate * T,
        i: (data.i + data.iRate * T) * Math.PI / 180,
        L: (data.L + data.LRate * T) % 360,
        longPeri: (data.longPeri + data.longPeriRate * T) % 360,
        longNode: (data.longNode + data.longNodeRate * T) % 360
      };
    };

    // Function to solve Kepler's equation
    const solveKepler = (M, e) => {
      let E = M;
      for (let i = 0; i < 10; i++) {
        E = M + e * Math.sin(E);
      }
      return E;
    };

    // Function to calculate heliocentric coordinates
    const calculatePosition = (planet, T) => {
      const elements = calculateElements(planet, T);
      const { a, e, i, L, longPeri, longNode } = elements;

      const M = (L - longPeri) * Math.PI / 180;
      const E = solveKepler(M, e);

      const x = a * (Math.cos(E) - e);
      const y = a * Math.sqrt(1 - e * e) * Math.sin(E);

      const xEcliptic = (Math.cos(longNode) * Math.cos(longPeri - longNode) - Math.sin(longNode) * Math.sin(longPeri - longNode) * Math.cos(i)) * x
                      + (-Math.cos(longNode) * Math.sin(longPeri - longNode) - Math.sin(longNode) * Math.cos(longPeri - longNode) * Math.cos(i)) * y;
      const yEcliptic = (Math.sin(longNode) * Math.cos(longPeri - longNode) + Math.cos(longNode) * Math.sin(longPeri - longNode) * Math.cos(i)) * x
                      + (-Math.sin(longNode) * Math.sin(longPeri - longNode) + Math.cos(longNode) * Math.cos(longPeri - longNode) * Math.cos(i)) * y;
      const zEcliptic = Math.sin(longPeri - longNode) * Math.sin(i) * x + Math.cos(longPeri - longNode) * Math.sin(i) * y;

      return new THREE.Vector3(xEcliptic, yEcliptic, zEcliptic);
    };

    const pointLight = new THREE.PointLight(0xffffff, 2, 0);  // Brightness and range of light
    pointLight.position.set(0, 0); // Sun's position
    pointLight.castShadow = true;  // Enable shadow casting
    pointLight.shadow.mapSize.width = 2048; // Higher resolution shadows
    pointLight.shadow.mapSize.height = 2048;
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
      earth: { radius: 0.5, atmosphereRadius: 0.511, color: 0x0000ff, intensity: 0.7, opacity: 0.1, positionX: 6 },
      venus: { radius: 0.6, atmosphereRadius: 0.621, color: 0xFFA500, intensity: 0.5, opacity: 0.4, positionX: 5 },
      mars: { radius: 0.6, atmosphereRadius: 0.624, color: 0xFF4500, intensity: 0.5, opacity: 0.25, positionX: 10 },
      jupiter: { radius: 2, atmosphereRadius: 2.05, color: 0xFFFF00, intensity: 0.4, opacity: 0.2, positionX: 15 },
      saturn: { radius: 1.8, atmosphereRadius: 1.85, color: 0xFFFACD, intensity: 0.3, opacity: 0.2, positionX: 20 },
      uranus: { radius: 1.4, atmosphereRadius: 1.47, color: 0x00FFFF, intensity: 0.3, opacity: 0.2, positionX: 25 },
      neptune: { radius: 1.3, atmosphereRadius: 1.33, color: 0x0000FF, intensity: 0.4, opacity: 0.25, positionX: 30 }
};


    // Sun
    const sunGeometry = new THREE.SphereGeometry(sunRadius, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({
      map: sunTextureMap,
      emissive: new THREE.Color(0xffff00),
      emissiveIntensity: 1.5
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
      metalness: 0,  });
    const mercury = new THREE.Mesh(mercuryGeometry, mercuryMaterial);
    mercury.position.x = 4;  // Adjust orbit radius
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
      specular: new THREE.Color('grey'),
      emissiveMap: nightLights,
      emissive: new THREE.Color('white'),
      emissiveIntensity: 0.6,
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
      roughness: 1,
      metalness: 0, 
    });
    const rings = new THREE.Mesh(ringGeometry, ringMaterial);
    rings.rotation.x = Math.PI / 2;  // Make the ring horizontal
    rings.position.x = 20;  // Align with Saturn's position
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

    renderer.shadowMap.enabled = true;  // Enable shadows globally
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;  // Soft shadows for smooth transitions

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

    


    // Orbits
    const createOrbit = (radius, color) => {
      const orbitGeometry = new THREE.RingGeometry(radius, radius + 0.01, 256);
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
      venusWithAtmosphere.rotation.y += 0.005; // Venus rotation
      venusWithAtmosphere.position.x = Math.cos(Date.now() * speed * 1.2) * 5; // Venus orbit x position
      venusWithAtmosphere.position.z = Math.sin(Date.now() * speed * 1.2) * 5; // Venus orbit z position

      // Earth Orbit and Rotation
      earthWithAtmosphere.rotation.y += 0.01; // Earth rotation
      earthWithAtmosphere.position.x = Math.cos(Date.now() * speed) * 6; // Earth's orbit x position
      earthWithAtmosphere.position.z = Math.sin(Date.now() * speed) * 6; // Earth's orbit z position 
      cloudMesh.rotation.y += 0.008;
      cloudMesh.position.x = earthWithAtmosphere.position.x;
      cloudMesh.position.z = earthWithAtmosphere.position.z;


      // Moon's Orbit and Rotation (relative to Earth)
      moon.position.x = earthWithAtmosphere.position.x + Math.cos(Date.now() * speed * 10) * 1.5; // Moon orbit x position
      moon.position.z = earthWithAtmosphere.position.z + Math.sin(Date.now() * speed * 10) * 1.5; // Moon orbit z position
      moon.rotation.y += 0.01; // Moon rotation

      // Mars rotation and orbit
      marsWithAtmosphere.rotation.y += 0.008; // Mars rotation
      marsWithAtmosphere.position.x = Math.cos(Date.now() * speed * 0.8) * 10; // Mars orbit x position
      marsWithAtmosphere.position.z = Math.sin(Date.now() * speed * 0.8) * 10; // Mars orbit z position


      // Jupiter rotation and orbit
      jupiterWithAtmosphere.rotation.y += 0.02; // Jupiter rotation
      jupiterWithAtmosphere.position.x = Math.cos(Date.now() * speed * 0.6) * 15; // Jupiter orbit x position
      jupiterWithAtmosphere.position.z = Math.sin(Date.now() * speed * 0.6) * 15; // Jupiter orbit z position

      // Saturn rotation and orbit
      saturnWithAtmosphere.rotation.y += 0.018; // Saturn rotation
      saturnWithAtmosphere.position.x = Math.cos(Date.now() * speed * 0.5) * 20; // Saturn orbit x position
      saturnWithAtmosphere.position.z = Math.sin(Date.now() * speed * 0.5) * 20; // Saturn orbit z position
      rings.position.x = saturnWithAtmosphere.position.x;
      rings.position.z = saturnWithAtmosphere.position.z;

      // Uranus rotation and orbit
      uranusWithAtmosphere.rotation.y += 0.015; // Uranus rotation
      uranusWithAtmosphere.position.x = Math.cos(Date.now() * speed * 0.3) * 25; // Uranus orbit x position
      uranusWithAtmosphere.position.z = Math.sin(Date.now() * speed * 0.3) * 25; // Uranus orbit z position


      // Neptune rotation and orbit
      neptuneWithAtmosphere.rotation.y += 0.012; // Neptune rotation
      neptuneWithAtmosphere.position.x = Math.cos(Date.now() * speed * 0.25) * 30; // Neptune orbit x position
      neptuneWithAtmosphere.position.z = Math.sin(Date.now() * speed * 0.25) * 30; // Neptune orbit z position

      // If a planet is selected, keep the camera focused and tracking its movement
      if (selectedObject && isTracking) {
        const targetPosition = new THREE.Vector3(
          selectedObject.position.x + 5, // Adjust offsets for better framing
          selectedObject.position.y + 3,
          selectedObject.position.z + 5
        );
        // Smoothly update the camera position to follow the planet
        camera.position.lerp(targetPosition, 0.05);  // Adjust lerp factor for smoother follow
        camera.lookAt(selectedObject.position);
        controls.target.copy(selectedObject.position);  // Keep controls target on the planet
        controls.update();
      }
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

    const selectableObjects = [
      mercury, venusWithAtmosphere, earthWithAtmosphere, marsWithAtmosphere,
      jupiterWithAtmosphere, saturnWithAtmosphere, uranusWithAtmosphere, neptuneWithAtmosphere
    ];

    //camera trackinng
    const handleDoubleClick = (event) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(selectableObjects);

      if (intersects.length > 0) {
        selectedObject = intersects[0].object;
        isTracking = true;
        const targetPosition = new THREE.Vector3(
          selectedObject.position.x + 5,
          selectedObject.position.y + 3,
          selectedObject.position.z + 5
        );
        // Animate the camera position
        gsap.to(camera.position, {
          duration: 2, 
          x: targetPosition.x,
          y: targetPosition.y,
          z: targetPosition.z,
          ease: 'power2.inOut', // Easing function for smoothness
          onUpdate: () => {
            camera.lookAt(selectedObject.position);
            controls.update();
          },
        });
        // Smoothly update the camera controls' target
        gsap.to(controls.target, {
          duration: 2,   // Sync duration with the camera movement
          x: selectedObject.position.x,
          y: selectedObject.position.y,
          z: selectedObject.position.z,
          ease: 'power2.inOut',
          onUpdate: () => {
            controls.update();
          },
        });
        
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
  // Toggle the menu visibility
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div>
      <div style={{ width: '100vw', height: '100vh' }} ref={mountRef}></div>
      
      {/* Menu Toggle Button (Hamburger) */}
      <div className={`menu-toggle ${isMenuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <div className="bar"></div>
        <div className="bar"></div>
        <div className="bar"></div>
      </div>

      {/* Deployable Menu */}
      {isMenuOpen && (
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
      )}
    </div>
  );
}

export default Orrery;