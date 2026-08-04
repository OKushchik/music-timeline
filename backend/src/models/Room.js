const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    name: {
      type: String,
      default: 'Game Room',
      maxlength: 40,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    players: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: String,
        isReady: { type: Boolean, default: false },
        score: { type: Number, default: 0 },
        timeline: { type: Array, default: [] }, // placed song cards in order
        hasPlacedThisRound: { type: Boolean, default: false },
        readyForNext: { type: Boolean, default: false },
      },
    ],
    status: {
      type: String,
      enum: ['waiting', 'playing', 'finished'],
      default: 'waiting',
    },
    /** true = Private (code only); false = Global (shown in Open Rooms) */
    isPrivate: {
      type: Boolean,
      default: true,
    },
    maxPlayers: {
      type: Number,
      default: 4,
    },
    currentRound: {
      type: Number,
      default: 0,
    },
    totalRounds: {
      type: Number,
      default: 10,
    },
    usedSongIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
    /** Song currently in play for this round (server-owned to avoid client races) */
    currentSongId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Song',
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);

