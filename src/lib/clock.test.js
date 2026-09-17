import { describe, expect, it } from 'vitest';
import { SPEED_PRESETS, createClock, msFromJulianDate } from './clock';
import { julianDateFromMs } from './kepler';

describe('createClock', () => {
  it('advances simulated days by real time × speed', () => {
    const clock = createClock({ jd: 2451545, speedIndex: SPEED_PRESETS.findIndex((p) => p.label === '1 week / s') });
    clock.tick(500);
    expect(clock.jd).toBeCloseTo(2451548.5, 9);
  });

  it('runs at wall-clock pace in real time', () => {
    const clock = createClock({ jd: 2451545, speedIndex: 0 });
    clock.tick(86400 * 1000);
    expect(clock.jd).toBeCloseTo(2451546, 9);
  });

  it('does not advance while paused and clamps the speed index', () => {
    const clock = createClock({ jd: 2451545, speedIndex: 3, paused: true });
    clock.tick(10000);
    expect(clock.jd).toBe(2451545);
    clock.setSpeedIndex(99);
    expect(clock.daysPerSecond).toBe(SPEED_PRESETS.at(-1).daysPerSecond);
  });

  it('converts Julian dates back to timestamps', () => {
    const ms = Date.UTC(2026, 8, 17, 6, 30);
    expect(msFromJulianDate(julianDateFromMs(ms))).toBeCloseTo(ms, 0);
  });
});
