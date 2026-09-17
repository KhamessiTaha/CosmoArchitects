import React from 'react';
import { Link } from 'react-router-dom';
import { moments } from '../../data/moments';

const chronological = [...moments].sort((a, b) => Date.parse(a.event) - Date.parse(b.event));
const dayFormat = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'long', timeZone: 'UTC' });

function MomentsTimeline() {
  return (
    <section id="moments" className="section moments" aria-labelledby="moments-title">
      <h2 id="moments-title" className="section-title display">
        Moments worth visiting
      </h2>
      <p className="section-lede">Each one opens the explorer at the right date, scale and viewpoint.</p>
      <ol className="timeline">
        {chronological.map((moment) => {
          const date = new Date(moment.event);
          return (
            <li key={moment.id}>
              <Link to={`/explore?moment=${moment.id}`} className="timeline-entry">
                <span className="timeline-year display tabular">{date.getUTCFullYear()}</span>
                <span className="timeline-day">{dayFormat.format(date)}</span>
                <strong>{moment.title}</strong>
                <span className="timeline-description">{moment.summary}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default MomentsTimeline;
