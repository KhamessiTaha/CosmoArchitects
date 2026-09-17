import { describe, expect, it } from 'vitest';
import { searchBodies, slugify } from './search';

const entries = [
  { key: 'mars', name: 'Mars', kind: 'planet' },
  { key: 'moon', name: 'Moon', kind: 'moon' },
  { key: '99942-apophis-2004-mn4', name: '99942 Apophis (2004 MN4)', kind: 'asteroid' },
  { key: '1p-halley', name: '1P/Halley', kind: 'comet' },
  { key: '1221-amor-1932-ea1', name: '1221 Amor (1932 EA1)', kind: 'asteroid' },
  { key: 'marsden', name: 'Marsden', kind: 'asteroid' },
];

describe('slugify', () => {
  it('makes URL-safe keys from catalog names', () => {
    expect(slugify('99942 Apophis (2004 MN4)')).toBe('99942-apophis-2004-mn4');
    expect(slugify('1P/Halley')).toBe('1p-halley');
    expect(slugify('Pérez')).toBe('perez');
  });
});

describe('searchBodies', () => {
  it('matches words inside catalog designations', () => {
    expect(searchBodies(entries, 'apophis').map((e) => e.key)).toEqual(['99942-apophis-2004-mn4']);
    expect(searchBodies(entries, 'halley').map((e) => e.key)).toEqual(['1p-halley']);
    expect(searchBodies(entries, '2004 mn4').map((e) => e.key)).toEqual(['99942-apophis-2004-mn4']);
  });

  it('ranks exact and prefix matches first, and planets before small bodies', () => {
    expect(searchBodies(entries, 'mar').map((e) => e.key)).toEqual(['mars', 'marsden']);
    // Substring matches ("a-mo-r") still appear, after prefix matches.
    expect(searchBodies(entries, 'mo').map((e) => e.key)).toEqual(['moon', '1221-amor-1932-ea1']);
  });

  it('returns nothing for an empty query and respects the limit', () => {
    expect(searchBodies(entries, '  ')).toEqual([]);
    expect(searchBodies(entries, 'a', 2)).toHaveLength(2);
  });
});
