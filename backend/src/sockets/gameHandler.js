const Room = require('../models/Room');
const { validatePlacement, calculateScore, isGameOver, getWinners } = require('../services/gameService');
const { getUnusedSongs, getSongById, withFreshPreview } = require('../services/songService');
const { EVENTS } = require('../utils/socketEvents');
const { clearChat } = require('./chatHandler');

/**
 * Pick one unused song, mark it as current for the room, reset per-round flags,
 * and broadcast NEW_SONG once to the whole room.
 */
const sendSongForRound = async (io, room) => {
  const [song] = await getUnusedSongs(room.usedSongIds, 1);
  if (!song) {
    io.to(room.code).emit(EVENTS.NO_SONGS_LEFT);
    return null;
  }

  room.usedSongIds.push(song._id);
  room.currentSongId = song._id;
  room.players.forEach((p) => {
    p.hasPlacedThisRound = false;
    p.readyForNext = false;
  });
  await room.save();

  const songForClient = await withFreshPreview(song);
  io.to(room.code).emit(EVENTS.NEW_SONG, { song: songForClient, round: room.currentRound });
  return songForClient;
};

/**
 * Socket events handled here:
 *  request-song  — reconnect/resync only (re-sends current song, does not pick a new one)
 *  place-card    — player submits a timeline placement
 *  next-round    — player ready for next; advances when ALL players are ready
 */
const registerGameHandlers = (io, socket) => {
  // ── request-song (resync only) ──────────────────────────────
  socket.on(EVENTS.REQUEST_SONG, async ({ roomCode }) => {
    try {
      if (!roomCode) return;
      const code = roomCode.toUpperCase();
      const room = await Room.findOne({ code });
      if (!room || room.status !== 'playing') return;

      const isMember = room.players.some(
        (p) => p.userId.toString() === socket.user._id.toString()
      );
      if (!isMember) return;

      // Never pick a new song here — only re-broadcast the current one (reconnect).
      if (!room.currentSongId) return;
      const song = await getSongById(room.currentSongId);
      if (!song) return;

      const songForClient = await withFreshPreview(song);
      socket.emit(EVENTS.NEW_SONG, { song: songForClient, round: room.currentRound });
    } catch (err) {
      socket.emit(EVENTS.ERROR, { message: err.message });
    }
  });

  // ── place-card ──────────────────────────────────────────────
  socket.on(EVENTS.PLACE_CARD, async ({ roomCode, song, position }) => {
    try {
      if (!roomCode) return;
      const code = roomCode.toUpperCase();
      const room = await Room.findOne({ code });
      if (!room || room.status !== 'playing') return;

      const player = room.players.find(
        (p) => p.userId.toString() === socket.user._id.toString()
      );
      if (!player) return;

      if (player.hasPlacedThisRound) {
        return socket.emit(EVENTS.ERROR, { message: 'You already placed a card this round' });
      }

      // Only accept the server's current round song (prevents year cheating)
      if (!room.currentSongId || !song?._id || String(song._id) !== String(room.currentSongId)) {
        return socket.emit(EVENTS.ERROR, { message: 'Invalid song for this round' });
      }

      const canonicalSong = await getSongById(room.currentSongId);
      if (!canonicalSong) return;

      const songPayload = canonicalSong.toObject ? canonicalSong.toObject() : canonicalSong;
      const { correct, correctPosition } = validatePlacement(
        player.timeline,
        songPayload,
        position
      );
      const points = calculateScore(correct);
      player.score += points;
      player.hasPlacedThisRound = true;

      // Only correct placements stay on the timeline
      if (correct) {
        player.timeline.splice(position, 0, songPayload);
      }
      await room.save();

      socket.emit(EVENTS.CARD_RESULT, {
        correct,
        correctPosition,
        score: player.score,
        song: songPayload,
      });
      io.to(code).emit(EVENTS.SCORE_UPDATE, {
        players: room.players.map(({ userId, username, score }) => ({ userId, username, score })),
      });
    } catch (err) {
      socket.emit(EVENTS.ERROR, { message: err.message });
    }
  });

  // ── next-round ──────────────────────────────────────────────
  socket.on(EVENTS.NEXT_ROUND, async ({ roomCode }) => {
    try {
      if (!roomCode) return;
      const code = roomCode.toUpperCase();
      const room = await Room.findOne({ code });
      if (!room || room.status !== 'playing') return;

      const player = room.players.find(
        (p) => p.userId.toString() === socket.user._id.toString()
      );
      if (!player) return;

      if (!player.hasPlacedThisRound) {
        return socket.emit(EVENTS.ERROR, { message: 'Place your card before continuing' });
      }

      player.readyForNext = true;
      await room.save();

      const allReady = room.players.every((p) => p.readyForNext);

      if (!allReady) {
        io.to(code).emit(EVENTS.ROOM_UPDATED, room);
        return;
      }

      if (isGameOver(room)) {
        room.status = 'finished';
        room.currentSongId = null;
        await room.save();
        io.to(code).emit(EVENTS.GAME_OVER, {
          players: room.players,
          winners: getWinners(room.players),
        });
        clearChat(code);
        return;
      }

      room.currentRound += 1;
      await room.save();
      io.to(code).emit(EVENTS.ROUND_STARTED, { round: room.currentRound });
      await sendSongForRound(io, room);
    } catch (err) {
      socket.emit(EVENTS.ERROR, { message: err.message });
    }
  });
};

module.exports = registerGameHandlers;
module.exports.sendSongForRound = sendSongForRound;
