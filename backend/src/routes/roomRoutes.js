const express = require('express');
const router = express.Router();
const { createRoom, getRooms, getRoomByCode, deleteRoom } = require('../controllers/roomController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getRooms);
router.post('/', protect, createRoom);
router.get('/:code', protect, getRoomByCode);
router.delete('/:code', protect, deleteRoom);

module.exports = router;

