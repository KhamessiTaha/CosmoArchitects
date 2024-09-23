// KeplerOrbitCalculator.js
export const calculateOrbit = (keplerianElements, T) => {
    const { a, e, I, L, w, Ω } = keplerianElements;

    // Mean anomaly (M = L - w)
    const M = L + keplerianElements.L_rate * T - (w + keplerianElements.w_rate * T);
    const E = solveKeplerEquation(M, e); // Solve Kepler's equation for eccentric anomaly

    // Compute heliocentric coordinates
    const x = a * (Math.cos(E) - e);
    const y = a * Math.sqrt(1 - e * e) * Math.sin(E);

    // Convert to 3D position
    const cosΩ = Math.cos(Ω);
    const sinΩ = Math.sin(Ω);
    const cosI = Math.cos(I);
    const sinI = Math.sin(I);
    const cosw = Math.cos(w);
    const sinw = Math.sin(w);

    const x_prime = x * (cosΩ * cosw - sinΩ * sinw * cosI) - y * (cosΩ * sinw + sinΩ * cosw * cosI);
    const y_prime = x * (sinΩ * cosw + cosΩ * sinw * cosI) - y * (sinΩ * sinw - cosΩ * cosw * cosI);
    const z_prime = x * sinw * sinI + y * cosw * sinI;

    return { x: x_prime, y: y_prime, z: z_prime };
};

// Solve Kepler's equation for eccentric anomaly
const solveKeplerEquation = (M, e) => {
    M = M % (2 * Math.PI);  // Normalize M between 0 and 2π
    let E = M;
    let delta = 0.05;
    while (Math.abs(delta) > 1e-6) {
        delta = E - e * Math.sin(E) - M;
        E = E - delta / (1 - e * Math.cos(E));
    }
    return E;
};
