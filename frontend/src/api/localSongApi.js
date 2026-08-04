/**
 * Song API for local (offline) game — no auth token needed.
 * Requires the backend song routes to be public (no `protect` middleware).
 */
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL;

export const localSongApi = {
  getRandom: (excludeIds = []) =>
    axios.get(`${BASE}/songs/random?exclude=${excludeIds.join(',')}`).then((r) => r.data),

  /** Fresh signed Deezer preview — public, no auth */
  getPreview: (id) =>
    axios.get(`${BASE}/songs/${id}/preview`).then((r) => r.data),
};

