import * as THREE from 'three';
import { createScreenLabel } from '../core/labels';
import { createOrbitLine } from './orbitLines';
import { eclipticToScene } from '../../lib/kepler';
import { smallBodyPosition } from '../../lib/ephemeris';
import { blendSize, kmToUnits, scalePosition } from '../../lib/scale';
import { slugify } from '../../lib/search';
import { SMALL_BODY_VISUAL_RADIUS } from './visualLayout';

const unitSphere = new THREE.SphereGeometry(1, 16, 16);

/**
 * A group of asteroids/comets rendered as: a Points cloud (fixed pixel size, visible at any scale),
 * orbit lines, and optionally textured meshes and name labels.
 * bodies: elements with a in AU (catalog or NeoWs entries).
 */
export function createSmallBodySet(stage, bodies, { kind, pointColor, orbitColor, orbitOpacity = 0.6, meshMaterial = null, labels = false }) {
  const group = new THREE.Group();
  stage.scene.add(group);

  const orbitMaterial = new THREE.LineBasicMaterial({ color: orbitColor, transparent: true, opacity: orbitOpacity });
  const scratch = new THREE.Vector3();

  const entries = bodies.map((body) => {
    const orbit = createOrbitLine(body, 256, orbitMaterial);
    group.add(orbit.line);

    let mesh = null;
    if (meshMaterial) {
      mesh = new THREE.Mesh(unitSphere, meshMaterial);
      group.add(mesh);
    }

    let label = null;
    if (labels) {
      label = createScreenLabel(body.name, { height: 0.024 });
      group.add(label);
    }

    const trueRadius = kmToUnits(Math.max((body.diameter || 1) / 2, 0.05));
    return { key: slugify(body.name), body, kind, orbit, mesh, label, trueRadius, position: new THREE.Vector3(), radius: 0 };
  });

  const pointPositions = new Float32Array(entries.length * 3);
  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute('position', new THREE.BufferAttribute(pointPositions, 3));
  const points = new THREE.Points(pointGeometry, new THREE.PointsMaterial({ color: pointColor, size: 3, sizeAttenuation: false }));
  points.frustumCulled = false;
  group.add(points);

  let visibility = { bodies: true, orbits: true, labels: false };

  return {
    entries,
    update(jd, t) {
      entries.forEach((entry, k) => {
        eclipticToScene(smallBodyPosition(entry.body, jd), entry.position);
        scalePosition(entry.position, t, scratch);
        entry.position.toArray(pointPositions, k * 3);
        entry.radius = blendSize(SMALL_BODY_VISUAL_RADIUS, entry.trueRadius, t);
        if (entry.mesh) {
          entry.mesh.position.copy(entry.position);
          entry.mesh.scale.setScalar(entry.radius);
        }
        entry.label?.position.copy(entry.position);
      });
      pointGeometry.attributes.position.needsUpdate = true;
    },
    setOrbitBlend(t) {
      entries.forEach((entry) => entry.orbit.setBlend(t));
    },
    setVisibility(next) {
      visibility = next;
      points.visible = next.bodies;
      entries.forEach((entry) => {
        entry.orbit.line.visible = next.bodies && next.orbits;
        if (entry.mesh) entry.mesh.visible = next.bodies;
        if (entry.label) entry.label.visible = next.bodies && next.labels;
      });
    },
    get visible() {
      return visibility.bodies;
    },
  };
}
