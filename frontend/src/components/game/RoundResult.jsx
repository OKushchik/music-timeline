import { motion, AnimatePresence } from 'framer-motion';
import Button from '../shared/Button';

export default function RoundResult({ result, onNext }) {
  if (!result) return null;

  const { correct, song } = result;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/70"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={`
            rounded-2xl p-8 text-center max-w-sm mx-4 shadow-2xl border-2
            ${correct
              ? 'bg-green-900/80 border-green-400'
              : 'bg-red-900/80 border-red-400'}
          `}
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className="text-6xl mb-3">{correct ? '✅' : '❌'}</div>
          <h2 className="text-2xl font-black text-white mb-1">
            {correct ? 'Correct!' : 'Wrong!'}
          </h2>
          <p className="text-gray-300 text-sm mb-1">{song?.title}</p>
          <p className="text-gray-400 text-xs mb-1">{song?.artist}</p>
          <p className={`text-3xl font-black mt-2 ${correct ? 'text-green-400' : 'text-red-400'}`}>
            {song?.year}
          </p>
          <p className="text-gray-400 text-xs mt-1 mb-5">
            {correct ? '+1 point!' : 'Not added to timeline — no points'}
          </p>
          <Button fullWidth onClick={onNext}>
            Next Round →
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

