const MusicProviderService = require('../services/musicProviderService');

class AppError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

/**
 * GET /api/music/provider
 * Returns the currently active music provider.
 */
const getProvider = (req, res) => {
  res.json({ provider: MusicProviderService.getProvider() });
};

/**
 * GET /api/music/search?q=...
 * Search tracks using the active provider.
 */
const searchMusic = async (req, res) => {
  const { q } = req.query;
  if (!q) throw new AppError('Missing query parameter: q', 400);

  const results = await MusicProviderService.search(q);
  if (!results) throw new AppError('No results found', 404);

  res.json(results);
};

/**
 * GET /api/music/track/:id
 * Get a single track by provider-specific ID.
 */
const getTrack = async (req, res) => {
  const track = await MusicProviderService.getTrack(req.params.id);
  if (!track) throw new AppError('Track not found', 404);
  res.json(track);
};

/**
 * GET /api/music/artist/:id
 */
const getArtist = async (req, res) => {
  const artist = await MusicProviderService.getArtist(req.params.id);
  if (!artist) throw new AppError('Artist not found', 404);
  res.json(artist);
};

/**
 * GET /api/music/artist/:id/top-tracks
 */
const getArtistTopTracks = async (req, res) => {
  const tracks = await MusicProviderService.getArtistTopTracks(req.params.id);
  if (!tracks) throw new AppError('Top tracks not found', 404);
  res.json(tracks);
};

/**
 * GET /api/music/playlist/:id
 */
const getPlaylist = async (req, res) => {
  const playlist = await MusicProviderService.getPlaylist(req.params.id);
  if (!playlist) throw new AppError('Playlist not found', 404);
  res.json(playlist);
};

module.exports = {
  getProvider,
  searchMusic,
  getTrack,
  getArtist,
  getArtistTopTracks,
  getPlaylist,
};
