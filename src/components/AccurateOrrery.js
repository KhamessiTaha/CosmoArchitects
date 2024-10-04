import React, { useRef, useEffect, useState, useCallback } from 'react';
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

// NASA API key
const apiKey = 'lf9ca3nAatRf8yfpG7V0Vn8fH8OYjMGYqGMV63fF';

function AccurateOrrery() {
  const mountRef = useRef(null);
  const [focusedPlanet, setFocusedPlanet] = useState(null);
  const [NEOData, setNEOData] = useState([]);
  const [showLabels, setShowLabels] = useState(false);
  

  // Function to calculate Julian date
  const getJulianDate = useCallback(() => {
    const now = new Date();
    const time = now.getTime();
    const JD = (time / 86400000.0) + 2440587.5; // Unix epoch to Julian date
    return JD;
  }, []);

  // Calculate Mean Anomaly
  const calculateMeanAnomaly = useCallback((planet) => {
    const julianDate = getJulianDate();
    const daysSinceEpoch = julianDate - planet.epoch;
    const M = planet.meanAnomalyAtEpoch + planet.meanMotion * daysSinceEpoch;
    return THREE.MathUtils.degToRad(M % 360);  // Convert to radians
  }, [getJulianDate]);

  // Function to solve Kepler's Equation using Newton's method
  const solveKepler = useCallback((M, e, tolerance = 1e-6) => {
    let E = M; // Initial guess: E ≈ M for small eccentricities
    let delta = 1;
    while (Math.abs(delta) > tolerance) {
      delta = E - e * Math.sin(E) - M;
      E = E - delta / (1 - e * Math.cos(E));
    }
    return E;
  }, []);


   // Function to calculate true anomaly from eccentric anomaly
   const calculateTrueAnomaly = useCallback((E, e) => {
    return 2 * Math.atan2(
      Math.sqrt(1 + e) * Math.sin(E / 2),
      Math.sqrt(1 - e) * Math.cos(E / 2)
    );
  }, []);

  // Fetch NEO data from NASA's API
  const fetchNEOData = useCallback(async () => {
    const url = `https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    return data.near_earth_objects;
  }, []);


  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const currentMountRef = mountRef.current;

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
        semiMajorAxis: 57.9e6,  // km
        radius: 2439.7,  // km
        inclination: 7.0,  // degrees
        eccentricity: 0.205630,
        orbitalPeriod: 87.97,  // days
        meanAnomalyAtEpoch: 174.796,  // degrees
        meanMotion: 4.09233445,  // degrees/day
        epoch: 2451545.0, // Julian date
        texture: mercuryTexture,
        rotationPeriod: 1407.6, // hours
      },
      {
        name: 'Venus',
        semiMajorAxis: 108.2e6,  // km
        radius: 6051.8,  // km
        inclination: 3.4,  // degrees
        eccentricity: 0.006772,
        orbitalPeriod: 224.70,  // days
        meanAnomalyAtEpoch: 50.115,  // degrees
        meanMotion: 1.60213034,  // degrees/day
        epoch: 2451545.0, // Julian date
        texture: venusTexture,
        rotationPeriod: 5832.5, // hours (retrograde)
      },
      {
        name: 'Earth',
        semiMajorAxis: 149.6e6,  // km
        radius: 6371,  // km
        inclination: 0.0,  // degrees
        eccentricity: 0.0167086,
        orbitalPeriod: 365.26,  // days
        meanAnomalyAtEpoch: 357.51716,  // degrees
        meanMotion: 0.9856,  // degrees/day
        epoch: 2451545.0, // Julian date
        texture: earthTexture,
        rotationPeriod: 23.934, // hours
      },
      {
        name: 'Mars',
        semiMajorAxis: 227.9e6,  // km
        radius: 3389.5,  // km
        inclination: 1.9,  // degrees
        eccentricity: 0.0934,
        orbitalPeriod: 686.98,  // days
        meanAnomalyAtEpoch: 19.412,  // degrees
        meanMotion: 0.524071,  // degrees/day
        epoch: 2451545.0, // Julian date
        texture: marsTexture,
        rotationPeriod: 24.6229, // hours
      },
      {
        name: 'Jupiter',
        semiMajorAxis: 778.5e6,  // km
        radius: 69911,  // km
        inclination: 1.3,  // degrees
        eccentricity: 0.0489,
        orbitalPeriod: 4332.59,  // days
        meanAnomalyAtEpoch: 20.020,  // degrees
        meanMotion: 0.0831293,  // degrees/day
        epoch: 2451545.0, // Julian date
        texture: jupiterTexture,
        rotationPeriod: 9.925, // hours
      },
      {
        name: 'Saturn',
        semiMajorAxis: 1434.0e6,  // km
        radius: 58232,  // km
        inclination: 2.5,  // degrees
        eccentricity: 0.0565,
        orbitalPeriod: 10759.22,  // days
        meanAnomalyAtEpoch: 317.020,  // degrees
        meanMotion: 0.0334979,  // degrees/day
        epoch: 2451545.0, // Julian date
        texture: saturnTexture,
        rotationPeriod: 10.656, // hours
      },
      {
        name: 'Uranus',
        semiMajorAxis: 2871.0e6,  // km
        radius: 25362,  // km
        inclination: 0.8,  // degrees
        eccentricity: 0.0457,
        orbitalPeriod: 30688.5,  // days
        meanAnomalyAtEpoch: 142.2386,  // degrees
        meanMotion: 0.0117081,  // degrees/day
        epoch: 2451545.0, // Julian date
        texture: uranusTexture,
        rotationPeriod: 17.24, // hours
      },
      {
        name: 'Neptune',
        semiMajorAxis: 4495.0e6,  // km
        radius: 24622,  // km
        inclination: 1.8,  // degrees
        eccentricity: 0.0113,
        orbitalPeriod: 60182,  // days
        meanAnomalyAtEpoch: 256.228,  // degrees
        meanMotion: 0.005981,  // degrees/day
        epoch: 2451545.0, // Julian date
        texture: neptuneTexture,
        rotationPeriod: 16.11, // hours
      }
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

    // Function to create enhanced label
    function createEnhancedLabel(name) {
      const labelCanvas = document.createElement('canvas');
      const context = labelCanvas.getContext('2d');
      labelCanvas.width = 512;
      labelCanvas.height = 256;
      
      // Background
      context.fillStyle = 'rgba(0, 0, 0, 0.7)';
      context.beginPath();
      context.roundRect(0, 0, labelCanvas.width, labelCanvas.height, 20);
      context.fill();
      
      // Text
      context.font = 'Bold 72px Arial';
      context.fillStyle = 'white';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(name, 256, 128);
      
      // Border
      context.strokeStyle = 'white';
      context.lineWidth = 4;
      context.beginPath();
      context.roundRect(2, 2, labelCanvas.width - 4, labelCanvas.height - 4, 18);
      context.stroke();

      const texture = new THREE.CanvasTexture(labelCanvas);
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(material);
      
      return sprite;
    }

    // Create Planets, Orbits, and Labels
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
      const segments = 3000;

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

      // Create enhanced label
      const label = createEnhancedLabel(planet.name);
      label.scale.set(planet.radius * 20, planet.radius * 10, 1);
      label.position.y = planet.radius * 2;
      planetGroup.add(label);

      // Apply inclination to the entire group
      planetGroup.rotation.x = (planet.inclination * Math.PI) / 180;

      return { mesh, group: planetGroup, name: planet.name, label };
    });

    let focusedPlanetObject = null;

    function createOrbit(neo) {
      const segments = 1000;  // Number of segments for the orbit
      const points = [];
    
      // Semi-major axis and eccentricity
      const a = neo.semiMajorAxis;  // in kilometers
      const e = neo.eccentricity;
    
      // Generate points for the orbit
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;  // Angle in radians
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(theta));  // Orbital radius (polar equation)
        const x = r * Math.cos(theta);  // X position in the orbit
        const z = r * Math.sin(theta);  // Z position in the orbit
        points.push(new THREE.Vector3(x, 0, z));  // Add the point
      }
    
      // Create the orbit geometry and material
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x00fff0,  // Orbit color (green)
        opacity: 0.3,  // Lower opacity
        transparent: true,
        linewidth: 1,  // Thin orbit line
      });
      const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
    
      // Apply inclination (tilt) to the orbit
      orbit.rotation.x = THREE.MathUtils.degToRad(neo.inclination);
    
      return orbit;
    }

    // Fetch and add NEOs to the scene
    const fetchNEOs = async () => {
      const neos = await fetchNEOData();
      const newNEOData = [];
    
      Object.values(neos).forEach((neo) => {
        const orbitalData = neo.orbital_data;
        
    
        if (orbitalData && orbitalData.semi_major_axis && orbitalData.eccentricity) {
          const geometry = new THREE.SphereGeometry(50, 32, 32);  // NEO size
          const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });  // NEO color
          const neoMesh = new THREE.Mesh(geometry, material);
    
          const a = parseFloat(orbitalData.semi_major_axis) * 1e8;  // Convert AU to km
          neoMesh.position.set(a, 0, 0);
          scene.add(neoMesh);
    
          // Store NEO data
          NEOData.push({
            mesh: neoMesh,
            eccentricity: parseFloat(orbitalData.eccentricity),
            semiMajorAxis: a,
            inclination: parseFloat(orbitalData.inclination),
            orbitalPeriod: parseFloat(orbitalData.orbital_period),
            meanAnomalyAtEpoch: parseFloat(orbitalData.mean_anomaly),
            epoch: 2451545.0,  // Example epoch
          });
    
          // Create the orbit for the NEO and add it to the scene
          const orbit = createOrbit({
            semiMajorAxis: a,
            eccentricity: parseFloat(orbitalData.eccentricity),
            inclination: parseFloat(orbitalData.inclination),
          });
          scene.add(orbit);  // Add the orbit to the scene
        } else {
          console.warn(`Skipping NEO due to missing orbital data: ${neo.name}`);
        }
      });
      setNEOData(newNEOData);
    };
    

    fetchNEOs();
    
    
    
    // Animation loop !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    const animate = () => {
      requestAnimationFrame(animate);
      planetData.forEach((planet, index) => {
        const a = planet.semiMajorAxis;
        const e = planet.eccentricity;
        

        // Calculate Mean Anomaly (M)
        const M = calculateMeanAnomaly(planet);

        // Solve for Eccentric Anomaly (E)
        const E = solveKepler(M, e);

        // Calculate True Anomaly (ν)
        const nu = calculateTrueAnomaly(E, e);

        // Calculate position in elliptical orbit
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(nu));
        const x = r * Math.cos(nu);
        const z = r * Math.sin(nu);

        // Update planet position
        planets[index].mesh.position.set(x, 0, z);


        // Update NEOs
      NEOData.forEach((neo) => {
        const M = calculateMeanAnomaly(neo);
        const E = solveKepler(M, neo.eccentricity);
        const nu = calculateTrueAnomaly(E, neo.eccentricity);

        const r = (neo.semiMajorAxis * (1 - neo.eccentricity * neo.eccentricity)) / (1 + neo.eccentricity * Math.cos(nu));
        const x = r * Math.cos(nu);
        const z = r * Math.sin(nu);

        // Update NEO position
        neo.mesh.position.set(x, 0, z);
      });

        // Rotate the planet on its axis based on the rotation period
        const rotationSpeed = (2 * Math.PI) / (planet.rotationPeriod * 3600); // radians per second
        planets[index].mesh.rotation.y += rotationSpeed;

        // Update label position and rotation
        planets[index].label.position.set(x, planet.radius * 2, z);
        planets[index].label.lookAt(camera.position);

        // Adjust label size to maintain consistent screen size
        const distance = camera.position.distanceTo(planets[index].label.position);
        const scale = distance * 0.12; // Adjust this multiplier to change the label size
        planets[index].label.scale.set(scale, scale * 0.5, 1);

        // Hide labels when a planet is focused
        planets[index].label.visible = !focusedPlanetObject;
      });

      // Update camera position if focusing on a planet
      if (focusedPlanetObject) {
        const planetPosition = new THREE.Vector3();
        focusedPlanetObject.mesh.getWorldPosition(planetPosition);
        // Keep controls focused on the planet position
        controls.target.copy(planetPosition);
        controls.update();
      }
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

    // Focus on a specific planet and set OrbitControls to orbit around the planet
const focusOnPlanet = (planetName) => {
  const planetObject = planets.find(p => p.name === planetName);
  
  if (planetObject) {
    focusedPlanetObject = planetObject;
    setFocusedPlanet(planetName);

    // Get planet position
    const planetPosition = new THREE.Vector3();
    planetObject.mesh.getWorldPosition(planetPosition);

    // Set OrbitControls to target the planet's position
    controls.target.copy(planetPosition);

    // Adjust camera position relative to the planet (set distance and angle)
    const cameraOffset = new THREE.Vector3(0, planetObject.mesh.geometry.parameters.radius * 5, planetObject.mesh.geometry.parameters.radius * 10);
    camera.position.copy(planetPosition).add(cameraOffset);
  }
};

    // Reset camera to initial position
    const resetCamera = () => {
      focusedPlanetObject = null;
      setFocusedPlanet(null);
      camera.position.set(0, 1e9, 2e9);
      controls.target.set(0, 0, 0);
    };

     // Toggle labels visibility
    const toggleLabels = () => {
      setShowLabels(prev => !prev);
      planets.forEach(planet => {
        planet.label.visible = !planet.label.visible;
      });
    };

    // Add event listeners for planet focus, label toggle, and camera reset
    const handleKeyDown = (event) => {
      const planetIndex = parseInt(event.key) - 1;
      if (planetIndex >= 0 && planetIndex < planets.length) {
        focusOnPlanet(planets[planetIndex].name);
      } else if (event.key.toLowerCase() === 'l') {
        toggleLabels();
      } else if (event.key.toLowerCase() === 'r') {
        resetCamera();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Clean up on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', focusOnPlanet);
      currentMountRef && currentMountRef.removeChild(renderer.domElement);
    };
  }, [calculateMeanAnomaly, solveKepler, NEOData, calculateTrueAnomaly, fetchNEOData]);

  return (
    <div className="orrery-container">
      <div ref={mountRef}></div>
      <div className="controls-info">
        <p>Press 1-8 to focus on planets (1: Mercury, 2: Venus, ..., 8: Neptune)</p>
        <p>Press 'R' to reset camera</p>
      </div>
      <div className="focused-planet-info">
        {focusedPlanet ? `Focused on: ${focusedPlanet}` : 'Viewing entire solar system'}
      </div>
    </div>
  );
}

export default AccurateOrrery;