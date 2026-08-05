import { useDraggable } from '@dnd-kit/core';

/**
 * A draggable song card shown at the top of the game view.
 * Title, artist and year stay hidden — the player must guess by ear.
 *
 * When `overlay` is true, the component is rendered inside a DragOverlay
 * (no drag listeners needed — just pure visuals).
 */
export default function SongCard({ song, isDragging = false, overlay = false }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: song?._id || 'song-card',
    data: { song },
    disabled: !song || overlay,
  });

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      {...(overlay ? {} : listeners)}
      {...(overlay ? {} : attributes)}
      style={{ touchAction: 'none' }}
      className={`
        bg-gradient-to-br from-primary to-card border-2 rounded-xl p-4
        cursor-grab active:cursor-grabbing select-none w-30 shadow-lg
        transition-opacity duration-150
        ${isDragging ? 'opacity-40 border-primary' : 'border-transparent'}
        ${overlay ? 'rotate-2 shadow-2xl cursor-grabbing' : ''}
      `}
    >
      <p className="text-xs text-gray-300 text-center uppercase tracking-wider mb-1">
        Mystery track
      </p>
      <p className="mt-3 text-center text-2xl font-black text-white/20 tracking-widest">
        ?
      </p>
    </div>
  );
}
