import * as THREE from 'three';

// Additive glow shell drawn from the inside (BackSide). The log-depth chunks are no-ops unless the
// renderer uses logarithmicDepthBuffer, in which case they are required for correct depth testing.
function createGlowShellMaterial(color, intensityExpression) {
  return new THREE.ShaderMaterial({
    uniforms: { glowColor: { value: new THREE.Color(color) } },
    vertexShader: `
      #include <common>
      #include <logdepthbuf_pars_vertex>
      varying float intensity;
      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vec3 viewNormal = normalize(normalMatrix * normal);
        vec3 viewDirection = normalize(-viewPosition.xyz);
        intensity = ${intensityExpression};
        gl_Position = projectionMatrix * viewPosition;
        #include <logdepthbuf_vertex>
      }
    `,
    fragmentShader: `
      #include <logdepthbuf_pars_fragment>
      uniform vec3 glowColor;
      varying float intensity;
      void main() {
        #include <logdepthbuf_fragment>
        gl_FragColor = vec4(glowColor * intensity, 1.0);
      }
    `,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
}

// Fresnel-style rim: brightest where the shell is seen edge-on (atmospheres, the stylised Sun halo).
export function createRimGlowMaterial(color, base, power) {
  return createGlowShellMaterial(
    color,
    `pow(max(${base.toFixed(2)} - dot(viewNormal, viewDirection), 0.0), ${power.toFixed(1)})`
  );
}

// Radial falloff: brightest directly behind the centre of the shell (a large, soft halo).
export function createHaloGlowMaterial(color, power) {
  return createGlowShellMaterial(color, `pow(max(-dot(viewNormal, viewDirection), 0.0), ${power.toFixed(1)})`);
}
