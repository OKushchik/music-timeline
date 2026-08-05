const Room = require('../models/Room');
const { EVENTS } = require('../utils/socketEvents');
const { sendSongForRound } = require('./gameHandler');
const { sendChatHistory, clearChat } = require('./chatHandler');

const MIN_PLAYERS_TO_START = 2;

/**
 * Socket events handled here:
 *  join-room    — player joins a room by code
 *  leave-room   — player leaves
 *  player-ready — player toggles ready state
 *  start-game   — host starts the game
 */
module.exports = (io, socket) => {
  // ── join-room ─────────────────────────────────────────────
  socket.on(EVENTS.JOIN_ROOM, async ({ roomCode }) => {
    try {
      const code = roomCode.toUpperCase();
      const room = await Room.findOne({ code });
      if (!room)
        return socket.emit(EVENTS.ERROR, { message: 'Room not found' });

      const isAlreadyIn = room.players.some(
        (p) => p.userId.toString() === socket.user._id.toString()
      );

      // Allow existing players to rejoin (e.g. socket reconnect mid-game).
      // New players can only join while the room is still in the waiting state.
      if (!isAlreadyIn) {
        if (room.status !== 'waiting')
          return socket.emit(EVENTS.ERROR, { message: 'Game already in progress' });
        if (room.players.length >= room.maxPlayers)
          return socket.emit(EVENTS.ERROR, { message: 'Room is full' });

        room.players.push({
          userId:   socket.user._id,
          username: socket.user.username,
          isReady:  false,
          score:    0,
          timeline: [],
        });
        await room.save();
      }

      socket.join(code);
      io.to(code).emit(EVENTS.ROOM_UPDATED, room);
      socket.emit(EVENTS.JOIN_SUCCESS, { room });
      sendChatHistory(socket, code);
    } catch (err) {
      socket.emit(EVENTS.ERROR, { message: err.message });
    }
  });

  // ── leave-room ─────────────────────────────────────────────
  socket.on(EVENTS.LEAVE_ROOM, async ({ roomCode }) => {
    try {
      const code = roomCode.toUpperCase();
      const room = await Room.findOne({ code });
      if (!room) return;

      room.players = room.players.filter(
        (p) => p.userId.toString() !== socket.user._id.toString()
      );

      const isHostLeaving = room.host.toString() === socket.user._id.toString();
      if (isHostLeaving && room.players.length > 0) {
        room.host = room.players[0].userId;
      }

      // Only delete the room when it's still in the waiting lobby and everyone left.
      // A playing/finished room must stay alive so reconnecting players can rejoin.
      if (room.players.length === 0 && room.status === 'waiting') {
        clearChat(code);
        await room.deleteOne();
      } else {
        await room.save();
        io.to(code).emit(EVENTS.ROOM_UPDATED, room);
      }

      socket.leave(code);
    } catch (err) {
      socket.emit(EVENTS.ERROR, { message: err.message });
    }
  });

  // ── player-ready ────────────────────────────────────────────
  socket.on(EVENTS.PLAYER_READY, async ({ roomCode, isReady }) => {
    try {
      const code = roomCode.toUpperCase();
      const room = await Room.findOne({ code });
      if (!room) return;

      const player = room.players.find(
        (p) => p.userId.toString() === socket.user._id.toString()
      );
      if (player) {
        player.isReady = isReady;
        await room.save();
        io.to(code).emit(EVENTS.ROOM_UPDATED, room);
      }
    } catch (err) {
      socket.emit(EVENTS.ERROR, { message: err.message });
    }
  });

  // ── start-game ──────────────────────────────────────────────
  socket.on(EVENTS.START_GAME, async ({ roomCode }) => {
    try {
      const code = roomCode.toUpperCase();
      const room = await Room.findOne({ code });
      if (!room)
        return socket.emit(EVENTS.ERROR, { message: 'Room not found' });
      if (room.host.toString() !== socket.user._id.toString())
        return socket.emit(EVENTS.ERROR, { message: 'Only the host can start the game' });

      // Check host is ready
      const hostPlayer = room.players.find(
        (p) => p.userId.toString() === socket.user._id.toString()
      );
      if (!hostPlayer?.isReady)
        return socket.emit(EVENTS.ERROR, { message: 'You must mark yourself as ready before starting' });

      if (room.players.length < MIN_PLAYERS_TO_START)
        return socket.emit(EVENTS.ERROR, { message: 'Need at least 2 players to start' });

      // Keep only ready players
      const readyPlayers = room.players.filter((p) => p.isReady);
      if (readyPlayers.length < 1)
        return socket.emit(EVENTS.ERROR, { message: 'Need at least 1 ready player' });

      readyPlayers.forEach((p) => {
        p.hasPlacedThisRound = false;
        p.readyForNext = false;
        p.timeline = [];
        p.score = 0;
      });
      room.players = readyPlayers;
      room.status = 'playing';
      room.currentRound = 1;
      room.usedSongIds = [];
      room.currentSongId = null;
      await room.save();

      io.to(code).emit(EVENTS.GAME_STARTED, { room });
      // Server owns song distribution — one NEW_SONG for the whole room
      await sendSongForRound(io, room);
    } catch (err) {
      socket.emit(EVENTS.ERROR, { message: err.message });
    }
  });
};
