import { DragOverlay, useDndMonitor } from '@dnd-kit/core';
import { useState, type ReactNode } from 'react';

export interface TimeboardDragPreviewProps<T> {
  /** Render the active drag item's preview. Called with `active.data.current`. */
  render: (active: T) => ReactNode;
}

/**
 * Renders a portalled drag preview that follows the cursor during a drag,
 * so the preview is never clipped by scrollable sidebars or overflow
 * containers. Must be rendered inside the consumer's `<DndContext>`.
 *
 * Pair with `useTimeboardDraggable` on the source elements and — when
 * `TimeboardDragPreview` is in use — ignore `dragStyle` from the hook;
 * this component handles the cursor-follow motion. Use `isDragging` on
 * the source to fade it while dragging.
 *
 * @example
 * ```tsx
 * <DndContext>
 *   <MyChip ... />
 *   <ResourceTimeline ... />
 *   <TimeboardDragPreview<MyItem>
 *     render={(item) => <MyChipPreview item={item} />}
 *   />
 * </DndContext>
 * ```
 */
export function TimeboardDragPreview<T>({ render }: TimeboardDragPreviewProps<T>) {
  const [active, setActive] = useState<T | null>(null);
  useDndMonitor({
    onDragStart: (e) => setActive((e.active.data.current as T) ?? null),
    onDragEnd: () => setActive(null),
    onDragCancel: () => setActive(null),
  });
  return (
    <DragOverlay dropAnimation={null}>
      {active ? render(active) : null}
    </DragOverlay>
  );
}
