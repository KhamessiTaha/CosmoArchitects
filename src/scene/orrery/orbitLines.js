import * as THREE from 'three';
import { sampleOrbit } from '../../lib/kepler';
import { UNITS_PER_AU } from '../../lib/scale';
import { toVisualScale } from '../../lib/visualScale';

const toFloat32 = (points) => {
  const array = new Float32Array(points.length * 3);
  points.forEach((point, k) => point.toArray(array, k * 3));
  return array;
};

// An orbit path precomputed in both scale modes; setBlend(t) interpolates between them (0 = visual, 1 = true).
export function createOrbitLine(elements, segments, material) {
  const vector = () => new THREE.Vector3();
  const visual = toFloat32(sampleOrbit(elements, segments, vector, toVisualScale));
  const real = toFloat32(sampleOrbit(elements, segments, vector, (p) => p.multiplyScalar(UNITS_PER_AU)));

  const geometry = new THREE.BufferGeometry();
  const positions = new THREE.BufferAttribute(visual.slice(), 3);
  geometry.setAttribute('position', positions);
  const line = new THREE.Line(geometry, material);
  line.frustumCulled = false;

  return {
    line,
    setBlend(t) {
      const out = positions.array;
      for (let k = 0; k < out.length; k++) out[k] = visual[k] + (real[k] - visual[k]) * t;
      positions.needsUpdate = true;
    },
  };
}
