import { useCallback, useEffect, useState } from 'react';

export function useFullscreen(elementRef) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else elementRef.current?.requestFullscreen?.();
  }, [elementRef]);

  return { isFullscreen, toggleFullscreen };
}
