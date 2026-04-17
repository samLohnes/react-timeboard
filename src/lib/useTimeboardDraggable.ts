import { useDraggable } from '@dnd-kit/core';

export interface UseTimeboardDraggableOptions<T> {
  /** Stable unique ID. Must NOT contain the reserved `___` separator used by cell drop IDs. */
  id: string;
  /** Arbitrary payload delivered to `onExternalDrop` as `item`. */
  data: T;
  disabled?: boolean;
}

/**
 * Thin wrapper around `useDraggable` that validates `id` against the reserved
 * separator and returns the minimal field set consumers typically spread onto
 * their draggable element, plus a ready-to-apply `dragStyle` transform.
 */
export function useTimeboardDraggable<T>(options: UseTimeboardDraggableOptions<T>) {
  if (options.id.includes('___')) {
    throw new Error(
      `[react-timeboard] Draggable id "${options.id}" must not contain the reserved '___' separator used for cell drop IDs.`,
    );
  }
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: options.id,
    data: options.data as unknown as Record<string, unknown>,
    disabled: options.disabled,
  });
  return {
    setNodeRef,
    attributes,
    listeners,
    isDragging,
    /** Apply to the draggable element's `style` so motion follows the cursor. */
    dragStyle: transform
      ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
      : undefined,
  };
}
