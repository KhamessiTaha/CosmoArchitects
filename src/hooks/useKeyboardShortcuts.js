import { useEffect, useRef } from 'react';

// `handler(key)` receives the lower-cased key for keydown events outside text inputs.
export function useKeyboardShortcuts(handler) {
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.closest?.('input, textarea, [contenteditable="true"]')) return;
      handlerRef.current(event.key.toLowerCase());
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
