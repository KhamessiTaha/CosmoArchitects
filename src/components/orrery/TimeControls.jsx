import React, { useState } from 'react';
import { Rewind, FastForward, Pause, Play, Clock } from 'lucide-react';
import { ACCURATE_YEARS, SPEED_PRESETS, julianDateFromYear, msFromJulianDate, yearFromJulianDate } from '../../lib/clock';
import { julianDateFromMs } from '../../lib/kepler';
import { moments } from '../../data/moments';

const SCRUB_RANGE = { from: 1800, to: 2100 };

// <input type="datetime-local"> works in the viewer's local time.
const toLocalInputValue = (jd) => {
  const date = new Date(msFromJulianDate(jd));
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const momentDate = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' });

function TimeControls({ jd, speedIndex, onSpeedIndexChange, isPaused, onPausedChange, onJump, onNow, onMoment }) {
  // Initialised when the menu opens; the running clock doesn't overwrite what the user is typing.
  const [draftDate, setDraftDate] = useState(() => toLocalInputValue(jd));
  const year = yearFromJulianDate(jd);

  const jumpToDraft = (event) => {
    event.preventDefault();
    const ms = new Date(draftDate).getTime();
    if (Number.isFinite(ms)) onJump(julianDateFromMs(ms));
  };

  return (
    <>
      <section className="menu-section">
        <h3>Time</h3>
        <div className="speed-row">
          <button type="button" className="icon-button" aria-label="Slower" disabled={speedIndex === 0} onClick={() => onSpeedIndexChange(speedIndex - 1)}>
            <Rewind size={16} />
          </button>
          <span className="speed-label">{SPEED_PRESETS[speedIndex].label}</span>
          <button
            type="button"
            className="icon-button"
            aria-label="Faster"
            disabled={speedIndex === SPEED_PRESETS.length - 1}
            onClick={() => onSpeedIndexChange(speedIndex + 1)}
          >
            <FastForward size={16} />
          </button>
        </div>
        <div className="time-actions">
          <button type="button" className="icon-button" onClick={() => onPausedChange(!isPaused)}>
            {isPaused ? <Play size={16} /> : <Pause size={16} />} {isPaused ? 'Play' : 'Pause'}
          </button>
          <button type="button" className="icon-button" onClick={onNow}>
            <Clock size={16} /> Now
          </button>
        </div>

        <form className="date-jump" onSubmit={jumpToDraft}>
          <label htmlFor="date-jump-input">Go to date (local time)</label>
          <div>
            <input
              id="date-jump-input"
              type="datetime-local"
              min="1000-01-01T00:00"
              max="3000-12-31T23:59"
              value={draftDate}
              onChange={(event) => setDraftDate(event.target.value)}
            />
            <button type="submit" className="icon-button">
              Go
            </button>
          </div>
        </form>

        <label className="scrubber">
          <span>
            Scrub years <strong>{Math.floor(year)}</strong>
          </span>
          <input
            type="range"
            min={SCRUB_RANGE.from}
            max={SCRUB_RANGE.to}
            step={1 / 365}
            value={Math.min(Math.max(year, SCRUB_RANGE.from), SCRUB_RANGE.to)}
            onChange={(event) => onJump(julianDateFromYear(Number(event.target.value)))}
          />
          <span className="scrubber-scale">
            <span>{SCRUB_RANGE.from}</span>
            <span>{SCRUB_RANGE.to}</span>
          </span>
        </label>
        {(year < ACCURATE_YEARS.from || year > ACCURATE_YEARS.to) && (
          <p className="scale-hint">
            Planet positions are approximate outside {ACCURATE_YEARS.from}–{ACCURATE_YEARS.to}.
          </p>
        )}
      </section>

      <section className="menu-section">
        <h3>Moments</h3>
        <ul className="moment-list">
          {moments.map((moment) => (
            <li key={moment.id}>
              <button type="button" onClick={() => onMoment(moment)}>
                <strong>{moment.title}</strong>
                <span>{momentDate.format(new Date(moment.event))}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

export default TimeControls;
