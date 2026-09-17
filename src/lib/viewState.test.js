import { describe, expect, it } from 'vitest';
import { parseViewState, serializeViewState } from './viewState';
import { julianDateFromMs } from './kepler';

describe('parseViewState', () => {
  it('reads every supported parameter', () => {
    const state = parseViewState('?focus=earth&date=2029-04-13T21:46Z&scale=true&speed=1min&paused=1');
    expect(state).toEqual({
      focus: 'earth',
      jd: julianDateFromMs(Date.UTC(2029, 3, 13, 21, 46)),
      scale: 'true',
      speedIndex: 1,
      paused: true,
    });
  });

  it('treats zone-less dates as UTC and accepts plain days', () => {
    expect(parseViewState('?date=2003-08-27T09:51').jd).toBeCloseTo(julianDateFromMs(Date.UTC(2003, 7, 27, 9, 51)), 9);
    expect(parseViewState('?date=1986-02-09').jd).toBeCloseTo(julianDateFromMs(Date.UTC(1986, 1, 9)), 9);
  });

  it('ignores invalid values', () => {
    expect(parseViewState('?focus=<script>&date=soon&scale=huge&speed=warp')).toEqual({});
  });
});

describe('serializeViewState', () => {
  it('round-trips through parseViewState at minute precision', () => {
    const view = { focus: '1p-halley', jd: julianDateFromMs(Date.UTC(1986, 1, 9, 12, 30, 20)), scale: 'visual', speedIndex: 3, paused: true };
    const query = serializeViewState(view);
    expect(query).toBe('focus=1p-halley&date=1986-02-09T12%3A30Z&scale=visual&speed=1d&paused=1');
    const parsed = parseViewState(`?${query}`);
    expect(parsed.jd).toBeCloseTo(julianDateFromMs(Date.UTC(1986, 1, 9, 12, 30)), 9);
    expect({ ...parsed, jd: undefined }).toEqual({ ...view, jd: undefined });
  });

  it('omits the date and pause flag when not given', () => {
    expect(serializeViewState({ scale: 'true', speedIndex: 0, paused: false })).toBe('scale=true&speed=realtime');
  });
});
