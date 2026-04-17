import * as React from 'react';

export interface CornerCellProps {
  /** Optional content; typically empty in v1. */
  children?: React.ReactNode;
}

/** The top-left corner of the four-quadrant grid. Structural only. */
export const CornerCell = React.memo(function CornerCellImpl({ children }: CornerCellProps) {
  return (
    <div className="rtb-corner" aria-hidden="true">
      {children}
    </div>
  );
});
