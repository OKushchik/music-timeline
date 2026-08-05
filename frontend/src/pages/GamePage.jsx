import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, rectIntersection } from '@dnd-kit/core';
import { useSocket } from '../hooks/useSocket';
import { useGame } from '../hooks/useGame';
import { useGameStore } from '../store/gameStore';
import { EVENTS } from '../utils/socketEvents';
import AudioPlayer from '../components/game/AudioPlayer';
import SongCard from '../components/game/SongCard';
import Timeline from '../components/game/Timeline';
import ScoreBoard from '../components/game/ScoreBoard';
import RoundResult from '../components/game/RoundResult';
import ChatPanel from '../components/chat/ChatPanel';
import Loader from '../components/shared/Loader';
import Button from '../components/shared/Button';
import toast from 'react-hot-toast';

export default function GamePage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { emit, on } = useSocket();
  const { placeCard, nextRound } = useGame(roomCode);

  const {
    currentSong,
    timeline,
    round,
    players,
    lastResult,
    gameOver,
    waitingForNext,
    clearResult,
    setCurrentSong,
    reset,
  } = useGameStore();

  // Join the socket room on mount; reset leftover state from a previous game.
  // We do NOT emit leave-room on unmount because unmounting usually means
  // navigating to the results screen — not intentionally leaving the room.
  useEffect(() => {
    reset();
    emit(EVENTS.JOIN_ROOM, { roomCode });
    const offErr = on(EVENTS.ERROR, ({ message }) => toast.error(message));
    return () => {
      offErr();
    };
  }, [roomCode, emit, on, reset]);

  // Navigate to results when game is over
  useEffect(() => {
    if (gameOver) navigate(`/results/${roomCode}`);
  }, [gameOver, navigate, roomCode]);

  const [isDragging, setIsDragging] = useState(false);
  const [answered, setAnswered] = useState(false);

  const leaveRoom = () => {
    emit(EVENTS.LEAVE_ROOM, { roomCode });
    reset();
    toast.success('Left the room');
    navigate('/lobby');
  };

  // Timeline updates only after CARD_RESULT (correct placements only)
  const handleDrop = (song, position) => {
    setAnswered(true);
    placeCard(song, position);
  };

  const handleNextRound = () => {
    clearResult();
    setAnswered(false);
    setCurrentSong(null); // show loader while waiting for others / next song
    nextRound();
  };

  // New song → allow playback again
  useEffect(() => {
    setAnswered(false);
  }, [currentSong?._id]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = () => setIsDragging(true);

  const handleDragEnd = ({ over }) => {
    setIsDragging(false);
    if (over && currentSong) {
      handleDrop(currentSong, parseInt(over.id, 10));
    }
  };

  const headerBar = (
    <div className="flex items-center justify-between mb-6 gap-3">
      <h2 className="text-xl font-bold text-white">
        Round <span className="text-primary">{round}</span>
      </h2>
      <div className="flex items-center gap-2">
        <span className="text-gray-400 text-sm font-mono bg-card px-3 py-1 rounded-lg">
          {roomCode}
        </span>
        <Button variant="danger" className="text-xs px-3 py-1.5" onClick={leaveRoom}>
          Leave
        </Button>
      </div>
    </div>
  );

  const sidePanel = (
    <div className="flex flex-col gap-4">
      <ScoreBoard players={players} />
      <ChatPanel roomCode={roomCode} collapsible />
    </div>
  );

  if (!currentSong) {
    const waitingText = waitingForNext
      ? 'Waiting for other players…'
      : round > 1
        ? 'Waiting for next round…'
        : 'Waiting for the first song…';
    return (
      <main className="max-w-5xl mx-auto px-4 py-6">
        {headerBar}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px] gap-6">
          <Loader text={waitingText} />
          {sidePanel}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      {headerBar}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px] gap-6">
        {/* Left: audio + drag card + timeline — all in ONE shared DndContext */}
        <div className="flex flex-col gap-6 min-w-0">
          <AudioPlayer song={currentSong} stopped={answered || !!lastResult} />

          <DndContext
            sensors={sensors}
            collisionDetection={rectIntersection}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex flex-col items-center gap-2">
              <p className="text-gray-400 text-sm">Drag this card into your timeline:</p>
              <SongCard song={currentSong} isDragging={isDragging} />
            </div>

            <div className="min-w-0 w-full">
              <h3 className="text-sm text-gray-400 uppercase tracking-wide mb-2">Your Timeline</h3>
              <Timeline timeline={timeline} />
            </div>

            <DragOverlay dropAnimation={null}>
              {isDragging ? <SongCard song={currentSong} overlay /> : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Right: scoreboard + chat */}
        {sidePanel}
      </div>

      {/* Round result overlay */}
      <RoundResult result={lastResult} onNext={handleNextRound} />
    </main>
  );
}
