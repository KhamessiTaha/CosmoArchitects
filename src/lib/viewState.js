// Shareable view state <-> URL query parameters, e.g.
// ?focus=earth&date=2029-04-13T21:46Z&scale=true&speed=1min&paused=1
import { SPEED_PRESETS, msFromJulianDate, speedIndexById } from './clock';
import { julianDateFromMs } from './kepler';

// Returns only the fields present and valid in the query string.
export function parseViewState(search) {
  const params = new URLSearchParams(search);
  const state = {};

  const scale = params.get('scale');
  if (scale === 'true' || scale === 'visual') state.scale = scale;

  const focus = params.get('focus');
  if (focus && /^[a-z0-9-]{1,80}$/.test(focus)) state.focus = focus;

  const date = params.get('date');
  if (date) {
    // Accept dates without a zone as UTC so links mean the same moment everywhere.
    const ms = Date.parse(/[zZ]|[+-]\d\d:?\d\d$/.test(date) || !date.includes('T') ? date : `${date}Z`);
    if (Number.isFinite(ms)) state.jd = julianDateFromMs(ms);
  }

  const speedIndex = speedIndexById(params.get('speed'));
  if (speedIndex >= 0) state.speedIndex = speedIndex;

  if (params.has('paused')) state.paused = params.get('paused') !== '0';

  // A curated moment (data/moments.js); when present it supplies date, focus, scale and speed.
  const moment = params.get('moment');
  if (moment && /^[a-z0-9-]{1,60}$/.test(moment)) state.moment = moment;

  return state;
}

// Minute precision keeps links short; `jd` is optional (omitted while time is running freely).
export function serializeViewState({ scale, focus, jd, speedIndex, paused }) {
  const params = new URLSearchParams();
  if (focus) params.set('focus', focus);
  if (jd !== undefined && jd !== null) params.set('date', `${new Date(msFromJulianDate(jd)).toISOString().slice(0, 16)}Z`);
  if (scale) params.set('scale', scale);
  if (speedIndex !== undefined) params.set('speed', SPEED_PRESETS[speedIndex].id);
  if (paused) params.set('paused', '1');
  return params.toString();
}
