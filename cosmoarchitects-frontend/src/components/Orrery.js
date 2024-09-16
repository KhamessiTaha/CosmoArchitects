import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

function Orrery() {
  const mountRef = useRef(null);

  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    mountRef.current.appendChild(renderer.domElement);

    // Create Sun
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sun = new THREE.Mesh(geometry, material);
    scene.add(sun);

    // Create Earth
    const earthGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const earthMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.position.x = 5;
    scene.add(earth);

    camera.position.z = 10;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate Earth
      earth.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    return () => mountRef.current.removeChild(renderer.domElement);
  }, []);

  return <div ref={mountRef}></div>;
}

export default Orrery;
