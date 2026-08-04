const express = require('express');
const router = express.Router();
const {
  getRandomSong,
  getSongs,
  getSongById,
  getSongPreview,
  createSong,
} = require('../controllers/songController');
const { protect } = require('../middleware/authMiddleware');

// Public — used by local (offline) game mode without auth
router.get('/random', getRandomSong);
router.get('/:id/preview', getSongPreview);
router.get('/', protect, getSongs);
router.get('/:id', protect, getSongById);
router.post('/', protect, createSong); // protect with admin check in production

module.exports = router;

