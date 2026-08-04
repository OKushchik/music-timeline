import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL;

const cfg = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

export const spotifyApi = {
  search: (token, query, type = 'track,artist,album') =>
    axios.get(`${BASE}/spotify/search`, { ...cfg(token), params: { q: query, type } }).then(r => r.data),

  getArtist: (token, id) =>
    axios.get(`${BASE}/spotify/artist/${id}`, cfg(token)).then(r => r.data),

  getArtistTopTracks: (token, id) =>
    axios.get(`${BASE}/spotify/artist/${id}/top-tracks`, cfg(token)).then(r => r.data),

  getArtistAlbums: (token, id) =>
    axios.get(`${BASE}/spotify/artist/${id}/albums`, cfg(token)).then(r => r.data),

  getPlaylist: (token, playlistId) =>
    axios.get(`${BASE}/spotify/playlist/${playlistId}`, cfg(token)).then(r => r.data),
};

