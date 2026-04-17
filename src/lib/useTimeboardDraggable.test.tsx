import { describe, it, expect } from 'vitest';
import { DndContext } from '@dnd-kit/core';
import { renderHook } from '@testing-library/react';
import { useTimeboardDraggable } from './useTimeboardDraggable';

function wrapper({ children }: { children: React.ReactNode }) {
  return <DndContext>{children}</DndContext>;
}

describe('useTimeboardDraggable', () => {
  it('returns the expected hook shape when the id is valid', () => {
    const { result } = renderHook(
      () => useTimeboardDraggable({ id: 'espn', data: { network: 'ESPN' } }),
      { wrapper },
    );
    expect(typeof result.current.setNodeRef).toBe('function');
    expect(typeof result.current.isDragging).toBe('boolean');
    expect(result.current.isDragging).toBe(false);
    expect(result.current.dragStyle).toBeUndefined();
  });

  it('throws when the id contains the reserved ___ separator', () => {
    expect(() =>
      renderHook(() => useTimeboardDraggable({ id: 'bad___id', data: {} }), { wrapper }),
    ).toThrow(/must not contain the reserved '___' separator/);
  });
});
