import { useEffect, useRef } from 'react';

// Mounts a framework-free scene once and disposes it on unmount:
//   factory(mountElement, { ...options, ...callbacks }) => controller with dispose()
// `options` are read once at mount. Callbacks are forwarded through a ref, so parents can pass
// inline functions without rebuilding the scene.
export function useSceneController(factory, callbacks, options) {
  const mountRef = useRef(null);
  const controllerRef = useRef(null);
  const callbacksRef = useRef(callbacks);
  const optionsRef = useRef(options);

  useEffect(() => {
    callbacksRef.current = callbacks;
  });

  useEffect(() => {
    const forwarded = Object.fromEntries(
      Object.keys(callbacksRef.current).map((name) => [name, (...args) => callbacksRef.current[name]?.(...args)])
    );
    const controller = factory(mountRef.current, { ...optionsRef.current, ...forwarded });
    controllerRef.current = controller;
    return () => {
      controllerRef.current = null;
      controller.dispose();
    };
  }, [factory]);

  return { mountRef, controllerRef };
}
