// URL-safe identifier for a body name, e.g. "99942 Apophis (2004 MN4)" -> "99942-apophis-2004-mn4".
export function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const normalize = (text) => slugify(text).replace(/-/g, ' ');

/**
 * Ranks search entries ({ key, name, kind }) for a query: exact name, then name prefix,
 * then word prefix (e.g. "apophis" in "99942 Apophis (2004 MN4)"), then substring.
 * Major bodies win ties. Returns at most `limit` entries.
 */
export function searchBodies(entries, query, limit = 8) {
  const q = normalize(query);
  if (!q) return [];
  const majorKinds = new Set(['star', 'planet', 'moon']);

  return entries
    .map((entry) => {
      const name = normalize(entry.name);
      let score;
      if (name === q) score = 0;
      else if (name.startsWith(q)) score = 1;
      else if (name.split(' ').some((word) => word.startsWith(q))) score = 2;
      else if (name.includes(q)) score = 3;
      else return null;
      return { entry, score: score * 2 + (majorKinds.has(entry.kind) ? 0 : 1) };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, limit)
    .map(({ entry }) => entry);
}
