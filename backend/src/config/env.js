module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  CLIENT_URL: process.env.CLIENT_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_EXPIRES_IN: '7d',
  // Spotify (requires subscription for full playback; preview_url may be null)
  SPOTIFY_URL: process.env.SPOTIFY_URL,
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  // Active music provider: 'spotify' | 'deezer' | 'youtube'  (default: 'deezer')
  MUSIC_PROVIDER: process.env.MUSIC_PROVIDER || 'deezer',
};

