const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const User = require('../models/User');
const Room = require('../models/Room');
const roomHandler = require('./roomHandler');
const gameHandler = require('./gameHandler');
const { EVENTS } = require('../utils/socketEvents');

let io;
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  // Auth middleware for sockets
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];
      if (!token) return next(new Error('Authentication error'));
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.username} (${socket.id})`);
    roomHandler(io, socket);
    gameHandler(io, socket);

    socket.on('disconnect', async (reason) => {
      console.log(`❌ Socket disconnected: ${socket.user.username} — ${reason}`);
      try {
        const rooms = await Room.find({
          'players.userId': socket.user._id,
          status: { $in: ['waiting', 'playing'] },
        });

        for (const room of rooms) {
          // Playing rooms stay intact so players (including host) can reconnect.
          if (room.status === 'playing') {
            continue;
          }

          // Waiting lobby: remove the disconnected player
          room.players = room.players.filter(
            (p) => p.userId.toString() !== socket.user._id.toString()
          );

          const wasHost = room.host.toString() === socket.user._id.toString();

          if (room.players.length === 0) {
            await room.deleteOne();
            continue;
          }

          if (wasHost) {
            room.host = room.players[0].userId;
          }

          await room.save();
          io.to(room.code).emit(EVENTS.ROOM_UPDATED, room);
        }
      } catch (err) {
        console.error('Error cleaning up rooms on disconnect:', err.message);
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialised');
  return io;
};

module.exports = { initSocket, getIO };
