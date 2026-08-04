import TimelineSlot from './TimelineSlot';
import { motion } from 'framer-motion';

/**
 * Renders the player's personal sorted timeline.
 * Between every placed card (and at the edges) there is a TimelineSlot drop zone.
 * NOTE: Must be rendered inside a shared DndContext (provided by the parent page)
 * so that the draggable SongCard and these droppable slots share the same context.
 *
 * @param {Array}    timeline  - Array of placed song objects (sorted by year)
 */
export default function Timeline({ timeline }) {
  return (
    <div className="w-full min-w-0">
      <div
        className="
          timeline-scroll
          flex flex-nowrap items-center gap-1
          overflow-x-auto overflow-y-hidden
          pb-3 min-h-[120px]
          scroll-smooth touch-pan-x
        "
      >
        {/* Slot before the first card */}
        <TimelineSlot id="0" />

        {timeline.map((placedSong, idx) => (
          <div key={placedSong._id} className="flex items-center gap-1 flex-shrink-0">
            {/* Placed card (revealed year) */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card border border-slate-600 rounded-xl p-3 w-36 text-center shadow"
            >
              <p className="text-xl font-black text-primary">{placedSong.year}</p>
              <p className="text-xs font-semibold text-white mt-1 truncate">{placedSong.title}</p>
              <p className="text-xs text-gray-400 truncate">{placedSong.artist}</p>
            </motion.div>

            {/* Slot after this card */}
            <TimelineSlot id={String(idx + 1)} />
          </div>
        ))}

        {timeline.length === 0 && (
          <p className="text-gray-500 text-sm mx-4 select-none flex-shrink-0">
            Drop your first song here ↑
          </p>
        )}
      </div>
    </div>
  );
}
