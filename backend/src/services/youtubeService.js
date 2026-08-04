const axios = require('axios');
const { YOUTUBE_API_KEY } = require('../config/env');

const BASE = 'https://www.googleapis.com/youtube/v3';

/**
 * YouTube Data API v3 — free tier (10,000 units/day).
 * We only use search to find a video ID; playback is via the YouTube iframe embed
 * (no subscription required).
 *
 * Requires YOUTUBE_API_KEY in .env
 */

const YoutubeService = {
  /**
   * Search YouTube for a video matching the query.
   * Returns the first result's videoId, title, and thumbnail.
   */
  search: async (query, maxResults = 5) => {
    if (!YOUTUBE_API_KEY) {
      throw new Error('YOUTUBE_API_KEY is not configured');
    }
    const res = await axios.get(`${BASE}/search`, {
      params: {
        part: 'snippet',
        q: query,
        type: 'video',
        videoCategoryId: '10', // Music category
        maxResults,
        key: YOUTUBE_API_KEY,
      },
      timeout: 8000,
    });
    return res.data;
  },

  /**
   * Find the best YouTube video ID for a song title + artist.
   * Returns { videoId, title, thumbnail } or null.
   */
  findVideoId: async (title, artist) => {
    const query = `${title} ${artist} official audio`;
    const data = await YoutubeService.search(query, 1);
    const item = data?.items?.[0];
    if (!item) return null;
    return {
      videoId: item.id?.videoId || null,
      title: item.snippet?.title || '',
      thumbnail: item.snippet?.thumbnails?.medium?.url || '',
    };
  },
};

module.exports = YoutubeService;
