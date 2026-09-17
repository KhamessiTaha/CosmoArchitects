import { useEffect, useRef, useState } from 'react';

// Loops through `tracks` in order. Returns props to spread on an <audio> element plus mute controls.
export function useMusicPlaylist(tracks) {
  const audioRef = useRef(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = isMuted;
    if (!isMuted) {
      // Browsers block autoplay until the user interacts; fall back to the muted state.
      audio.play().catch(() => setIsMuted(true));
    }
  }, [isMuted, trackIndex]);

  return {
    audioProps: {
      ref: audioRef,
      src: tracks[trackIndex],
      preload: 'none',
      onEnded: () => setTrackIndex((index) => (index + 1) % tracks.length),
    },
    isMuted,
    toggleMute: () => setIsMuted((muted) => !muted),
  };
}
