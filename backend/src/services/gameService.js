const Song = require('../models/Song');

/**
 * Validate whether a player placed a song card in the correct position
 * in their personal timeline.
 *
 * @param {Array}  timeline  - Player's current timeline (array of song objects, sorted by year)
 * @param {Object} song      - The song being placed
 * @param {number} position  - The index the player chose (0 = leftmost)
 * @returns {{ correct: boolean, correctPosition: number }}
 */
const validatePlacement = (timeline, song, position) => {
  // Build a test array with the song inserted at the given position
  const test = [...timeline];
  test.splice(position, 0, song);

  // Check if the array remains sorted by year
  for (let i = 1; i < test.length; i++) {
    if (test[i].year < test[i - 1].year) {
      // Find the correct insertion index
      const sorted = [...timeline, song].sort((a, b) => a.year - b.year);
      const correctPosition = sorted.indexOf(song);
      return { correct: false, correctPosition };
    }
  }
  return { correct: true, correctPosition: position };
};

/**
 * Calculate score for a round.
 * Correct placement: +1 point.
 * No negative scoring — keep it fun.
 */
const calculateScore = (correct) => (correct ? 1 : 0);

/**
 * Pick the next song for the round (not already used).
 */
const pickNextSong = async (usedSongIds) => {
  const song = await Song.aggregate([
    { $match: { _id: { $nin: usedSongIds } } },
    { $sample: { size: 1 } },
  ]);
  return song[0] || null;
};

/**
 * Check if the game is over (all rounds played).
 */
const isGameOver = (room) => room.currentRound >= room.totalRounds;

/**
 * Determine winner(s) — player(s) with highest score.
 */
const getWinners = (players) => {
  const maxScore = Math.max(...players.map((p) => p.score));
  return players.filter((p) => p.score === maxScore);
};

module.exports = { validatePlacement, calculateScore, pickNextSong, isGameOver, getWinners };

