import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocalGameStore } from '../store/localGameStore';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/shared/Button';
import { motion } from 'framer-motion';

const MAX_PLAYERS = 6;
const ROUND_OPTIONS = [4, 6, 8, 10, 12];

export default function SetupPage() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const setupGame = useLocalGameStore((s) => s.setupGame);

  const [playerNames, setPlayerNames] = useState(['', '']);
  const [totalRounds, setTotalRounds] = useState(8);

  const updateName = (i, val) => {
    const next = [...playerNames];
    next[i] = val;
    setPlayerNames(next);
  };

  const addPlayer = () => {
    if (playerNames.length < MAX_PLAYERS) setPlayerNames([...playerNames, '']);
  };

  const removePlayer = (i) => {
    if (playerNames.length > 2) setPlayerNames(playerNames.filter((_, idx) => idx !== i));
  };

  const canStart = playerNames.every((n) => n.trim().length > 0);

  const handleStart = () => {
    if (!canStart) return;
    setupGame(playerNames.map((n) => n.trim()), totalRounds);
    navigate('/local-game');
  };

  const handleBack = () => {
    navigate(token ? '/lobby' : '/');
  };

  return (
    <main className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-black text-white mb-2 text-center">
          🎮 Local Game Setup
        </h1>
        <p className="text-gray-400 text-center mb-8 text-sm">
          Everyone plays on the same device — pass it between turns!
        </p>

        {/* Players */}
        <div className="bg-card rounded-xl p-5 border border-slate-700 mb-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Players ({playerNames.length}/{MAX_PLAYERS})
          </h2>
          <div className="flex flex-col gap-2">
            {playerNames.map((name, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-gray-500 text-sm w-5">{i + 1}.</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => updateName(i, e.target.value)}
                  placeholder={`Player ${i + 1} name`}
                  maxLength={20}
                  className="flex-1 bg-darker border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary"
                />
                {playerNames.length > 2 && (
                  <button
                    onClick={() => removePlayer(i)}
                    className="text-gray-500 hover:text-red-400 transition text-xl leading-none"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          {playerNames.length < MAX_PLAYERS && (
            <button
              onClick={addPlayer}
              className="mt-3 text-sm text-primary hover:text-indigo-300 transition"
            >
              + Add player
            </button>
          )}
        </div>

        {/* Rounds per player */}
        <div className="bg-card rounded-xl p-5 border border-slate-700 mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Rounds per player
          </h2>
          <div className="flex gap-2 flex-wrap">
            {ROUND_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => setTotalRounds(r)}
                className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition border
                  ${totalRounds === r
                    ? 'bg-primary border-primary text-white'
                    : 'bg-darker border-slate-600 text-gray-400 hover:border-primary'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <Button fullWidth onClick={handleStart} disabled={!canStart} className="py-3 text-base">
          🚀 Start Game
        </Button>

        <button
          onClick={handleBack}
          className="w-full mt-3 text-sm text-gray-500 hover:text-gray-300 transition text-center"
        >
          {token ? '← Back to Lobby' : '← Back to Home'}
        </button>
      </motion.div>
    </main>
  );
}
