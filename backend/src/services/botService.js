/**
 * Bot difficulty settings:
 *   easy   — 50% accuracy, 3–5 s think time
 *   medium — 75% accuracy, 1.5–3 s think time
 *   hard   — 92% accuracy, 0.8–1.5 s think time
 */
const DIFFICULTY = {
  easy:   { accuracy: 0.50, minMs: 3000, maxMs: 5000 },
  medium: { accuracy: 0.75, minMs: 1500, maxMs: 3000 },
  hard:   { accuracy: 0.92, minMs:  800, maxMs: 1500 },
};

/**
 * Decide where the bot places the card.
 *
 * @param {Array}  timeline   - Bot's current sorted timeline
 * @param {Object} song       - The song to place
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 * @returns {number} position index
 */
const decidePlacement = (timeline, song, difficulty = 'medium') => {
  const { accuracy } = DIFFICULTY[difficulty] || DIFFICULTY.medium;

  // Correct position: first slot where the song fits chronologically
  const correctPosition = timeline.findIndex((s) => s.year > song.year);
  const truePos = correctPosition === -1 ? timeline.length : correctPosition;

  if (Math.random() < accuracy) {
    return truePos; // correct placement
  }

  // Wrong placement: pick a random wrong slot
  const wrongPositions = [];
  for (let i = 0; i <= timeline.length; i++) {
    if (i !== truePos) wrongPositions.push(i);
  }
  if (!wrongPositions.length) return truePos;
  return wrongPositions[Math.floor(Math.random() * wrongPositions.length)];
};

/**
 * Simulates bot thinking delay then calls back with the placement.
 */
const botTakeTurn = (timeline, song, difficulty, callback) => {
  const { minMs, maxMs } = DIFFICULTY[difficulty] || DIFFICULTY.medium;
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  const position = decidePlacement(timeline, song, difficulty);
  setTimeout(() => callback(position), delay);
};

module.exports = { botTakeTurn, decidePlacement };

