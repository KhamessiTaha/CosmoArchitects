import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TextureLoader, Raycaster, Vector2 } from 'three';
import { gsap } from 'gsap';
import './Orrery.css';

// ... (keep all your existing imports)

function Orrery() {
  // ... (keep all your existing state and refs)

  useEffect(() => {
    // ... (keep existing scene, camera, and renderer setup)

    // Update the sun's material to make it glow
    const sunGeometry = new THREE.SphereGeometry(sunRadius, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({
      map: sunTextureMap,
      emissive: new THREE.Color(0xffff00),
      emissiveIntensity: 1.5,
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Add a glow effect to the sun
    const sunGlowGeometry = new THREE.SphereGeometry(sunRadius * 1.2, 64, 64);
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
          sunPosition: { value: new THREE.Vector3(0, 0, 0) },
          planetPosition: { value: planet.position },
          c: { value: intensity },
          p: { value: 6.0 },
          glowColor: { value: new THREE.Color(color) },
          viewVector: { value: camera.position }
        },
        vertexShader: `
          uniform vec3 viewVector;
          uniform vec3 sunPosition;
          uniform vec3 planetPosition;
          varying float intensity;
          varying vec3 vSunDir;
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            vec3 worldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            vSunDir = normalize(sunPosition - worldPosition);
            vec3 viewDir = normalize(viewVector - worldPosition);
            intensity = pow(0.5 - dot(vNormal, viewDir), 2.0);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform float c;
          uniform float p;
          uniform vec3 glowColor;
          varying float intensity;
          varying vec3 vSunDir;
          varying vec3 vNormal;
          void main() {
            float sunDot = max(dot(vSunDir, vNormal), 0.0);
            float glow = pow(sunDot, p) * c;
            gl_FragColor = vec4(glowColor, 1.0) * intensity * (glow + 0.1);
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

    // Update each planet creation to use the new function
    // Example for Earth:
    const earthWithAtmosphere = createPlanetWithAtmosphere(earth, planets.earth.radius, planets.earth.atmosphereRadius, planets.earth.color, planets.earth.intensity, planets.earth.opacity);
    earthWithAtmosphere.position.x = planets.earth.positionX;
    scene.add(earthWithAtmosphere);

    // Do the same for other planets...

    // Update the point light to be more intense
    const pointLight = new THREE.PointLight(0xffffff, 2, 0);  // Increased intensity, infinite distance
    pointLight.position.set(0, 0, 0); // At the sun's position
    scene.add(pointLight);

    // Remove ambient light to enhance the contrast between lit and unlit sides

    // In the animation loop, update the uniforms for atmospheres
    const animate = () => {
      // ... (existing animation code)

      // Update atmosphere uniforms
      scene.traverse((object) => {
        if (object.type === 'Group' && object.children.length > 1 && object.children[1].material.type === 'ShaderMaterial') {
          object.children[1].material.uniforms.sunPosition.value.copy(sun.position);
          object.children[1].material.uniforms.planetPosition.value.copy(object.position);
          object.children[1].material.uniforms.viewVector.value.copy(camera.position);
        }
      });

      // Update sun glow
      sunGlow.material.uniforms.viewVector.value = camera.position;

      renderer.render(scene, camera);
    };

    // ... (rest of the component remains the same)
  }, [showOrbits, speed]);

  // ... (rest of the component remains the same)
}

export default Orrery;
