import * as THREE from 'three';
import { easeInOutCubic } from '../../lib/scale';

// Closest the camera may frame a body, so sub-kilometre asteroids at true scale stay above the near plane.
const MIN_VIEW_DISTANCE = 2e-4;

/**
 * Drives the camera on top of OrbitControls:
 *  - flyTo: animated approach with logarithmic zoom (distances can change by 10^6)
 *  - follow: keeps a moving subject centred while the user orbits around it
 *  - keeps the framing when the subject's size changes (scale-mode transitions)
 * subject: { getPosition(): Vector3, getRadius(): number }
 */
export function createCameraRig(camera, controls, homePosition) {
  let subject = null;
  let flight = null;
  const lastPosition = new THREE.Vector3();
  let lastRadius = 1;
  const scratch = new THREE.Vector3();

  // `getEndDistance` is re-evaluated every frame, so the approach adapts if the subject changes size mid-flight.
  const startFlight = (target, getEndDistance, direction, duration) => {
    flight = {
      target,
      elapsed: 0,
      duration,
      startTarget: controls.target.clone(),
      startDistance: Math.max(camera.position.distanceTo(controls.target), 1e-9),
      getEndDistance,
      // Pull back mid-flight in proportion to the distance travelled, so long hops show the context.
      arc: controls.target.distanceTo(target.getPosition()) * 0.35,
      direction,
    };
    controls.enabled = false;
    controls.minDistance = 0;
  };

  return {
    get subject() {
      return subject;
    },

    // `preferredDirection` (from the subject toward the camera) is mixed into the current viewing angle,
    // e.g. to arrive on a planet's day side.
    // `viewRadii` sets the final camera distance in radii of the subject (default 4).
    flyTo(nextSubject, { duration = 1.6, preferredDirection = null, viewRadii = 4 } = {}) {
      subject = nextSubject;
      const position = nextSubject.getPosition();
      const direction = camera.position.clone().sub(position);
      if (direction.lengthSq() < 1e-18) direction.set(0.3, 0.3, 1);
      direction.normalize();
      if (preferredDirection) direction.multiplyScalar(0.35).addScaledVector(preferredDirection, 0.65).normalize();
      startFlight(nextSubject, () => Math.max(nextSubject.getRadius() * viewRadii, MIN_VIEW_DISTANCE), direction, duration);
    },

    goHome({ duration = 1.6 } = {}) {
      subject = null;
      const origin = { getPosition: () => new THREE.Vector3(), getRadius: () => 0 };
      startFlight(origin, () => homePosition.length(), homePosition.clone().normalize(), duration);
    },

    update(dtMs) {
      if (flight) {
        flight.elapsed += dtMs / 1000;
        const p = easeInOutCubic(Math.min(flight.elapsed / flight.duration, 1));
        const targetPosition = flight.target.getPosition();
        controls.target.lerpVectors(flight.startTarget, targetPosition, p);
        const distance =
          Math.exp(Math.log(flight.startDistance) * (1 - p) + Math.log(flight.getEndDistance()) * p) + flight.arc * Math.sin(Math.PI * p);
        // Blend the view direction from the current offset to the approach direction.
        scratch.copy(camera.position).sub(controls.target).normalize().lerp(flight.direction, p).normalize();
        camera.position.copy(controls.target).addScaledVector(scratch, distance);

        if (p >= 1) {
          flight = null;
          controls.enabled = true;
        }
        if (subject) {
          lastPosition.copy(subject.getPosition());
          lastRadius = subject.getRadius();
        }
        return;
      }

      if (!subject) return;
      const position = subject.getPosition();
      const radius = subject.getRadius();

      // Follow: move the camera with the subject.
      camera.position.add(scratch.subVectors(position, lastPosition));
      controls.target.copy(position);

      // Keep framing when the subject grows or shrinks (visual <-> true scale).
      if (radius > 0 && lastRadius > 0 && Math.abs(radius / lastRadius - 1) > 1e-9) {
        const offset = scratch.subVectors(camera.position, position).multiplyScalar(radius / lastRadius);
        camera.position.copy(position).add(offset);
      }
      controls.minDistance = Math.max(radius * 1.2, MIN_VIEW_DISTANCE / 4);

      lastPosition.copy(position);
      lastRadius = radius;
    },

    release() {
      subject = null;
      controls.minDistance = 0;
    },
  };
}
