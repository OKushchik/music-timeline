import { create } from 'zustand';

export const useGameStore = create((set) => ({
  // Current song being placed this round
  currentSong: null,
  setCurrentSong: (song) => set({ currentSong: song }),

  // Player's personal timeline (sorted array of placed songs)
  timeline: [],
  setTimeline: (timeline) => set({ timeline }),
  addToTimeline: (song, position) =>
    set((state) => {
      const next = [...state.timeline];
      next.splice(position, 0, song);
      return { timeline: next };
    }),

  /**
   * After CARD_RESULT: keep song on timeline only if placement was correct.
   * Removes any optimistic insert when wrong.
   */
  syncTimelineFromResult: (result) =>
    set((state) => {
      if (!result?.song) return state;
      const without = state.timeline.filter(
        (s) => String(s._id) !== String(result.song._id)
      );
      if (!result.correct) return { timeline: without };
      const next = [...without];
      next.splice(result.correctPosition, 0, result.song);
      return { timeline: next };
    }),

  // Round info
  round: 1,
  setRound: (round) => set({ round }),

  // All players + scores — used both for initial load and live score updates
  players: [],
  setPlayers: (players) => set({ players }),

  // Last placement result (for RoundResult overlay)
  lastResult: null,
  addResult: (result) => set({ lastResult: result }),
  clearResult: () => set({ lastResult: null }),

  // Waiting for other players to press Next Round
  waitingForNext: false,
  setWaitingForNext: (waitingForNext) => set({ waitingForNext }),

  // Game over data
  gameOver: null,
  setGameOver: (data) => set({ gameOver: data }),

  // Full reset between games
  reset: () =>
    set({
      currentSong: null,
      timeline: [],
      round: 1,
      players: [],
      lastResult: null,
      waitingForNext: false,
      gameOver: null,
    }),
}));
