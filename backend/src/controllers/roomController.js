const { createRoom, getOpenRooms, findRoomByCode, deleteRoom } = require('../services/roomService');

// @desc  Create a new room
// @route POST /api/rooms
const createRoomHandler = async (req, res, next) => {
  try {
    const room = await createRoom({ ...req.body, user: req.user });
    res.status(201).json(room);
  } catch (err) {
    next(err);
  }
};

// @desc  Get all open rooms
// @route GET /api/rooms
const getRooms = async (req, res, next) => {
  try {
    const rooms = await getOpenRooms();
    res.json(rooms);
  } catch (err) {
    next(err);
  }
};

// @desc  Get a single room by code
// @route GET /api/rooms/:code
const getRoomByCode = async (req, res, next) => {
  try {
    const room = await findRoomByCode(req.params.code);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room);
  } catch (err) {
    next(err);
  }
};

// @desc  Delete a room (host only)
// @route DELETE /api/rooms/:code
const deleteRoomHandler = async (req, res, next) => {
  try {
    await deleteRoom(req.params.code, req.user.id);
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(err.statusCode || 500).json({ message: err.message });
  }
};

module.exports = { createRoom: createRoomHandler, getRooms, getRoomByCode, deleteRoom: deleteRoomHandler };
