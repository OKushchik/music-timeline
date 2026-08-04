const axios = require('axios');

const BASE = 'https://api.deezer.com';

/**
 * Deezer public API — no API key required for basic search & track data.
 * Returns 30-second preview MP3 URLs for free, no subscription needed.
 */

async function deezerGet(endpoint, params = {}) {
  const res = await axios.get(`${BASE}/${endpoint}`, {
    params,
    timeout: 8000,
  });
  return res.data;
}

const DeezerService = {
  /**
   * Search tracks/artists/albums.
   * @param {string} query
   * @param {'track'|'artist'|'album'|'playlist'} type
   * @param {number} limit
   */
  search: (query, type = 'track', limit = 20) =>
    deezerGet('search', { q: query, type, limit }),

  /**
   * Get a single track by Deezer track ID.
   * Returns { id, title, artist, album, preview (30s MP3 URL), duration, ... }
   */
  getTrack: (id) => deezerGet(`track/${id}`),

  /**
   * Get artist info by Deezer artist ID.
   */
  getArtist: (id) => deezerGet(`artist/${id}`),

  /**
   * Get top tracks for an artist.
   */
  getArtistTopTracks: (id, limit = 10) =>
    deezerGet(`artist/${id}/top`, { limit }),

  /**
   * Get albums for an artist.
   */
  getArtistAlbums: (id) => deezerGet(`artist/${id}/albums`),

  /**
   * Get a playlist by Deezer playlist ID.
   */
  getPlaylist: (id) => deezerGet(`playlist/${id}`),

  /**
   * Search for a song by title + artist and return the best-match preview URL.
   * Used when enriching seed data.
   */
  findPreviewUrl: async (title, artist) => {
    const query = `${title} ${artist}`;
    const data = await deezerGet('search', { q: query, limit: 1 });
    const track = data?.data?.[0];
    if (!track) return null;
    return {
      previewUrl: track.preview || null,
      coverUrl: track.album?.cover_medium || track.album?.cover || '',
      deezerId: track.id,
    };
  },
};

module.exports = DeezerService;
