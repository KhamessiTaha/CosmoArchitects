import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { pickNearest } from './picking';

function cameraLookingAtOrigin() {
  const camera = new THREE.PerspectiveCamera(75, 800 / 600, 1e-6, 1e5);
  camera.position.set(0, 0, 10);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  return camera;
}

const viewport = { width: 800, height: 600 };

describe('pickNearest', () => {
  it('picks a sub-pixel body when the pointer is within the minimum radius', () => {
    const tiny = { name: 'tiny', position: new THREE.Vector3(0, 0, 0), radius: 1e-6 };
    expect(pickNearest([tiny], cameraLookingAtOrigin(), viewport, { x: 410, y: 305 })).toBe(tiny);
    expect(pickNearest([tiny], cameraLookingAtOrigin(), viewport, { x: 450, y: 300 })).toBeNull();
  });

  it('uses the projected disc for large bodies and prefers the closest on screen', () => {
    const big = { name: 'big', position: new THREE.Vector3(0, 0, 0), radius: 3 };
    const near = { name: 'near', position: new THREE.Vector3(1, 0, 0), radius: 0.01 };
    const camera = cameraLookingAtOrigin();
    // Radius 3 at distance 10 projects to ~117 px.
    expect(pickNearest([big], camera, viewport, { x: 500, y: 300 })).toBe(big);
    expect(pickNearest([big], camera, viewport, { x: 540, y: 300 })).toBeNull();
    // `near` projects to ~x=439; pointer at 436 is closer to it than to the big body's centre.
    expect(pickNearest([big, near], camera, viewport, { x: 436, y: 300 })).toBe(near);
  });

  it('ignores bodies behind the camera', () => {
    const behind = { name: 'behind', position: new THREE.Vector3(0, 0, 20), radius: 1 };
    expect(pickNearest([behind], cameraLookingAtOrigin(), viewport, { x: 400, y: 300 })).toBeNull();
  });
});
