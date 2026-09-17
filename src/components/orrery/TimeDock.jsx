import React from 'react';
import { Pause, Play, ChevronLeft, ChevronRight, Link2, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { ACCURATE_YEARS, SPEED_PRESETS, julianDateFromYear, msFromJulianDate, yearFromJulianDate } from '../../lib/clock';

const SCRUB = { from: 1800, to: 2100 };
const CENTURIES = [1800, 1900, 2000, 2100];

const dateFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' });

const position = (year) => `${((year - SCRUB.from) / (SCRUB.to - SCRUB.from)) * 100}%`;

// The explorer's instrument: play state, the simulated date, speed and a 1800–2100 scrubber.
function TimeDock({
  time,
  speedIndex,
  onSpeedIndexChange,
  isPaused,
  onPausedChange,
  onJump,
  onNow,
  scale,
  neoMessage,
  onShare,
  shareStatus,
  onDismissShare,
  isMuted,
  onToggleMute,
  isFullscreen,
  onToggleFullscreen,
}) {
  const date = time ? new Date(msFromJulianDate(time.jd)) : null;
  const year = time ? yearFromJulianDate(time.jd) : SCRUB.from;
  // The real present, derived from the scene's report so rendering stays pure.
  const nowYear = time ? yearFromJulianDate(time.jd - time.offsetFromNowMs / 86400000) : null;
  const isLive = speedIndex === 0 && !isPaused && time !== null && Math.abs(time.offsetFromNowMs) < 120000;
  const isApproximate = year < ACCURATE_YEARS.from || year > ACCURATE_YEARS.to;
  const isNow = time !== null && Math.abs(time.offsetFromNowMs) < 120000;

  return (
    <div className="time-dock panel">
      <button type="button" className="play-button" onClick={() => onPausedChange(!isPaused)} aria-label={isPaused ? 'Play' : 'Pause'}>
        {isPaused ? <Play size={20} /> : <Pause size={20} />}
      </button>

      <div className="dock-date" aria-live="off">
        <p className="dock-date-main tabular">
          {date ? dateFormat.format(date) : ' '}
          <span className="dock-time">{date ? timeFormat.format(date) : ''}</span>
        </p>
        <p className="dock-status">
          {isLive && (
            <span className="live">
              <span className="live-dot" aria-hidden="true" />
              Live
            </span>
          )}
          <span>{scale === 'true' ? 'True scale' : 'Visual scale'}</span>
          {isApproximate && <span className="warning">Approximate before 1800 and after 2050</span>}
          {neoMessage && <span>{neoMessage}</span>}
        </p>
      </div>

      <div className="dock-speed" role="group" aria-label="Speed">
        <button
          type="button"
          className="icon-button"
          aria-label="Slower"
          disabled={speedIndex === 0}
          onClick={() => onSpeedIndexChange(speedIndex - 1)}
        >
          <ChevronLeft size={18} />
        </button>
        <span className="dock-speed-label">{SPEED_PRESETS[speedIndex].label}</span>
        <button
          type="button"
          className="icon-button"
          aria-label="Faster"
          disabled={speedIndex === SPEED_PRESETS.length - 1}
          onClick={() => onSpeedIndexChange(speedIndex + 1)}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="scrubber">
        <input
          type="range"
          aria-label="Year"
          aria-valuetext={date ? dateFormat.format(date) : undefined}
          min={SCRUB.from}
          max={SCRUB.to}
          step={1 / 365}
          value={Math.min(Math.max(year, SCRUB.from), SCRUB.to)}
          onChange={(event) => onJump(julianDateFromYear(Number(event.target.value)))}
        />
        <div className="scrubber-ticks" aria-hidden="true">
          {nowYear !== null && <span className="now-tick" style={{ left: position(nowYear) }} title="Today" />}
          {CENTURIES.map((century) => (
            <span key={century} className="century" style={{ left: position(century) }}>
              {century}
            </span>
          ))}
        </div>
      </div>

      <div className="dock-actions">
        <button type="button" className="button" onClick={onNow} disabled={isNow}>
          Now
        </button>
        <div className="share">
          <button type="button" className="icon-button" onClick={onShare} aria-label="Copy a link to this view">
            <Link2 size={18} />
          </button>
          {shareStatus && (
            <div className="share-popover panel" role="status">
              {shareStatus.copied ? (
                <p>Link copied</p>
              ) : (
                <input readOnly aria-label="Link to this view" value={shareStatus.url} onFocus={(event) => event.target.select()} />
              )}
              <button type="button" className="text-button" onClick={onDismissShare}>
                Close
              </button>
            </div>
          )}
        </div>
        <button type="button" className="icon-button" onClick={onToggleMute} aria-label={isMuted ? 'Play music' : 'Mute music'}>
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <button type="button" className="icon-button" onClick={onToggleFullscreen} aria-label={isFullscreen ? 'Exit full screen' : 'Full screen'}>
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>
    </div>
  );
}

export default TimeDock;
