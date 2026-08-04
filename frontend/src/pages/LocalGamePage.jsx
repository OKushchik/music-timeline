import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, rectIntersection } from '@dnd-kit/core';
import { useLocalGameStore } from '../store/localGameStore';
import { localSongApi } from '../api/localSongApi';
import AudioPlayer from '../components/game/AudioPlayer';
import SongCard from '../components/game/SongCard';
import Timeline from '../components/game/Timeline';
import Loader from '../components/shared/Loader';
import Button from '../components/shared/Button';
import LocalRoundResult from '../components/game/LocalRoundResult';
import LocalScoreBoard from '../components/game/LocalScoreBoard';

export default function LocalGamePage() {
  const navigate = useNavigate();
  const {
    players,
    activePlayerIndex,
    round,
    totalRounds,
    currentSong,
    usedSongIds,
    lastResult,
    showHandoff,
    gameOver,
    setCurrentSong,
    submitPlacement,
    advanceTurn,
    clearHandoff,
    reset,
  } = useLocalGameStore();

  const activePlayer = players[activePlayerIndex];

  // ── DnD setup (hooks must be before any conditional return) ──────────────
  const [isDragging, setIsDragging] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );
  const handleDragStart = () => setIsDragging(true);
  const handleDragEnd = ({ over }) => {
    setIsDragging(false);
    if (over) submitPlacement(parseInt(over.id, 10));
  };

  // Guard: if no game set up, go to setup
  useEffect(() => {
    if (!players.length) navigate('/setup');
  }, [players, navigate]);

  // Navigate to local results when game ends
  useEffect(() => {
    if (gameOver) navigate('/local-results');
  }, [gameOver, navigate]);

  // Fetch next song whenever currentSong is cleared (new turn, no handoff)
  useEffect(() => {
    if (!currentSong && !showHandoff && players.length && !gameOver) {
      localSongApi.getRandom(usedSongIds)
        .then(setCurrentSong)
        .catch(() => {
          const { players: p } = useLocalGameStore.getState();
          const maxScore = Math.max(...p.map((x) => x.score));
          const winners  = p.filter((x) => x.score === maxScore);
          useLocalGameStore.setState({ gameOver: { players: p, winners } });
        });
    }
  }, [currentSong, showHandoff, players.length, gameOver, usedSongIds]);

  // ── Pass-device handoff screen ────────────────────────────────────────────
  if (showHandoff && activePlayer) {
    return (
      <AnimatePresence>
        <motion.div
          key="handoff"
          className="fixed inset-0 z-50 flex items-center justify-center bg-darker"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center px-6">
            <div className="text-7xl mb-4">📱</div>
            <h2 className="text-2xl font-black text-white mb-2">Pass the device!</h2>
            <p className="text-gray-400 mb-2">
              Round <span className="text-primary font-bold">{round}</span>{' '}
              <span className="text-gray-500">/ {totalRounds}</span>
            </p>
            <p className="text-xl text-primary font-bold mb-8">
              👤 {activePlayer.name}'s turn
            </p>
            <Button onClick={clearHandoff} className="px-10 py-3 text-base">
              I'm ready →
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (!currentSong || !activePlayer) return <Loader text="Loading next song…" />;

  return (
    <main className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">
            Round <span className="text-primary">{round}</span>
            <span className="text-gray-500 text-sm font-normal"> / {totalRounds}</span>
          </h2>
          <p className="text-gray-400 text-sm">
            👤 <span className="text-white font-semibold">{activePlayer.name}</span>'s turn
          </p>
        </div>
        <span className="text-gray-400 text-sm font-semibold bg-card px-3 py-1 rounded-lg">
          Score: <span className="text-primary">{activePlayer.score}</span> pts
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px] gap-6">
        {/* Left: audio + card + timeline — all in ONE shared DndContext */}
        <div className="flex flex-col gap-6 min-w-0">
          <AudioPlayer song={currentSong} stopped={!!lastResult} />

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
              <h3 className="text-sm text-gray-400 uppercase tracking-wide mb-2">
                {activePlayer.name}'s Timeline
              </h3>
              <Timeline timeline={activePlayer.timeline} />
            </div>

            <DragOverlay dropAnimation={null}>
              {isDragging ? <SongCard song={currentSong} overlay /> : null}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Right: scoreboard */}
        <LocalScoreBoard players={players} activeIndex={activePlayerIndex} />
      </div>

      {/* Round result overlay */}
      <LocalRoundResult result={lastResult} onNext={advanceTurn} />
    </main>
  );
}
