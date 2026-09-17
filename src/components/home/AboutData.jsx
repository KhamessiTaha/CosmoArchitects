import React from 'react';

const sources = [
  { name: 'JPL Keplerian elements for the major planets', use: 'Planet and Pluto orbits' },
  { name: 'JPL Small-Body Database', use: 'Near-Earth asteroid and comet catalog' },
  { name: 'JPL Horizons', use: 'Reference positions the app is tested against' },
  { name: 'NASA NeoWs', use: 'Near-Earth objects loaded live' },
];

function AboutData() {
  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="about-copy">
        <h2 id="about-title" className="section-title display">
          Built on real orbital data
        </h2>
        <p>
          Positions come from published orbital elements, not animation. Every release is checked against NASA JPL Horizons:
          planets land within 0.2° of their true positions between 1950 and 2049, and the Moon within half a degree.
        </p>
        <p>
          CosmicVue started as the CosmoArchitects entry to the 2024 NASA Space Apps Challenge, where it was named a Global
          Finalist.
        </p>
        <a className="text-link" href="https://github.com/KhamessiTaha/CosmoArchitects" target="_blank" rel="noopener noreferrer">
          View the source on GitHub
        </a>
      </div>
      <dl className="sources">
        {sources.map(({ name, use }) => (
          <div key={name}>
            <dt>{name}</dt>
            <dd>{use}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default AboutData;
