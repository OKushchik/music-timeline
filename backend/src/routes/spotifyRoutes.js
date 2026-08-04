const express = require('express');
const router = express.Router();
const { spotifySearch, spotifyArtist, spotifyArtistTopTracks, spotifyArtistAlbums, spotifyPlaylist } = require('../controllers/spotifyController');
const { protect } = require('../middleware/authMiddleware');

router.get("/search", protect, spotifySearch);
router.get("/artist/:id", protect, spotifyArtist);
router.get("/artist/:id/top-tracks", protect, spotifyArtistTopTracks);
router.get("/artist/:id/albums", protect, spotifyArtistAlbums);
router.get("/playlist/:playlist", protect, spotifyPlaylist);

module.exports = router;
