import { DragOverlay, useDndMonitor } from '@dnd-kit/core';
import { useState, type ReactNode } from 'react';

/**
 * Story-only helper (NOT part of the library). Portals a drag preview to
 * `document.body` so it's never clipped by scrollable sidebars or overflow
 * containers. The library itself ends at drop targets — source-side drag
 * concerns (including previews) are consumer territory. This helper is
 * documented as a copy-paste recipe in the README.
 */
export function DragPreview<T>({
  render,
}: {
  render: (active: T) => ReactNode;
}) {
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
