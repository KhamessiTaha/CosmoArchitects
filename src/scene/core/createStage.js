import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { disposeScene } from '../../lib/disposeScene';

// Everything a three.js view needs around its content: renderer, camera, controls, asset loading,
// resize handling, the frame loop and full teardown.
export function createStage(mount, { fov = 75, near, far, cameraPosition, renderer: rendererOptions = {}, onLoadProgress, onLoaded }) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, near, far);
  camera.position.copy(cameraPosition);

  const renderer = new THREE.WebGLRenderer({ antialias: true, ...rendererOptions });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  mount.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const loadingManager = new THREE.LoadingManager();
  loadingManager.onProgress = (_url, loaded, total) => onLoadProgress?.(loaded / total);
  loadingManager.onLoad = () => onLoaded?.();

  const textureLoader = new THREE.TextureLoader(loadingManager);
  const loadTexture = (url, { color = false } = {}) => {
    const texture = textureLoader.load(url);
    if (color) texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  const handleResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', handleResize);

  const cleanups = [];
  let frameId = null;

  // `update(dt)` runs before the controls update and render; `afterRender` runs after.
  const start = (update, afterRender) => {
    let lastFrame = performance.now();
    const frame = (now) => {
      frameId = requestAnimationFrame(frame);
      // Clamp so returning to a background tab doesn't make the simulation jump.
      const dt = Math.min(now - lastFrame, 100);
      lastFrame = now;
      update(dt);
      controls.update();
      renderer.render(scene, camera);
      afterRender?.();
    };
    frameId = requestAnimationFrame(frame);
  };

  const dispose = () => {
    if (frameId !== null) cancelAnimationFrame(frameId);
    window.removeEventListener('resize', handleResize);
    cleanups.forEach((cleanup) => cleanup());
    controls.dispose();
    disposeScene(scene);
    renderer.dispose();
    renderer.domElement.remove();
  };

  return {
    scene,
    camera,
    renderer,
    controls,
    loadingManager,
    loadTexture,
    start,
    onDispose: (cleanup) => cleanups.push(cleanup),
    dispose,
  };
}
