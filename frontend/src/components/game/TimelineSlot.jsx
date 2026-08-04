import { useDroppable } from '@dnd-kit/core';
import { motion } from 'framer-motion';

/**
 * A droppable slot between timeline cards.
 * `id` should be the insertion index as a string: "0", "1", etc.
 */
export default function TimelineSlot({ id, isOver }) {
  const { setNodeRef, isOver: dndIsOver } = useDroppable({ id });
  const active = isOver || dndIsOver;

  return (
    <motion.div
      ref={setNodeRef}
      animate={{ width: active ? 88 : 40 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`
        h-28 flex-shrink-0 rounded-lg border-2 border-dashed flex items-center justify-center
        transition-colors duration-150
        ${active ? 'border-primary bg-primary/20' : 'border-slate-600 hover:border-slate-400'}
      `}
    >
      {active && <span className="text-primary text-lg">⬇</span>}
    </motion.div>
  );
}

