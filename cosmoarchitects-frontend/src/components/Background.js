import * as THREE from 'three';
import { useRef, useEffect } from 'react';

function Background({ camera, scene, stars }) {
  useEffect(() => {
    const starGeometry = new THREE.SphereGeometry(0.1, 24, 24);
    const starMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

    // Create stars
    for (let i = 0; i < 500; i++) {
      const star = new THREE.Mesh(starGeometry, starMaterial);
      const [x, y, z] = Array(3).fill().map(() => THREE.MathUtils.randFloatSpread(200));
      star.position.set(x, y, z);
      scene.add(star);
      stars.current.push(star);  // Push each star into the stars ref
    }
  }, [scene, stars]);

  return null;
}

// Move animateStars outside the component
const animateStars = (camera, stars) => {
  stars.current.forEach(star => {
    star.position.x += (camera.rotation.x * 0.01);
    star.position.y += (camera.rotation.y * 0.01);
    star.position.z += (camera.rotation.z * 0.01);
  });
};

// Export both the component and animateStars
export { Background, animateStars };
