const axios = require("axios");
const qs = require("qs");
require("dotenv/config");
const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = require("../config/env");

let basicToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
  if (basicToken && Date.now() < tokenExpiresAt) {
    return basicToken;
  }

  const client_id = SPOTIFY_CLIENT_ID;
  const client_secret = SPOTIFY_CLIENT_SECRET;

  if (!client_id || !client_secret) {
    throw new Error("Spotify credentials are not configured");
  }

  const token = Buffer.from(`${client_id}:${client_secret}`).toString("base64");

  const res = await axios.post(
    "https://accounts.spotify.com/api/token",
    qs.stringify({ grant_type: "client_credentials" }),
    {
      headers: {
        Authorization: `Basic ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  basicToken = res.data.access_token;
  tokenExpiresAt = Date.now() + res.data.expires_in * 1000 - 60_000;
  return basicToken;
}

getAccessToken().then(
  (token) => console.log("Spotify access token obtained", token),
  (err) => console.error("Failed to obtain Spotify access token", err)
);

async function spotifyFetch(endpoint) {
  const token = await getAccessToken();

  const res = await axios.get(`https://api.spotify.com/v1/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}

const SpotifyService = {
  search: (query) =>
    spotifyFetch(`search?q=${encodeURIComponent(query)}&type=artist,track,album`),

  getTrack: (id) => spotifyFetch(`tracks/${id}`),

  getArtist: (id) => spotifyFetch(`artists/${id}`),
  getTopTracks: (id) => spotifyFetch(`artists/${id}/top-tracks?market=US`),
  getAlbums: (id) =>
    spotifyFetch(`artists/${id}/albums?include_groups=album,single&market=US`),
  getSpotifyPlaylist: (playlist) => spotifyFetch(`playlists/${playlist}`),

  /**
   * Search by title + artist and return the best-match preview URL.
   * Note: Spotify preview_url is frequently null for many tracks.
   */
  findPreviewUrl: async (title, artist) => {
    const query = `track:${title} artist:${artist}`;
    const data = await spotifyFetch(
      `search?q=${encodeURIComponent(query)}&type=track&limit=1`
    );
    const track = data?.tracks?.items?.[0];
    if (!track) return null;
    return {
      previewUrl: track.preview_url || null,
      coverUrl:
        track.album?.images?.[1]?.url || track.album?.images?.[0]?.url || '',
      spotifyId: track.id,
    };
  },
};

module.exports = SpotifyService;
