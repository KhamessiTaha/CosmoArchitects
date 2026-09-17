import { julianDateFromMs } from './kepler';

// Simulation speeds, expressed as simulated days per real second. `id` is used in shareable URLs.
export const SPEED_PRESETS = [
  { id: 'realtime', label: 'Real time', daysPerSecond: 1 / 86400 },
  { id: '1min', label: '1 minute / s', daysPerSecond: 1 / 1440 },
  { id: '1h', label: '1 hour / s', daysPerSecond: 1 / 24 },
  { id: '1d', label: '1 day / s', daysPerSecond: 1 },
  { id: '1w', label: '1 week / s', daysPerSecond: 7 },
  { id: '1mo', label: '1 month / s', daysPerSecond: 30.436875 },
  { id: '1y', label: '1 year / s', daysPerSecond: 365.25 },
];

export const speedIndexById = (id) => SPEED_PRESETS.findIndex((preset) => preset.id === id);

// JPL's approximate planetary elements are validated for this range; outside it positions drift.
export const ACCURATE_YEARS = { from: 1800, to: 2050 };

export const yearFromJulianDate = (jd) => 2000 + (jd - 2451545) / 365.25;
export const julianDateFromYear = (year) => 2451545 + (year - 2000) * 365.25;

export const msFromJulianDate = (jd) => (jd - 2440587.5) * 86400000;

// The simulation clock is a Julian date advanced by real elapsed time × the selected speed.
export function createClock({ jd = julianDateFromMs(Date.now()), speedIndex = 0, paused = false } = {}) {
  const state = { jd, speedIndex, paused };
  return {
    get jd() {
      return state.jd;
    },
    get daysPerSecond() {
      return SPEED_PRESETS[state.speedIndex].daysPerSecond;
    },
    get paused() {
      return state.paused;
    },
    tick(elapsedMs) {
      if (!state.paused) state.jd += (elapsedMs / 1000) * SPEED_PRESETS[state.speedIndex].daysPerSecond;
      return state.jd;
    },
    setSpeedIndex(index) {
      state.speedIndex = Math.max(0, Math.min(SPEED_PRESETS.length - 1, index));
    },
    setPaused(paused) {
      state.paused = paused;
    },
    setJulianDate(value) {
      state.jd = value;
    },
  };
}
