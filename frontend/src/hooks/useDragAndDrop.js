import { useState, useCallback } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { useGameDndSensors } from './useGameDndSensors';

/**
 * Encapsulates DnD-kit setup for the timeline.
 *
 * Usage:
 *   const { activeId, handleDragStart, handleDragEnd, DndWrapper } = useDragAndDrop(onDrop);
 *   Wrap your timeline in <DndWrapper>...</DndWrapper>
 */
export const useDragAndDrop = (onDrop) => {
  const [activeId, setActiveId] = useState(null);

  const sensors = useGameDndSensors();

  const handleDragStart = useCallback(({ active }) => {
    setActiveId(active.id);
  }, []);

  const handleDragEnd = useCallback(
    ({ active, over }) => {
      setActiveId(null);
      if (over && active.id !== over.id) {
        onDrop({ dragId: active.id, dropId: over.id });
      }
    },
    [onDrop]
  );

  const DndWrapper = useCallback(
    ({ children }) => (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {children}
      </DndContext>
    ),
    [sensors, handleDragStart, handleDragEnd]
  );

  return { activeId, DndWrapper };
};

