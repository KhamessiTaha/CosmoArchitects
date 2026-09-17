import React, { useId, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { searchBodies } from '../../lib/search';

const kindLabels = {
  star: 'Star',
  planet: 'Planet',
  'dwarf planet': 'Dwarf planet',
  moon: 'Moon',
  asteroid: 'Asteroid',
  comet: 'Comet',
  neo: 'Live NEO',
};

// Combobox over every body in the scene. `getEntries()` is read when the box gains focus,
// so bodies that load later (live NEOs) become searchable.
function SearchBox({ getEntries, onSelect, inputRef }) {
  const listId = useId();
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const results = useMemo(() => searchBodies(entries, query), [entries, query]);

  const choose = (entry) => {
    onSelect(entry);
    setQuery('');
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter' && results[activeIndex]) {
      choose(results[activeIndex]);
    } else if (event.key === 'Escape') {
      setQuery('');
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const showList = isOpen && query.trim() !== '';

  return (
    <div className="search-box">
      <div className="search-field">
        <Search size={16} className="search-icon" aria-hidden="true" />
        <input
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={showList && results[activeIndex] ? `${listId}-${activeIndex}` : undefined}
        aria-label="Search planets, moons, asteroids and comets"
        placeholder="Search bodies  ( / )"
        value={query}
        onFocus={() => {
          setEntries(getEntries());
          setIsOpen(true);
        }}
        onBlur={() => setIsOpen(false)}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
          setIsOpen(true);
        }}
        onKeyDown={handleKeyDown}
        />
      </div>
      {showList && (
        <ul id={listId} role="listbox" className="search-results">
          {results.length === 0 && <li className="search-empty">No matching bodies</li>}
          {results.map((entry, index) => (
            <li
              key={entry.key}
              id={`${listId}-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={index === activeIndex ? 'active' : ''}
              // mousedown (not click) fires before the input's blur closes the list
              onMouseDown={(event) => {
                event.preventDefault();
                choose(entry);
              }}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span>{entry.name}</span>
              <span className="search-kind">{kindLabels[entry.kind] || entry.kind}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SearchBox;
