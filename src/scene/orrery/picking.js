import * as THREE from 'three';

const projected = new THREE.Vector3();

/**
 * Screen-space picking: returns the candidate closest to the pointer, if it lies within its projected
 * disc or `minPixels` of it. Unlike ray casting this still works for bodies smaller than a pixel.
 * candidates: [{ position: Vector3, radius: number, ...anything }]
 */
export function pickNearest(candidates, camera, viewport, pointer, minPixels = 18) {
  const halfHeight = viewport.height / 2;
  const focalScale = halfHeight / Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
  let best = null;
  let bestDistance = Infinity;

  candidates.forEach((candidate) => {
    projected.copy(candidate.position).project(camera);
    if (projected.z > 1 || projected.z < -1) return; // behind the camera or beyond the far plane

    const x = (projected.x + 1) * (viewport.width / 2);
    const y = (1 - projected.y) * halfHeight;
    const screenDistance = Math.hypot(pointer.x - x, pointer.y - y);
    const cameraDistance = camera.position.distanceTo(candidate.position);
    const pixelRadius = (candidate.radius / cameraDistance) * focalScale;

    if (screenDistance <= Math.max(pixelRadius, minPixels) && screenDistance < bestDistance) {
      best = candidate;
      bestDistance = screenDistance;
    }
  });

  return best;
}
