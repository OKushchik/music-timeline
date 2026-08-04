const Room = require('../models/Room');
const { generateRoomCode } = require('../utils/generateRoomCode');

const ROOM_DEFAULTS = {
  TOTAL_ROUNDS: 10,
  MAX_PLAYERS:  4,
};

/**
 * Create a new room owned by the given user.
 */
const createRoom = async ({ name, totalRounds, maxPlayers, isPrivate, user }) => {
  const code = generateRoomCode();

  const room = await Room.create({
    code,
    name:        name || `${user.username}'s Room`,
    host:        user.id,
    totalRounds: totalRounds || ROOM_DEFAULTS.TOTAL_ROUNDS,
    maxPlayers:  maxPlayers  || ROOM_DEFAULTS.MAX_PLAYERS,
    isPrivate:   isPrivate === undefined ? true : Boolean(isPrivate),
    players: [
      {
        userId:   user.id,
        username: user.username,
        isReady:  false,
        score:    0,
        timeline: [],
      },
    ],
  });

  await room.populate('host', 'username');
  return room;
};

/**
 * Return open Global rooms (waiting + not private).
 * Legacy docs without isPrivate still appear via $exists: false.
 */
const getOpenRooms = async (limit = 20) =>
  Room.find({
    status: 'waiting',
    $or: [{ isPrivate: false }, { isPrivate: { $exists: false } }],
  })
    .populate('host', 'username')
    .sort({ createdAt: -1 })
    .limit(limit);

/**
 * Find a single room by its code (case-insensitive).
 */
const findRoomByCode = async (code) =>
  Room.findOne({ code: code.toUpperCase() }).populate('host', 'username');

/**
 * Delete a room. Throws if not found or requester is not the host.
 */
const deleteRoom = async (code, userId) => {
  const room = await Room.findOne({ code: code.toUpperCase() });
  if (!room) {
    const err = new Error('Room not found');
    err.statusCode = 404;
    throw err;
  }
  if (room.host.toString() !== userId.toString()) {
    const err = new Error('Only the host can delete this room');
    err.statusCode = 403;
    throw err;
  }
  await room.deleteOne();
};

module.exports = { createRoom, getOpenRooms, findRoomByCode, deleteRoom, ROOM_DEFAULTS };

