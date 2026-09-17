import * as THREE from 'three';

// Name tag with a constant on-screen size (independent of zoom and scale mode), drawn above its anchor.
// `height` is a fraction of the viewport height.
export function createScreenLabel(text, { height = 0.035, fontSize = 48 } = {}) {
  const padding = 16;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = `${fontSize}px Arial`;
  canvas.width = Math.ceil(context.measureText(text).width + padding * 2);
  canvas.height = fontSize + padding;

  context.fillStyle = 'rgba(0, 0, 0, 0.6)';
  context.beginPath();
  context.roundRect(0, 0, canvas.width, canvas.height, 12);
  context.fill();
  context.font = `${fontSize}px Arial`;
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2 + 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const label = new THREE.Sprite(
    new THREE.SpriteMaterial({ map: texture, sizeAttenuation: false, depthTest: false, depthWrite: false })
  );
  label.scale.set((height * canvas.width) / canvas.height, height, 1);
  label.center.set(0.5, -0.6); // sit just above the anchor point
  label.renderOrder = 10;
  return label;
}

// Soft additive glow with a constant on-screen size, so a star stays visible when its disc is sub-pixel.
export function createGlareSprite(color = '255, 220, 150', size = 0.18) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, `rgba(${color}, 1)`);
  gradient.addColorStop(0.15, `rgba(${color}, 0.6)`);
  gradient.addColorStop(1, `rgba(${color}, 0)`);
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);

  const sprite = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: new THREE.CanvasTexture(canvas),
      sizeAttenuation: false,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    })
  );
  sprite.scale.set(size, size, 1);
  return sprite;
}
