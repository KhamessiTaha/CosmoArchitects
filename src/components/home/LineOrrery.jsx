import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { planetElements } from '../../data/planets';
import { asteroids } from '../../data/asteroids';
import { planetElementsAt, planetPosition, smallBodyPosition } from '../../lib/ephemeris';
import { elementsToEcliptic, julianDateFromMs } from '../../lib/kepler';
import { msFromJulianDate } from '../../lib/clock';
import { createRadialScale } from '../../lib/visualScale';

// Top-down, line-art view of the solar system. Pure SVG and the app's own ephemeris: no three.js on the landing page.
// A flat diagram needs more room for the inner planets than the 3D view, so rings are spaced more evenly.
const auToRadius = createRadialScale([
  [0, 0],
  [0.387, 13], // Mercury
  [0.723, 21], // Venus
  [1.0, 29], // Earth
  [1.524, 37], // Mars
  [5.203, 48], // Jupiter
  [9.537, 57], // Saturn
  [19.19, 65], // Uranus
  [30.07, 72], // Neptune
  [39.48, 78], // Pluto
]);
const VIEW = 92;
const SWEEP_DAYS = 365;
const SWEEP_MS = 2600;

const dotRadius = { jupiter: 2.1, saturn: 1.9, uranus: 1.6, neptune: 1.6 };

// Ecliptic AU -> SVG coordinates (north of the ecliptic up, planets move counter-clockwise).
function project({ x, y }) {
  const r = Math.hypot(x, y);
  if (r === 0) return [0, 0];
  const scaled = auToRadius(r) / r;
  return [x * scaled, -y * scaled];
}

function orbitPath(elements) {
  const { a, e, i, om, w } = elements;
  const points = [];
  for (let k = 0; k < 160; k++) {
    const E = (k / 160) * 2 * Math.PI;
    const M = ((E - e * Math.sin(E)) * 180) / Math.PI;
    points.push(project(elementsToEcliptic(a, e, i, om, w, M)));
  }
  return `M${points.map(([px, py]) => `${px.toFixed(2)},${py.toFixed(2)}`).join('L')}Z`;
}

// Orbit shapes drift over centuries, so computing them once per page load is plenty.
const orbits = planetElements.map((planet) => ({
  key: planet.key,
  d: orbitPath(planetElementsAt(planet, julianDateFromMs(Date.now()))),
}));
const asteroidList = Object.values(asteroids);

const dateFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

function LineOrrery() {
  const navigate = useNavigate();
  const planetRefs = useRef({});
  const asteroidGroupRef = useRef(null);
  const dateRef = useRef(null);

  useEffect(() => {
    const today = julianDateFromMs(Date.now());
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const place = (jd) => {
      planetElements.forEach((planet) => {
        const [px, py] = project(planetPosition(planet, jd));
        planetRefs.current[planet.key]?.setAttribute('transform', `translate(${px.toFixed(3)} ${py.toFixed(3)})`);
      });
      const dots = asteroidGroupRef.current?.children ?? [];
      asteroidList.forEach((body, k) => {
        const [px, py] = project(smallBodyPosition(body, jd));
        dots[k]?.setAttribute('cx', px.toFixed(3));
        dots[k]?.setAttribute('cy', py.toFixed(3));
      });
      if (dateRef.current) dateRef.current.textContent = dateFormat.format(new Date(msFromJulianDate(jd)));
    };

    if (reduceMotion) {
      place(today);
      return undefined;
    }

    // One orchestrated moment: the planets travel through the past year and settle on today.
    let frame;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / SWEEP_MS, 1);
      place(today - SWEEP_DAYS * (1 - easeOutCubic(progress)));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, []);

  const flyTo = (event, key) => {
    event.preventDefault();
    navigate(`/explore?focus=${key}`);
  };

  return (
    <figure className="line-orrery">
      <svg viewBox={`${-VIEW} ${-VIEW} ${VIEW * 2} ${VIEW * 2}`} role="group" aria-label="Positions of the planets today, seen from above">
        <g className="orbits">
          {orbits.map(({ key, d }) => (
            <path key={key} d={d} />
          ))}
        </g>

        <g className="asteroids" ref={asteroidGroupRef} aria-hidden="true">
          {asteroidList.map((body) => (
            <circle key={body.name} r="0.35" />
          ))}
        </g>

        <g className="sun" aria-hidden="true">
          <circle r="2.6" />
          <circle r="4.2" className="sun-ring" />
        </g>

        {planetElements.map((planet) => (
          <a
            key={planet.key}
            href={`/explore?focus=${planet.key}`}
            onClick={(event) => flyTo(event, planet.key)}
            className={`planet ${planet.key === 'earth' ? 'planet-earth' : ''}`}
            aria-label={`Fly to ${planet.name}`}
          >
            <g ref={(node) => (planetRefs.current[planet.key] = node)}>
              <circle r="5" className="hit" />
              <circle r={dotRadius[planet.key] ?? 1.2} className="dot" />
              <text x="3.2" y="1.4">
                {planet.name}
              </text>
            </g>
          </a>
        ))}
      </svg>
      <figcaption>
        Positions for <span ref={dateRef} className="tabular" /> <span className="caption-hint">Select a planet to fly there.</span>
      </figcaption>
    </figure>
  );
}

export default LineOrrery;
