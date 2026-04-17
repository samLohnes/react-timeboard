import * as React from 'react';

export interface TimeLabelProps {
  date: Date;
  columnIndex: number;
  /** Pre-formatted string from `formatColumnLabel`. */
  label: string;
  style?: React.CSSProperties;
}

/** A single column label in the time axis. */
export const TimeLabel = React.memo(function TimeLabelImpl({
  columnIndex,
  label,
  style,
}: TimeLabelProps) {
  return (
    <div
      className="rtb-time-label"
      role="columnheader"
      aria-colindex={columnIndex + 1}
      style={style}
    >
      {label}
    </div>
  );
});
