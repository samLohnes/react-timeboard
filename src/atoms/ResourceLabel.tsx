import * as React from 'react';

export interface ResourceLabelProps {
  resourceId: string;
  rowIndex: number;
  style?: React.CSSProperties;
  /** Default label text, or consumer's `renderResource` output. */
  children: React.ReactNode;
}

/** A single row label in the sidebar. */
export const ResourceLabel = React.memo(function ResourceLabelImpl({
  rowIndex,
  style,
  children,
}: ResourceLabelProps) {
  return (
    <div
      className="rtb-resource-label"
      role="rowheader"
      aria-rowindex={rowIndex + 1}
      style={style}
    >
      {children}
    </div>
  );
});
