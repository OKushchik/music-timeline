import { create } from 'zustand';

/** Inline placement validator (mirrors backend gameService.validatePlacement) */
const validatePlacement = (timeline, song, position) => {
  const test = [...timeline];
  test.splice(position, 0, song);
  for (let i = 1; i < test.length; i++) {
    if (test[i].year < test[i - 1].year) {
      const sorted = [...timeline, song].sort((a, b) => a.year - b.year);
      const correctPosition = sorted.indexOf(song);
      return { correct: false, correctPosition };
    }
  }
  return { correct: true, correctPosition: position };
};

export const useLocalGameStore = create((set, get) => ({
  // [{ name, score, timeline }]
  players: [],
  totalRounds: 8,
  activePlayerIndex: 0,
  round: 1,
  usedSongIds: [],

  currentSong: null,
  // { correct, correctPosition, song, isLastPlayer, isLastRound }
  lastResult: null,
  // show "pass the device" screen between turns
  showHandoff: false,
  // { players, winners } when game ends
  gameOver: null,

  /** Initialise a new local game */
  setupGame: (playerNames, totalRounds) => {
    set({
      players: playerNames.map((name) => ({ name, score: 0, timeline: [] })),
      totalRounds,
      activePlayerIndex: 0,
      round: 1,
      usedSongIds: [],
      currentSong: null,
      lastResult: null,
      showHandoff: false,
      gameOver: null,
    });
  },

  setCurrentSong: (song) => set({ currentSong: song }),

  /** Called when the active player drops a card */
  submitPlacement: (position) => {
    const { players, activePlayerIndex, currentSong, round, totalRounds, usedSongIds } = get();
    const player = players[activePlayerIndex];
    const { correct, correctPosition } = validatePlacement(player.timeline, currentSong, position);

    // Only correct placements stay on the timeline
    const newTimeline = [...player.timeline];
    if (correct) {
      newTimeline.splice(position, 0, currentSong);
    }

    const updatedPlayers = players.map((p, i) =>
      i === activePlayerIndex
        ? { ...p, score: p.score + (correct ? 1 : 0), timeline: newTimeline }
        : p
    );

    const isLastPlayer = activePlayerIndex === players.length - 1;
    const isLastRound  = round >= totalRounds && isLastPlayer;

    set({
      players: updatedPlayers,
      usedSongIds: [...usedSongIds, String(currentSong._id)],
      lastResult: { correct, correctPosition, song: currentSong, isLastPlayer, isLastRound },
    });
  },

  /** Advance to the next player (or end the game) after result is dismissed */
  advanceTurn: () => {
    const { players, activePlayerIndex, round, totalRounds } = get();
    const isLastPlayer = activePlayerIndex === players.length - 1;
    const isLastRound  = round >= totalRounds && isLastPlayer;

    if (isLastRound) {
      const maxScore = Math.max(...players.map((p) => p.score));
      const winners  = players.filter((p) => p.score === maxScore);
      set({ gameOver: { players, winners }, lastResult: null });
      return;
    }

    set({
      activePlayerIndex: isLastPlayer ? 0 : activePlayerIndex + 1,
      round: isLastPlayer ? round + 1 : round,
      lastResult: null,
      currentSong: null,
      showHandoff: true,
    });
  },

  clearHandoff: () => set({ showHandoff: false }),

  reset: () =>
    set({
      players: [],
      totalRounds: 8,
      activePlayerIndex: 0,
      round: 1,
      usedSongIds: [],
      currentSong: null,
      lastResult: null,
      showHandoff: false,
      gameOver: null,
    }),
}));

