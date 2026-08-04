import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useAuth } from '../hooks/useAuth';
import { roomApi } from '../api/roomApi';
import Button from '../components/shared/Button';
import Loader from '../components/shared/Loader';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

function getWinners(players) {
  if (!players?.length) return [];
  const max = Math.max(...players.map((p) => p.score ?? 0));
  return players.filter((p) => (p.score ?? 0) === max);
}

export default function ResultsPage() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { gameOver, setGameOver, reset } = useGameStore();
  const [loading, setLoading] = useState(!gameOver);

  useEffect(() => {
    if (gameOver) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    roomApi
      .getRoomByCode(token, roomCode)
      .then((room) => {
        if (cancelled) return;
        if (room.status !== 'finished') {
          toast.error('Game results are not available');
          navigate('/lobby');
          return;
        }
        const players = room.players || [];
        setGameOver({ players, winners: getWinners(players) });
      })
      .catch(() => {
        if (cancelled) return;
        toast.error('Could not load results');
        navigate('/lobby');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [gameOver, roomCode, token, setGameOver, navigate]);

  const players = gameOver?.players || [];
  const winners = gameOver?.winners || [];
  const sorted = [...players].sort((a, b) => b.score - a.score);

  const handlePlayAgain = () => {
    reset();
    navigate('/lobby');
  };

  if (loading || !gameOver) {
    return <Loader text="Loading results…" />;
  }

  return (
    <main className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
        >
          <div className="text-6xl mb-3">🏆</div>
          <h1 className="text-3xl font-black text-white mb-1">Game Over!</h1>
          {winners.length > 0 && (
            <p className="text-primary text-lg font-semibold mb-6">
              {winners.map((w) => w.username).join(' & ')} win{winners.length === 1 ? 's' : ''}!
            </p>
          )}
        </motion.div>

        {/* Final scores */}
        <div className="bg-darker border border-card rounded-xl p-5 mb-6 text-left">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Final Scores
          </h2>
          <ul className="flex flex-col gap-2">
            {sorted.map((p, i) => (
              <motion.li
                key={p.userId}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center justify-between bg-card rounded-lg px-4 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs">{i + 1}.</span>
                  <span className="text-white font-medium">{p.username}</span>
                  {i === 0 && <span className="text-yellow-400 text-xs">👑</span>}
                </div>
                <span className="text-primary font-bold">{p.score} pts</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3 justify-center">
          <Button onClick={handlePlayAgain} className="px-8">
            🔁 Play Again
          </Button>
          <Button variant="ghost" onClick={() => navigate('/')}>
            Home
          </Button>
        </div>
      </div>
    </main>
  );
}
