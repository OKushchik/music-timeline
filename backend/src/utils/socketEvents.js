/** All Socket.IO event name constants — shared source of truth for the backend */
const EVENTS = {
  // Client → Server
  JOIN_ROOM:    'join-room',
  LEAVE_ROOM:   'leave-room',
  PLAYER_READY: 'player-ready',
  START_GAME:   'start-game',
  REQUEST_SONG: 'request-song',
  PLACE_CARD:   'place-card',
  NEXT_ROUND:   'next-round',
  SEND_CHAT:             'send-chat',
  REQUEST_CHAT_HISTORY:  'request-chat-history',

  // Server → Client
  JOIN_SUCCESS:  'join-success',
  ROOM_UPDATED:  'room-updated',
  GAME_STARTED:  'game-started',
  NEW_SONG:      'new-song',
  CARD_RESULT:   'card-result',
  SCORE_UPDATE:  'score-update',
  BOT_PLACED:    'bot-placed',
  ROUND_STARTED: 'round-started',
  GAME_OVER:     'game-over',
  NO_SONGS_LEFT: 'no-songs-left',
  CHAT_MESSAGE:  'chat-message',
  CHAT_HISTORY:  'chat-history',
  ERROR:         'error',
};

module.exports = { EVENTS };

