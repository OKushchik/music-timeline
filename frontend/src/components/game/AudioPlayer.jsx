import { useEffect, useRef, useState } from 'react';
import Button from '../shared/Button';
import { useAudio } from '../../hooks/useAudio';
import { useMusicProvider } from '../../context/MusicProviderContext';
import { localSongApi } from '../../api/localSongApi';

/**
 * AudioPlayer — renders differently based on the active music provider:
 *
 *  deezer   → Howler HTML5 (30s MP3 preview)
 *  spotify  → official Spotify Embed widget (needs spotifyId)
 *  youtube  → YouTube iframe embed
 */
export default function AudioPlayer({ song, stopped = false }) {
  const { provider } = useMusicProvider();
  const { load, play, pause, stop, playing, duration, seek, ready, error } = useAudio();
  const [resolvedUrl, setResolvedUrl] = useState(song?.audioUrl || '');
  const [spotifyId, setSpotifyId] = useState(song?.spotifyId || '');
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState(null);
  const retriedRef = useRef(false);
  const songKey = song?._id || '';

  const isYoutube = provider === 'youtube';
  const isSpotify = provider === 'spotify';
  const isDeezer = !isYoutube && !isSpotify;
  const videoId = song?.videoId;
  const audioUrl = resolvedUrl;

  // Stop Howler as soon as the player answers
  useEffect(() => {
    if (stopped) stop();
  }, [stopped, stop]);

  // Resolve Spotify track id (for Embed) or Deezer MP3 preview
  useEffect(() => {
    let cancelled = false;
    retriedRef.current = false;

    const resolve = async () => {
      setResolveError(null);
      setResolvedUrl(song?.audioUrl || '');
      setSpotifyId(song?.spotifyId || '');

      if (isYoutube || !song?._id) return;

      if (isSpotify) {
        if (song.spotifyId) {
          setSpotifyId(song.spotifyId);
          return;
        }
        setResolving(true);
        try {
          const fresh = await localSongApi.getPreview(song._id);
          if (!cancelled && fresh?.spotifyId) {
            setSpotifyId(fresh.spotifyId);
            if (fresh.audioUrl) setResolvedUrl(fresh.audioUrl);
          } else if (!cancelled) {
            setResolveError('No Spotify track found');
          }
        } catch (err) {
          if (!cancelled) {
            setSpotifyId('');
            setResolveError(err?.response?.data?.message || 'Could not load Spotify track');
          }
        } finally {
          if (!cancelled) setResolving(false);
        }
        return;
      }

      // Deezer (and any Howler-based provider)
      if (!song.deezerId && !song.audioUrl) return;

      setResolving(true);
      try {
        const fresh = await localSongApi.getPreview(song._id);
        if (!cancelled && fresh?.audioUrl) {
          setResolvedUrl(fresh.audioUrl);
        } else if (!cancelled) {
          setResolvedUrl('');
          setResolveError('No preview available');
        }
      } catch (err) {
        if (!cancelled) {
          setResolvedUrl('');
          setResolveError(err?.response?.data?.message || 'Could not load preview');
        }
      } finally {
        if (!cancelled) setResolving(false);
      }
    };

    resolve();
    return () => {
      cancelled = true;
    };
  }, [songKey, song?.deezerId, song?.spotifyId, song?.audioUrl, isYoutube, isSpotify, song?._id]);

  // Howler only for Deezer-style MP3 previews
  useEffect(() => {
    if (isDeezer && audioUrl) {
      stop();
      load(audioUrl);
    }
    if (!isDeezer) stop();
  }, [audioUrl, isDeezer, load, stop]);

  // One retry if Howler fails (Deezer only)
  useEffect(() => {
    if (!error || !song?._id || !isDeezer || retriedRef.current) return;
    retriedRef.current = true;
    let cancelled = false;

    (async () => {
      try {
        const fresh = await localSongApi.getPreview(song._id);
        if (!cancelled && fresh?.audioUrl && fresh.audioUrl !== audioUrl) {
          setResolvedUrl(fresh.audioUrl);
        }
      } catch {
        /* keep Howler error */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [error, song?._id, isDeezer, audioUrl]);

  const progress = duration > 0 ? (seek / duration) * 100 : 0;
  const loadFailed = Boolean(error || resolveError);
  const canPlay = Boolean(song && audioUrl && ready && !loadFailed && !stopped);
  const [detailsVisible, setDetailsVisible] = useState(false);

  // Reset reveal when the song changes
  useEffect(() => {
    setDetailsVisible(false);
  }, [songKey]);

  const coverContent = song?.coverUrl
    ? <img src={song.coverUrl} alt="cover" className="w-full h-full object-cover rounded-lg" />
    : <span className="text-3xl">🎵</span>;

  const header = (badge) => (
    <div className="flex items-center gap-3">
      <div className="w-14 h-14 bg-darker rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
        {detailsVisible ? coverContent : <span className="text-3xl">🎵</span>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate">
          {detailsVisible && song ? song.title : '???'}
        </p>
        <p className="text-sm text-gray-400 truncate">
          {detailsVisible && song ? song.artist : song ? 'Hidden artist' : 'Waiting for song…'}
        </p>
        {badge}
      </div>
      {song && (
        <button
          type="button"
          onClick={() => setDetailsVisible((v) => !v)}
          className="flex-shrink-0 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-primary/50 text-primary hover:bg-primary/20 transition"
          title={detailsVisible ? 'Hide song info' : 'Reveal song info'}
        >
          {detailsVisible ? 'Hide' : 'Reveal'}
        </button>
      )}
    </div>
  );

  // ── YouTube ──────────────────────────────────────────────────────────────
  if (isYoutube) {
    return (
      <div className="bg-card rounded-xl p-4 flex flex-col gap-3">
        {header(<span className="text-xs text-yellow-400 font-medium">▶ YouTube</span>)}
        {videoId && !stopped ? (
          <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingTop: '56.25%' }}>
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1`}
              title={song?.title || 'Music video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="h-24 bg-darker rounded-lg flex items-center justify-center text-gray-500 text-sm">
            {stopped ? 'Playback stopped' : 'No video available'}
          </div>
        )}
      </div>
    );
  }

  // ── Spotify Embed widget ─────────────────────────────────────────────────
  if (isSpotify) {
    return (
      <div className="bg-card rounded-xl p-4 flex flex-col gap-3">
        {header(<span className="text-xs text-green-500 font-medium">♪ Spotify</span>)}
        {resolving && (
          <p className="text-xs text-gray-500 text-center">Loading Spotify player…</p>
        )}
        {!resolving && spotifyId && !stopped && (
          <iframe
            key={spotifyId}
            title={song?.title || 'Spotify player'}
            src={`https://open.spotify.com/embed/track/${spotifyId}?utm_source=generator&theme=0`}
            width="100%"
            height="152"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl w-full"
            style={{ border: 0, minHeight: 152 }}
          />
        )}
        {!resolving && !spotifyId && (
          <div className="h-24 bg-darker rounded-lg flex items-center justify-center text-gray-500 text-sm px-4 text-center">
            {resolveError || 'No Spotify track available'}
          </div>
        )}
        {stopped && (
          <div className="h-24 bg-darker rounded-lg flex items-center justify-center text-gray-500 text-sm">
            Playback stopped
          </div>
        )}
      </div>
    );
  }

  // ── Deezer / Howler MP3 preview ──────────────────────────────────────────
  return (
    <div className="bg-card rounded-xl p-4 flex flex-col gap-3">
      {header(<span className="text-xs text-green-400 font-medium">♪ Deezer preview</span>)}

      <div className="h-1.5 bg-darker rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-center gap-3 items-center">
        <Button
          onClick={playing ? pause : play}
          disabled={!canPlay}
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
        >
          {playing ? '⏸' : '▶'}
        </Button>
        {resolving && (
          <p className="text-xs text-gray-500">Loading preview…</p>
        )}
        {!resolving && !audioUrl && song && (
          <p className="text-xs text-gray-500">No preview available</p>
        )}
        {!resolving && audioUrl && !ready && !loadFailed && (
          <p className="text-xs text-gray-500">Buffering…</p>
        )}
        {!resolving && loadFailed && (
          <p className="text-xs text-red-400">
            {resolveError || error || 'Preview failed to load'}
          </p>
        )}
      </div>
    </div>
  );
}
