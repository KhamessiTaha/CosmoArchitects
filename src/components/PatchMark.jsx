import React from 'react';

// Line-art version of the CosmicVue mission patch, legible at icon sizes.
function PatchMark({ size = 28, className = '' }) {
  return (
    <svg
      className={className}
      width={size}
      height={(size * 34) / 28}
      viewBox="0 0 28 34"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 1.5 25.5 4.8v5.4c0 10.6-5.2 17.6-11.5 22.3C7.7 27.8 2.5 20.8 2.5 10.2V4.8Z" />
      <circle cx="14" cy="17" r="5.2" />
      <ellipse cx="14" cy="17" rx="10" ry="3.4" transform="rotate(-35 14 17)" />
      <circle cx="21.6" cy="11.4" r="1.4" fill="var(--signal)" stroke="none" />
    </svg>
  );
}

export default PatchMark;
