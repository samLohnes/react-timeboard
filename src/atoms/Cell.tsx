import * as React from 'react';

export interface CellProps {
  resourceId: string;
  date: Date;
  columnIndex: number;
  rowIndex: number;
  /** True for odd columns; drives striped background styling. */
  isAlternateColumn: boolean;
  onClick?: () => void;
  /** Arbitrary data-* attributes injected from outside (e.g. `{ 'data-over': 'true' }` from the drop wrapper). */
  dataAttributes?: Record<string, string>;
  style?: React.CSSProperties;
}

/** A single drop-target cell in the body's cell layer. */
export const Cell = React.memo(
  React.forwardRef<HTMLDivElement, CellProps>(function CellImpl(
    { columnIndex, rowIndex, isAlternateColumn, onClick, dataAttributes, style },
    ref,
  ) {
    const className = isAlternateColumn ? 'rtb-cell rtb-cell--alt' : 'rtb-cell';
    return (
      <div
        ref={ref}
        role="gridcell"
        aria-colindex={columnIndex + 1}
        aria-rowindex={rowIndex + 1}
        className={className}
        onClick={onClick}
        style={style}
        {...dataAttributes}
      />
    );
  }),
);
