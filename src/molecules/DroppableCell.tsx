import * as React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Cell } from '../atoms';
import { formatDropId } from '../lib/dropId';

export interface DroppableCellProps {
  resourceId: string;
  date: Date;
  columnIndex: number;
  rowIndex: number;
  isAlternateColumn: boolean;
  onClick?: () => void;
}

/**
 * Wraps a `Cell` atom with `useDroppable` so cell-level drop-target behavior is
 * owned here — keeping dnd-kit out of the atoms layer.
 */
export const DroppableCell = React.memo(function DroppableCellImpl({
  resourceId,
  date,
  columnIndex,
  rowIndex,
  isAlternateColumn,
  onClick,
}: DroppableCellProps) {
  const dropId = formatDropId(resourceId, date);
  const { setNodeRef, isOver } = useDroppable({ id: dropId });
  return (
    <Cell
      ref={setNodeRef}
      resourceId={resourceId}
      date={date}
      columnIndex={columnIndex}
      rowIndex={rowIndex}
      isAlternateColumn={isAlternateColumn}
      onClick={onClick}
      dataAttributes={isOver ? { 'data-over': 'true' } : undefined}
    />
  );
});
