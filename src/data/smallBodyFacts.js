// Fact-card content for asteroids and comets, derived from their catalog / NeoWs entries.
const orbitClasses = {
  ATE: 'Aten-group near-Earth asteroid',
  APO: 'Apollo-group near-Earth asteroid',
  AMO: 'Amor-group near-Earth asteroid',
  IEO: 'Atira-group near-Earth asteroid',
  JFc: 'Jupiter-family comet',
  HTC: 'Halley-type comet',
  ETc: 'Encke-type comet',
  CTc: 'Chiron-type comet',
};

function formatPeriod(days) {
  if (!Number.isFinite(days)) return undefined;
  return days < 730 ? `${Math.round(days)} days` : `${(days / 365.25).toFixed(1)} years`;
}

export function smallBodyFacts(body, kind) {
  const periodDays = Number(body.per) || (body.meanMotion ? 360 / body.meanMotion : 360 * Math.pow(body.a, 1.5) / 0.9856076686);
  const hazardous = body.pha === 'Y' || body.hazardous === true;
  return {
    name: body.name,
    type: kind === 'comet' ? 'Comet' : 'Asteroid',
    planetType: orbitClasses[body.class] || (kind === 'neo' ? 'Near-Earth object (live from NASA NeoWs)' : undefined),
    radius: body.diameter ? body.diameter / 2 : undefined,
    semiMajorAxis: `${body.a.toFixed(3)} AU`,
    eccentricity: body.e.toFixed(3),
    inclination: `${body.i.toFixed(1)}°`,
    orbitalPeriod: formatPeriod(periodDays),
    hazard: hazardous ? 'Potentially hazardous asteroid' : undefined,
  };
}
