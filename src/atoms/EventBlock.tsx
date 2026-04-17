import * as React from 'react';

export interface EventBlockProps {
  eventId: string;
  /** Computed positioning from the parent: `{ left, top, width, height }`. */
  style: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  /** Consumer's `renderEvent` output, or the default renderer. */
  children: React.ReactNode;
  ariaLabel?: string;
}

/** An absolutely-positioned event block rendered over the cells layer. */
export const EventBlock = React.memo(function EventBlockImpl({
  eventId,
  style,
  onClick,
  children,
  ariaLabel,
}: EventBlockProps) {
  const handleKeyDown = onClick
    ? (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(e as unknown as React.MouseEvent);
        }
      }
    : undefined;

  return (
    <div
      className="rtb-event"
      role={onClick ? 'button' : undefined}
      aria-label={ariaLabel ?? eventId}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      style={style}
    >
      {children}
    </div>
  );
});
