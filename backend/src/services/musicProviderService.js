const { MUSIC_PROVIDER } = require('../config/env');
const SpotifyService = require('./spotifyService');
const DeezerService = require('./deezerService');
const YoutubeService = require('./youtubeService');

/**
 * Unified music provider facade.
 *
 * Set MUSIC_PROVIDER in .env to one of: spotify | deezer | youtube
 * Defaults to 'deezer' (free, no subscription required).
 *
 * Each provider returns a normalised shape:
 * {
 *   id:         string   — provider-specific track/video ID
 *   title:      string
 *   artist:     string
 *   album:      string
 *   coverUrl:   string   — artwork image URL
 *   previewUrl: string   — 30s MP3 URL (spotify/deezer) or null (youtube)
 *   videoId:    string   — YouTube video ID or null
 *   provider:   string   — 'spotify' | 'deezer' | 'youtube'
 *   year:       number|null
 *   duration:   number|null  — seconds
 * }
 */

function getProvider() {
  return (MUSIC_PROVIDER || 'deezer').toLowerCase();
}

// ── Normalizers ──────────────────────────────────────────────────────────────

function normalizeSpotifyTrack(t) {
  return {
    id: t.id,
    title: t.name,
    artist: t.artists?.map((a) => a.name).join(', ') || '',
    album: t.album?.name || '',
    coverUrl: t.album?.images?.[1]?.url || t.album?.images?.[0]?.url || '',
    previewUrl: t.preview_url || null,
    videoId: null,
    provider: 'spotify',
    year: t.album?.release_date ? parseInt(t.album.release_date, 10) : null,
    duration: t.duration_ms ? Math.round(t.duration_ms / 1000) : null,
  };
}

function normalizeDeezerTrack(t) {
  return {
    id: String(t.id),
    title: t.title,
    artist: t.artist?.name || '',
    album: t.album?.title || '',
    coverUrl: t.album?.cover_medium || t.album?.cover || '',
    previewUrl: t.preview || null,
    videoId: null,
    provider: 'deezer',
    year: null, // Deezer search doesn't return year; use getTrack for full data
    duration: t.duration || null,
  };
}

function normalizeYoutubeItem(item) {
  return {
    id: item.id?.videoId || item.id,
    title: item.snippet?.title || '',
    artist: item.snippet?.channelTitle || '',
    album: '',
    coverUrl: item.snippet?.thumbnails?.medium?.url || '',
    previewUrl: null,
    videoId: item.id?.videoId || item.id,
    provider: 'youtube',
    year: null,
    duration: null,
  };
}

// ── Unified API ──────────────────────────────────────────────────────────────

const MusicProviderService = {
  getProvider,

  /**
   * Search for tracks.
   * Returns { tracks: NormalizedTrack[], raw: any }
   */
  search: async (query) => {
    const provider = getProvider();

    if (provider === 'spotify') {
      const raw = await SpotifyService.search(query);
      const tracks = (raw?.tracks?.items || []).map(normalizeSpotifyTrack);
      return { tracks, raw };
    }

    if (provider === 'deezer') {
      const raw = await DeezerService.search(query, 'track', 20);
      const tracks = (raw?.data || []).map(normalizeDeezerTrack);
      return { tracks, raw };
    }

    if (provider === 'youtube') {
      const raw = await YoutubeService.search(query, 10);
      const tracks = (raw?.items || []).map(normalizeYoutubeItem);
      return { tracks, raw };
    }

    throw new Error(`Unknown music provider: ${provider}`);
  },

  /**
   * Get a single track by provider-specific ID.
   * Returns a NormalizedTrack.
   */
  getTrack: async (id) => {
    const provider = getProvider();

    if (provider === 'spotify') {
      const raw = await SpotifyService.getTrack(id);
      return raw ? normalizeSpotifyTrack(raw) : null;
    }

    if (provider === 'deezer') {
      const raw = await DeezerService.getTrack(id);
      return normalizeDeezerTrack(raw);
    }

    if (provider === 'youtube') {
      // YouTube doesn't have a simple "get video" without extra quota; return minimal info
      return {
        id,
        title: '',
        artist: '',
        album: '',
        coverUrl: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
        previewUrl: null,
        videoId: id,
        provider: 'youtube',
        year: null,
        duration: null,
      };
    }

    throw new Error(`Unknown music provider: ${provider}`);
  },

  /**
   * Get artist info.
   */
  getArtist: async (id) => {
    const provider = getProvider();
    if (provider === 'spotify') return SpotifyService.getArtist(id);
    if (provider === 'deezer') return DeezerService.getArtist(id);
    throw new Error(`getArtist not supported for provider: ${provider}`);
  },

  /**
   * Get top tracks for an artist.
   */
  getArtistTopTracks: async (id) => {
    const provider = getProvider();
    if (provider === 'spotify') return SpotifyService.getTopTracks(id);
    if (provider === 'deezer') return DeezerService.getArtistTopTracks(id);
    throw new Error(`getArtistTopTracks not supported for provider: ${provider}`);
  },

  /**
   * Get a playlist.
   */
  getPlaylist: async (id) => {
    const provider = getProvider();
    if (provider === 'spotify') return SpotifyService.getSpotifyPlaylist(id);
    if (provider === 'deezer') return DeezerService.getPlaylist(id);
    throw new Error(`getPlaylist not supported for provider: ${provider}`);
  },
};

module.exports = MusicProviderService;
