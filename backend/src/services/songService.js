const Song = require('../models/Song');
const mongoose = require('mongoose');
const DeezerService = require('./deezerService');
const SpotifyService = require('./spotifyService');
const { MUSIC_PROVIDER } = require('../config/env');

const DEFAULT_PAGE_LIMIT = 20;

function getActiveProvider() {
  return (MUSIC_PROVIDER || 'deezer').toLowerCase();
}

async function refreshFromDeezer(plain) {
  plain.audioUrl = '';

  if (plain.deezerId) {
    const track = await DeezerService.getTrack(plain.deezerId);
    if (track?.preview) {
      plain.audioUrl = track.preview;
      if (track.album?.cover_medium || track.album?.cover) {
        plain.coverUrl = track.album.cover_medium || track.album.cover;
      }
      return plain;
    }
  }

  if (plain.title && plain.artist) {
    const result = await DeezerService.findPreviewUrl(plain.title, plain.artist);
    if (result?.previewUrl) {
      plain.audioUrl = result.previewUrl;
      plain.coverUrl = result.coverUrl || plain.coverUrl || '';
      if (result.deezerId) plain.deezerId = String(result.deezerId);
    }
  }
  return plain;
}

async function refreshFromSpotify(plain) {
  // Widget playback needs spotifyId; preview_url is often null — don't rely on it
  plain.audioUrl = '';

  if (plain.spotifyId) {
    try {
      const track = await SpotifyService.getTrack(plain.spotifyId);
      if (track) {
        plain.audioUrl = track.preview_url || '';
        const cover =
          track.album?.images?.[1]?.url || track.album?.images?.[0]?.url || '';
        if (cover) plain.coverUrl = cover;
        return plain;
      }
    } catch {
      // Fall through to search if stored id is stale
    }
  }

  if (plain.title && plain.artist) {
    const result = await SpotifyService.findPreviewUrl(plain.title, plain.artist);
    if (result) {
      plain.audioUrl = result.previewUrl || '';
      plain.coverUrl = result.coverUrl || plain.coverUrl || '';
      if (result.spotifyId) plain.spotifyId = String(result.spotifyId);
    }
  }
  return plain;
}

/**
 * Resolve provider metadata before sending a song to the client.
 * - deezer: fresh signed 30s MP3 preview
 * - spotify: ensure spotifyId for Embed widget (preview_url optional)
 * - youtube: videoId-based; leave as-is
 */
const withFreshPreview = async (song) => {
  if (!song) return song;

  const plain = typeof song.toObject === 'function' ? song.toObject() : { ...song };
  const provider = getActiveProvider();

  if (provider === 'youtube') {
    return plain;
  }

  try {
    if (provider === 'spotify') {
      return await refreshFromSpotify(plain);
    }
    return await refreshFromDeezer(plain);
  } catch (err) {
    console.warn(`Fresh preview failed for "${plain.title}" (${provider}): ${err.message}`);
  }

  return plain;
};

/**
 * Return `count` unique songs not already in `usedIds`.
 */
const getUnusedSongs = async (usedIds = [], count = 1) => {
  const excludeObjectIds = usedIds
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id));

  return Song.aggregate([
    { $match: { _id: { $nin: excludeObjectIds } } },
    { $sample: { size: count } },
  ]);
};

/**
 * Return a single random song excluding the given IDs.
 */
const getRandomSong = async (excludeIds = []) => {
  const [song] = await getUnusedSongs(excludeIds, 1);
  return song ?? null;
};

/**
 * Return paginated songs sorted by year ascending.
 */
const getPaginatedSongs = async (page = 1, limit = DEFAULT_PAGE_LIMIT) => {
  const skip  = (page - 1) * limit;
  const [songs, total] = await Promise.all([
    Song.find().skip(skip).limit(limit).sort({ year: 1 }),
    Song.countDocuments(),
  ]);
  return { songs, total, page, pages: Math.ceil(total / limit) };
};

/**
 * Find a song by its MongoDB ID.
 */
const getSongById = async (id) => Song.findById(id);

/**
 * Create a new song document.
 */
const createSong = async (data) => Song.create(data);

module.exports = {
  getUnusedSongs,
  getRandomSong,
  getPaginatedSongs,
  getSongById,
  createSong,
  withFreshPreview,
};
