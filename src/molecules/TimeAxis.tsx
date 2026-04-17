import * as React from 'react';
import { TimeLabel } from '../atoms';
import { formatColumnLabel } from '../lib/time';
import type { IntervalMode } from '../types';

export interface TimeAxisProps {
  /** Column start dates, from `generateColumns`. */
  columns: Date[];
  interval: IntervalMode;
  /** Pixel width per column. Must match the body's column width. */
  columnWidth: number;
}

/** The top-right quadrant: one TimeLabel per column, laid out in a CSS grid. */
export const TimeAxis = React.memo(function TimeAxisImpl({
  columns,
  interval,
  columnWidth,
}: TimeAxisProps) {
  return (
    <div
      className="rtb-time-axis"
      role="row"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns.length}, ${columnWidth}px)`,
      }}
    >
      {columns.map((date, i) => (
        <TimeLabel
          key={date.toISOString()}
          date={date}
          columnIndex={i}
          label={formatColumnLabel(date, interval)}
        />
      ))}
    </div>
  );
});
