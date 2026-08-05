const crypto = require('crypto');
const Room = require('../models/Room');
const { EVENTS } = require('../utils/socketEvents');

const MAX_MESSAGES = 50;
const MAX_TEXT_LENGTH = 200;

/** @type {Map<string, Array<{id: string, userId: string, username: string, text: string, createdAt: string}>>} */
const chatBuffers = new Map();

const getHistory = (roomCode) => {
  const code = roomCode.toUpperCase();
  return chatBuffers.get(code) || [];
};

const clearChat = (roomCode) => {
  chatBuffers.delete(roomCode.toUpperCase());
};

const appendMessage = (roomCode, message) => {
  const code = roomCode.toUpperCase();
  const list = chatBuffers.get(code) || [];
  list.push(message);
  if (list.length > MAX_MESSAGES) list.splice(0, list.length - MAX_MESSAGES);
  chatBuffers.set(code, list);
  return message;
};

const sendChatHistory = (socket, roomCode) => {
  socket.emit(EVENTS.CHAT_HISTORY, { messages: getHistory(roomCode) });
};

/**
 * Socket events:
 *  send-chat — player sends a chat message to the room
 */
const assertRoomMember = async (socket, roomCode) => {
  if (!roomCode) {
    socket.emit(EVENTS.ERROR, { message: 'Room code required' });
    return null;
  }

  const code = roomCode.toUpperCase();
  const room = await Room.findOne({ code });
  if (!room) {
    socket.emit(EVENTS.ERROR, { message: 'Room not found' });
    return null;
  }

  const isMember = room.players.some(
    (p) => p.userId.toString() === socket.user._id.toString()
  );
  if (!isMember) {
    socket.emit(EVENTS.ERROR, { message: 'You are not in this room' });
    return null;
  }

  return code;
};

const chatHandler = (io, socket) => {
  socket.on(EVENTS.REQUEST_CHAT_HISTORY, async ({ roomCode }) => {
    try {
      const code = await assertRoomMember(socket, roomCode);
      if (!code) return;
      sendChatHistory(socket, code);
    } catch (err) {
      socket.emit(EVENTS.ERROR, { message: err.message });
    }
  });

  socket.on(EVENTS.SEND_CHAT, async ({ roomCode, text }) => {
    try {
      const trimmed = typeof text === 'string' ? text.trim() : '';
      if (!trimmed) {
        return socket.emit(EVENTS.ERROR, { message: 'Message cannot be empty' });
      }

      const code = await assertRoomMember(socket, roomCode);
      if (!code) return;

      const message = appendMessage(code, {
        id: crypto.randomUUID(),
        userId: socket.user._id.toString(),
        username: socket.user.username,
        text: trimmed.slice(0, MAX_TEXT_LENGTH),
        createdAt: new Date().toISOString(),
      });

      io.to(code).emit(EVENTS.CHAT_MESSAGE, message);
    } catch (err) {
      socket.emit(EVENTS.ERROR, { message: err.message });
    }
  });
};

module.exports = chatHandler;
module.exports.sendChatHistory = sendChatHistory;
module.exports.clearChat = clearChat;
module.exports.getHistory = getHistory;
