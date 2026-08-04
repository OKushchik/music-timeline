/**
 * Unified music API — talks to /api/music/* on the backend.
 * The backend delegates to the active provider (deezer | spotify | youtube).
 */
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL;

const cfg = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const musicApi = {
  /** Returns { provider: 'deezer' | 'spotify' | 'youtube' } — no auth needed */
  getProvider: () =>
    axios.get(`${BASE}/music/provider`).then((r) => r.data),

  /** Search tracks. Returns { tracks: NormalizedTrack[], raw: any } */
  search: (token, query) =>
    axios.get(`${BASE}/music/search`, { ...cfg(token), params: { q: query } }).then((r) => r.data),

  /** Get a single track by provider ID. Returns NormalizedTrack */
  getTrack: (token, id) =>
    axios.get(`${BASE}/music/track/${id}`, cfg(token)).then((r) => r.data),

  /** Get artist info */
  getArtist: (token, id) =>
    axios.get(`${BASE}/music/artist/${id}`, cfg(token)).then((r) => r.data),

  /** Get artist top tracks */
  getArtistTopTracks: (token, id) =>
    axios.get(`${BASE}/music/artist/${id}/top-tracks`, cfg(token)).then((r) => r.data),

  /** Get a playlist */
  getPlaylist: (token, id) =>
    axios.get(`${BASE}/music/playlist/${id}`, cfg(token)).then((r) => r.data),
};
