import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useSocket } from './useSocket';
import { useAuth } from './useAuth';
import { EVENTS } from '../utils/socketEvents';
import toast from 'react-hot-toast';

/**
 * Subscribes to all game-related socket events and syncs them into
 * the Zustand game store.  Mount this hook once in GamePage.
 *
 * Song distribution is server-owned (emitted on game start / round advance).
 * REQUEST_SONG is used only as a reconnect resync.
 */
export const useGame = (roomCode) => {
  const { emit, on, connected } = useSocket();
  const { user } = useAuth();
  const {
    setCurrentSong,
    setRound,
    addResult,
    syncTimelineFromResult,
    setTimeline,
    setPlayers,
    setGameOver,
    setWaitingForNext,
  } = useGameStore();

  useEffect(() => {
    if (!roomCode || !connected) return;

    const offJoinSuccess = on(EVENTS.JOIN_SUCCESS, ({ room }) => {
      if (!room || room.code !== roomCode.toUpperCase()) return;
      setRound(room.currentRound || 1);
      if (room.players) {
        setPlayers(
          room.players.map(({ userId, username, score }) => ({ userId, username, score }))
        );
        const me = room.players.find(
          (p) =>
            String(p.userId) === String(user?._id) ||
            p.userId?.toString?.() === user?._id
        );
        if (me?.timeline) setTimeline(me.timeline);
      }
    });

    const offNewSong = on(EVENTS.NEW_SONG, ({ song, round }) => {
      setWaitingForNext(false);
      setCurrentSong(song);
      setRound(round);
    });

    const offRoundStarted = on(EVENTS.ROUND_STARTED, ({ round }) => {
      setRound(round);
      setCurrentSong(null);
    });

    const offCardResult = on(EVENTS.CARD_RESULT, (result) => {
      addResult(result);
      syncTimelineFromResult(result);
    });

    const offScoreUpdate = on(EVENTS.SCORE_UPDATE, ({ players }) => {
      setPlayers(players);
    });

    const offGameOver = on(EVENTS.GAME_OVER, (data) => {
      setWaitingForNext(false);
      setGameOver(data);
    });

    const offRoomUpdated = on(EVENTS.ROOM_UPDATED, (updated) => {
      const list = updated?.players ?? updated;
      if (Array.isArray(list)) {
        setPlayers(
          list.map(({ userId, username, score }) => ({ userId, username, score }))
        );
      }
    });

    const offNoSongs = on(EVENTS.NO_SONGS_LEFT, () => {
      toast.error('No songs left in the database');
    });

    // Resync only — server will not pick a new song
    emit(EVENTS.REQUEST_SONG, { roomCode });

    return () => {
      offJoinSuccess();
      offNewSong();
      offRoundStarted();
      offCardResult();
      offScoreUpdate();
      offGameOver();
      offRoomUpdated();
      offNoSongs();
    };
  }, [
    roomCode,
    connected,
    emit,
    on,
    user?._id,
    setCurrentSong,
    setRound,
    addResult,
    syncTimelineFromResult,
    setTimeline,
    setPlayers,
    setGameOver,
    setWaitingForNext,
  ]);

  const placeCard = (song, position) => {
    emit(EVENTS.PLACE_CARD, { roomCode, song, position });
  };

  const nextRound = () => {
    setWaitingForNext(true);
    emit(EVENTS.NEXT_ROUND, { roomCode });
  };

  return { placeCard, nextRound };
};
