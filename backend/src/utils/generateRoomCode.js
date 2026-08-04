const { nanoid } = require('nanoid');

/**
 * Generates a unique 6-character uppercase room code.
 * e.g. "A3K7PQ"
 */
const generateRoomCode = () => nanoid(6).toUpperCase();

module.exports = { generateRoomCode };

