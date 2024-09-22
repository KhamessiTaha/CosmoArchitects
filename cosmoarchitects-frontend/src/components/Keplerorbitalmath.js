// Keplerian orbital elements for Earth (as an example)
const earthElements = {
    a: 1.00000261,  // Semi-major axis (in AU)
    e: 0.01671123,  // Eccentricity
    I: -0.00001531, // Inclination (degrees)
    L: 100.46457166, // Mean longitude (degrees)
    ω: 102.93768193, // Longitude of perihelion (degrees)
    Ω: 0.0          // Longitude of ascending node (degrees)
  };
  
  // Constants
  const AU = 149597870.7; // 1 Astronomical Unit in kilometers
  const J2000 = 2451545.0; // Julian date for J2000 epoch
  
  // Function to calculate Julian centuries since J2000
  function julianCenturies(julianDate) {
    return (julianDate - J2000) / 36525;
  }
  
  // Function to calculate the mean anomaly (M)
  function meanAnomaly(L, ω) {
    return THREE.MathUtils.degToRad(L - ω);
  }
  
  // Function to solve Kepler's Equation (M = E - e * sin(E))
  function solveKepler(M, e, tolerance = 1e-6) {
    let E = M;  // Initial guess for E
    let delta = 1;
  
    // Iteratively solve Kepler's equation
    while (Math.abs(delta) > tolerance) {
      delta = E - e * Math.sin(E) - M;
      E -= delta / (1 - e * Math.cos(E));
    }
  
    return E;
  }
  
  // Function to compute orbital position in 3D space
  function computeOrbitalPosition(elements, julianDate) {
    // Time in Julian centuries since J2000
    const T = julianCenturies(julianDate);
  
    // Calculate the mean anomaly
    const M = meanAnomaly(elements.L, elements.ω);
  
    // Solve Kepler's equation to find the eccentric anomaly
    const E = solveKepler(M, elements.e);
  
    // Compute heliocentric distance (r) and true anomaly (ν)
    const r = elements.a * (1 - elements.e * Math.cos(E));
    const ν = 2 * Math.atan2(Math.sqrt(1 + elements.e) * Math.sin(E / 2), Math.sqrt(1 - elements.e) * Math.cos(E / 2));
  
    // Position in the orbital plane (2D)
    const x = r * Math.cos(ν);
    const y = r * Math.sin(ν);
  
    // Convert to 3D ecliptic coordinates
    const I = THREE.MathUtils.degToRad(elements.I);  // Inclination
    const Ω = THREE.MathUtils.degToRad(elements.Ω);  // Longitude of ascending node
    const ω = THREE.MathUtils.degToRad(elements.ω);  // Argument of perihelion
  
    // Rotate the orbital plane to account for inclination, longitude of ascending node
    const cosΩ = Math.cos(Ω);
    const sinΩ = Math.sin(Ω);
    const cosI = Math.cos(I);
    const sinI = Math.sin(I);
  
    const X = x * (cosΩ * cosω - sinΩ * sinω * cosI) - y * (cosΩ * sinω + sinΩ * cosω * cosI);
    const Y = x * (sinΩ * cosω + cosΩ * sinω * cosI) + y * (cosΩ * cosω - sinΩ * sinω * cosI);
    const Z = x * sinω * sinI + y * cosω * sinI;
  
    return new THREE.Vector3(X, Y, Z).multiplyScalar(AU);  // Scale by AU to get position in km
  }
  
  // Update planetary positions
  function updatePlanetPositions(julianDate) {
    const earthPosition = computeOrbitalPosition(earthElements, julianDate);
  
    // Update Earth's position in the scene (assuming earthMesh exists)
    earthMesh.position.set(earthPosition.x, earthPosition.y, earthPosition.z);
  }
  
  // Main animation loop
  function animate() {
    const currentJulianDate = getCurrentJulianDate();
    updatePlanetPositions(currentJulianDate);
  
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  
  // Function to get the current Julian Date
  function getCurrentJulianDate() {
    const now = new Date();
    const jd = (now.getTime() / 86400000.0) + 2440587.5;
    return jd;
  }
  
  animate();
  