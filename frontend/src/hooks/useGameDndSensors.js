import { MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

/**
 * Desktop: drag after a short move.
 * Mobile: long-press (~400ms) before drag, so page scroll isn't hijacked.
 */
export function useGameDndSensors() {
  return useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 400,
        tolerance: 8,
      },
    })
  );
}
