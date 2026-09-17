// Minimal JPL Horizons API client for the maintenance scripts (https://ssd-api.jpl.nasa.gov/doc/horizons.html).
const API = 'https://ssd.jpl.nasa.gov/api/horizons.api';

export const toJD = (isoDateTime) => Date.parse(isoDateTime) / 86400000 + 2440587.5;

async function query(command, center, jds, extra) {
  const params = new URLSearchParams({
    format: 'json',
    COMMAND: `'${command}'`,
    OBJ_DATA: 'NO',
    MAKE_EPHEM: 'YES',
    CENTER: `'${center}'`,
    TLIST: jds.map((jd) => `'${jd}'`).join(' '),
    TLIST_TYPE: 'JD',
    REF_PLANE: 'ECLIPTIC',
    REF_SYSTEM: 'ICRF',
    OUT_UNITS: 'AU-D',
    CSV_FORMAT: 'YES',
    ...extra,
  });
  const response = await fetch(`${API}?${params}`);
  if (!response.ok) throw new Error(`Horizons ${command}: HTTP ${response.status}`);
  const { result } = await response.json();
  const table = result.split('$$SOE')[1]?.split('$$EOE')[0];
  if (!table) throw new Error(`Horizons ${command}: no ephemeris\n${result.slice(0, 500)}`);
  return table
    .trim()
    .split('\n')
    .map((line) => line.split(',').map((cell) => cell.trim()));
}

// Heliocentric (or `center`-relative) state vectors in AU, ecliptic J2000.
export async function vectors(command, center, jds) {
  const rows = await query(command, center, jds, { EPHEM_TYPE: 'VECTORS', VEC_TABLE: '1' });
  return rows.map(([jd, , x, y, z]) => ({ jd: Number(jd), x: Number(x), y: Number(y), z: Number(z) }));
}

// Osculating heliocentric elements (AU, degrees, deg/day) at a single epoch.
export async function osculatingElements(command, jd) {
  const [[epoch, , e, , i, om, w, , n, ma, , a]] = await query(command, '500@10', [jd], { EPHEM_TYPE: 'ELEMENTS' });
  return { epoch: Number(epoch), a: Number(a), e: Number(e), i: Number(i), om: Number(om), w: Number(w), ma: Number(ma), meanMotion: Number(n) };
}
