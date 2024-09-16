import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { TextureLoader } from 'three';

// Textures for Sun and Earth
import earthTexture from './textures/earth.jpg'; // Add a texture image for Earth
import sunTexture from './textures/sun.jpg';     // Add a texture image for Sun

function Orrery() {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // Enable shadows for better realism
    mountRef.current.appendChild(renderer.domElement);

    // Load textures
    const textureLoader = new TextureLoader();
    const sunTextureMap = textureLoader.load(sunTexture);
    const earthTextureMap = textureLoader.load(earthTexture);

    // Lighting
    const pointLight = new THREE.PointLight(0xffffff, 2, 100);
    pointLight.position.set(0, 0, 0); // Position light at the Sun
    scene.add(pointLight);

    // Sun (with texture)
    const sunGeometry = new THREE.SphereGeometry(2, 64, 64);
    const sunMaterial = new THREE.MeshStandardMaterial({
      map: sunTextureMap,
      emissive: 0xffff00, // Makes the sun glow
      emissiveIntensity: 1,
    });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.castShadow = true; // Sun casts shadow
    scene.add(sun);

    // Earth (with texture)
    const earthGeometry = new THREE.SphereGeometry(0.5, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthTextureMap,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.position.x = 6;
    earth.castShadow = true; // Earth casts shadow
    earth.receiveShadow = true; // Earth receives shadow from the Sun
    scene.add(earth);

    // Camera position
    camera.position.z = 15;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate the Earth around its own axis
      earth.rotation.y += 0.01;

      // Orbit Earth around the Sun
      earth.position.x = Math.cos(Date.now() * 0.001) * 6;
      earth.position.z = Math.sin(Date.now() * 0.001) * 6;

      renderer.render(scene, camera);
    };

    animate();

    // Resize the canvas on window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Clean up on component unmount
    return () => {
      mountRef.current.removeChild(renderer.domElement);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <div ref={mountRef}></div>;
}

export default Orrery;
