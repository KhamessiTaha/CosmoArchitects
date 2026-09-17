import React from 'react';
import { CalendarClock, Scaling, Orbit, Link2 } from 'lucide-react';

const capabilities = [
  {
    icon: CalendarClock,
    title: 'Travel through time',
    text: 'Jump to any date between 1800 and 2100, or let time run anywhere from real time to a year per second.',
  },
  {
    icon: Scaling,
    title: 'Switch to true scale',
    text: 'Start with everything in view, then watch the planets shrink to their real sizes and spread to their real distances.',
  },
  {
    icon: Orbit,
    title: 'Follow near-Earth objects',
    text: 'Show a catalog of near-Earth asteroids and comets, or load the objects NASA is tracking today.',
  },
  {
    icon: Link2,
    title: 'Share exactly what you see',
    text: 'Every view has a link with its date, target and scale, ready to drop into a lesson or a post.',
  },
];

function Capabilities() {
  return (
    <section className="section capabilities" aria-labelledby="capabilities-title">
      <h2 id="capabilities-title" className="section-title display">
        What you can do
      </h2>
      <ul className="capability-list">
        {capabilities.map(({ icon: Icon, title, text }) => (
          <li key={title}>
            <Icon size={28} strokeWidth={1.5} aria-hidden="true" />
            <h3>{title}</h3>
            <p>{text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Capabilities;
