const {
  getRandomSong,
  getPaginatedSongs,
  getSongById,
  createSong,
  withFreshPreview,
} = require('../services/songService');
const { MUSIC_PROVIDER } = require('../config/env');

// @desc  Get a random song (not in exclusion list)
// @route GET /api/songs/random?exclude=id1,id2
const getRandomSongHandler = async (req, res, next) => {
  try {
    const excludeIds = req.query.exclude ? req.query.exclude.split(',') : [];
    const song = await getRandomSong(excludeIds);
    if (!song) return res.status(404).json({ message: 'No songs available' });
    res.json(await withFreshPreview(song));
  } catch (err) {
    next(err);
  }
};

// @desc  Get all songs (paginated)
// @route GET /api/songs
const getSongsHandler = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page,  10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const result = await getPaginatedSongs(page, limit);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

// @desc  Get single song by ID
// @route GET /api/songs/:id
const getSongByIdHandler = async (req, res, next) => {
  try {
    const song = await getSongById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });
    res.json(await withFreshPreview(song));
  } catch (err) {
    next(err);
  }
};

// @desc  Fresh playback metadata for a stored song (provider-aware)
// @route GET /api/songs/:id/preview
const getSongPreviewHandler = async (req, res, next) => {
  try {
    const song = await getSongById(req.params.id);
    if (!song) return res.status(404).json({ message: 'Song not found' });
    const fresh = await withFreshPreview(song);
    const provider = (MUSIC_PROVIDER || 'deezer').toLowerCase();

    // Spotify Embed only needs spotifyId (preview MP3 is often unavailable)
    if (provider === 'spotify') {
      if (!fresh.spotifyId) {
        return res.status(404).json({ message: 'No Spotify track found' });
      }
      return res.json({
        audioUrl: fresh.audioUrl || '',
        coverUrl: fresh.coverUrl || '',
        deezerId: fresh.deezerId || '',
        spotifyId: fresh.spotifyId,
        provider,
      });
    }

    if (!fresh.audioUrl) {
      return res.status(404).json({ message: 'No preview available' });
    }
    res.json({
      audioUrl: fresh.audioUrl,
      coverUrl: fresh.coverUrl || '',
      deezerId: fresh.deezerId || '',
      spotifyId: fresh.spotifyId || '',
      provider,
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Create a song (admin/seeding)
// @route POST /api/songs
const createSongHandler = async (req, res, next) => {
  try {
    const song = await createSong(req.body);
    res.status(201).json(song);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRandomSong:  getRandomSongHandler,
  getSongs:       getSongsHandler,
  getSongById:    getSongByIdHandler,
  getSongPreview: getSongPreviewHandler,
  createSong:     createSongHandler,
};
