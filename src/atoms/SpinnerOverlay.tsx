import * as React from 'react';

export interface SpinnerOverlayProps {
  visible: boolean;
}

/** A full-grid loading overlay with a centered CSS-only spinner. */
export const SpinnerOverlay = React.memo(function SpinnerOverlayImpl({
  visible,
}: SpinnerOverlayProps) {
  if (!visible) return null;
  return (
    <div className="rtb-loading-overlay" aria-busy="true" aria-live="polite">
      <div className="rtb-spinner" role="status" aria-label="Loading" />
    </div>
  );
});
