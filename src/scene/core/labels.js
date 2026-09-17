import * as THREE from 'three';

function spriteFromCanvas(canvas, materialOptions = {}) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthWrite: false, ...materialOptions }));
}

// Compact name tag sized to its text; `height` is in world units.
export function createTextLabel(text, height = 0.4) {
  const fontSize = 60;
  const padding = 20;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  context.font = `${fontSize}px Arial`;
  canvas.width = Math.ceil(context.measureText(text).width + padding * 2);
  canvas.height = fontSize + padding;

  context.fillStyle = 'rgba(0, 0, 0, 0.7)';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.font = `${fontSize}px Arial`;
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  const label = spriteFromCanvas(canvas);
  label.scale.set((height * canvas.width) / canvas.height, height, 1);
  return label;
}

// Bordered 2:1 badge, drawn on top of everything; the caller scales it.
export function createBadgeLabel(text) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = 512;
  canvas.height = 256;

  context.fillStyle = 'rgba(0, 0, 0, 0.7)';
  context.beginPath();
  context.roundRect(0, 0, canvas.width, canvas.height, 20);
  context.fill();

  context.font = 'Bold 72px Arial';
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 256, 128);

  context.strokeStyle = 'white';
  context.lineWidth = 4;
  context.beginPath();
  context.roundRect(2, 2, canvas.width - 4, canvas.height - 4, 18);
  context.stroke();

  return spriteFromCanvas(canvas, { transparent: true, depthTest: false });
}
