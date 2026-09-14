// Frees GPU memory held by a three.js scene: geometries, materials and every texture they reference.
export function disposeScene(scene) {
  const disposed = new Set();
  const dispose = (resource) => {
    if (resource && !disposed.has(resource) && typeof resource.dispose === 'function') {
      disposed.add(resource);
      resource.dispose();
    }
  };

  const disposeMaterial = (material) => {
    Object.values(material).forEach((value) => {
      if (value && value.isTexture) dispose(value);
    });
    if (material.uniforms) {
      Object.values(material.uniforms).forEach(({ value }) => {
        if (value && value.isTexture) dispose(value);
      });
    }
    dispose(material);
  };

  scene.traverse((object) => {
    dispose(object.geometry);
    if (Array.isArray(object.material)) object.material.forEach(disposeMaterial);
    else if (object.material) disposeMaterial(object.material);
  });

  if (scene.background && scene.background.isTexture) dispose(scene.background);
  if (scene.environment && scene.environment.isTexture) dispose(scene.environment);
}
