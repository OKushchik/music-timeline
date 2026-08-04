const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Song title is required'],
      trim: true,
    },
    artist: {
      type: String,
      required: [true, 'Artist is required'],
      trim: true,
    },
    year: {
      type: Number,
      required: [true, 'Release year is required'],
      min: 1900,
      max: new Date().getFullYear(),
    },
    audioUrl: {
      type: String,
      default: '',   // empty string = no preview available (not required to allow YouTube-only songs)
    },
    coverUrl: {
      type: String,
      default: '',
    },
    genre: {
      type: String,
      default: 'Unknown',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    // Provider-specific IDs for re-fetching or deep-linking
    deezerId:  { type: String, default: '' },
    spotifyId: { type: String, default: '' },
    videoId:   { type: String, default: '' },  // YouTube video ID
  },
  { timestamps: true }
);

module.exports = mongoose.model('Song', songSchema);

