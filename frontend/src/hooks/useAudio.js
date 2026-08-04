import { useState, useRef, useCallback } from 'react';
import { Howl } from 'howler';

/**
 * Manages a Howler audio instance for the current song clip.
 */
export const useAudio = () => {
  const howlRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [seek, setSeek] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  const unload = useCallback(() => {
    if (howlRef.current) {
      howlRef.current.unload();
      howlRef.current = null;
    }
  }, []);

  const load = useCallback((url) => {
    unload();
    setReady(false);
    setPlaying(false);
    setDuration(0);
    setSeek(0);
    setError(null);

    if (!url) return;

    howlRef.current = new Howl({
      src: [url],
      format: ['mp3'],
      html5: true,
      onload: () => {
        setDuration(howlRef.current?.duration() || 0);
        setReady(true);
        setError(null);
      },
      onloaderror: (_id, err) => {
        setReady(false);
        setError(typeof err === 'string' ? err : 'Failed to load audio preview');
      },
      onplayerror: (_id, err) => {
        setError(typeof err === 'string' ? err : 'Failed to play audio');
        // Unlock audio on some browsers after a gesture
        howlRef.current?.once('unlock', () => howlRef.current?.play());
      },
      onplay: () => setPlaying(true),
      onpause: () => setPlaying(false),
      onstop: () => {
        setPlaying(false);
        setSeek(0);
      },
      onend: () => {
        setPlaying(false);
        setSeek(0);
      },
      onseek: () => setSeek(howlRef.current?.seek() || 0),
    });
  }, [unload]);

  const play = useCallback(() => howlRef.current?.play(), []);
  const pause = useCallback(() => howlRef.current?.pause(), []);
  const stop = useCallback(() => howlRef.current?.stop(), []);

  const seekTo = useCallback((seconds) => {
    howlRef.current?.seek(seconds);
    setSeek(seconds);
  }, []);

  return { load, play, pause, stop, seekTo, unload, playing, duration, seek, ready, error };
};
