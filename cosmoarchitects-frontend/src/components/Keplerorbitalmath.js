import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextureLoader, Raycaster, Vector2 } from 'three';
import { gsap } from 'gsap';
import './Orrery.css';

// ... (existing imports)

function Orrery() {
  // ... (existing state and refs)

  useEffect(() => {
    // ... (existing setup code)

    // Keplerian elements for planets (1800 AD - 2050 AD)
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

    // Update planet positions in the animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      const T = (Date.now() / 31557600000 - 2451545.0) / 36525; // Time in Julian centuries since J2000.0

      mercury.position.copy(calculatePosition('mercury', T));
      venusWithAtmosphere.position.copy(calculatePosition('venus', T));
      earthWithAtmosphere.position.copy(calculatePosition('earth', T));
      marsWithAtmosphere.position.copy(calculatePosition('mars', T));
      jupiterWithAtmosphere.position.copy(calculatePosition('jupiter', T));
      saturnWithAtmosphere.position.copy(calculatePosition('saturn', T));
      uranusWithAtmosphere.position.copy(calculatePosition('uranus', T));
      neptuneWithAtmosphere.position.copy(calculatePosition('neptune', T));

      // Update moon position relative to Earth
      const moonOrbitRadius = 0.00257; // Moon's semi-major axis in AU
      const moonOrbitPeriod = 27.3 / 365.25; // Moon's orbital period in years
      const moonAngle = (Date.now() / 1000 / 60 / 60 / 24 / moonOrbitPeriod) * Math.PI * 2;
      moon.position.set(
        earthWithAtmosphere.position.x + Math.cos(moonAngle) * moonOrbitRadius,
        earthWithAtmosphere.position.y + Math.sin(moonAngle) * moonOrbitRadius * 0.5,
        earthWithAtmosphere.position.z + Math.sin(moonAngle) * moonOrbitRadius
      );

      // Update rotations
      sun.rotation.y += 0.001;
      mercury.rotation.y += 0.01;
      venusWithAtmosphere.rotation.y += 0.005;
      earthWithAtmosphere.rotation.y += 0.01;
      marsWithAtmosphere.rotation.y += 0.008;
      jupiterWithAtmosphere.rotation.y += 0.02;
      saturnWithAtmosphere.rotation.y += 0.018;
      uranusWithAtmosphere.rotation.y += 0.015;
      neptuneWithAtmosphere.rotation.y += 0.012;
      moon.rotation.y += 0.01;

      // Update Saturn's rings
      rings.position.copy(saturnWithAtmosphere.position);

      // Update cloud layer for Earth
      cloudMesh.position.copy(earthWithAtmosphere.position);
      cloudMesh.rotation.y += 0.008;

      // Camera tracking logic (if implemented)
      if (selectedObject && isTracking) {
        const targetPosition = new THREE.Vector3(
          selectedObject.position.x + 5,
          selectedObject.position.y + 3,
          selectedObject.position.z + 5
        );
        camera.position.lerp(targetPosition, 0.05);
        camera.lookAt(selectedObject.position);
        controls.target.copy(selectedObject.position);
        controls.update();
      }

      controls.update();
      renderer.render(scene, camera);
    };

    // ... (existing code for creating planets, setting up scene, etc.)

    animate();

    // ... (existing cleanup code)
  }, [showOrbits, speed]);

  // ... (existing UI components and return statement)
}

export default Orrery;