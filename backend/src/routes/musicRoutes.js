const express = require('express');
const router = express.Router();
const {
  getProvider,
  searchMusic,
  getTrack,
  getArtist,
  getArtistTopTracks,
  getPlaylist,
} = require('../controllers/musicController');
const { protect } = require('../middleware/authMiddleware');

// Public — lets the frontend know which provider is active (no auth needed)
router.get('/provider', getProvider);

// Protected routes
router.get('/search',              protect, searchMusic);
router.get('/track/:id',           protect, getTrack);
router.get('/artist/:id',          protect, getArtist);
router.get('/artist/:id/top-tracks', protect, getArtistTopTracks);
router.get('/playlist/:id',        protect, getPlaylist);

module.exports = router;
