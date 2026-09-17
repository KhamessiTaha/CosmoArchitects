// Regenerates src/data/featuredBodies.json: bodies used by "moments" that are not in the SBDB catalog.
// Elements are osculating at the moment's date, where two-body propagation is most accurate.
// Usage: node scripts/fetch-featured-bodies.mjs
import { writeFile } from 'node:fs/promises';
import { osculatingElements, toJD } from './horizons.mjs';

const featured = [
  {
    name: '99942 Apophis (2004 MN4)',
    command: '99942;',
    epochIso: '2029-04-13T21:46:00Z',
    diameter: 0.34,
    pha: 'Y',
    class: 'ATE',
    note: 'Passes ~38,000 km from Earth on 2029-04-13; elements osculating at closest approach.',
  },
];

const bodies = {};
for (const { command, epochIso, ...body } of featured) {
  bodies[body.name] = { ...body, ...(await osculatingElements(command, toJD(epochIso))) };
}

await writeFile(new URL('../src/data/featuredBodies.json', import.meta.url), `${JSON.stringify(bodies, null, 2)}\n`);
console.log('Wrote src/data/featuredBodies.json');
