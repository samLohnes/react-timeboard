import * as React from 'react';

export interface GroupHeaderProps {
  groupId: string;
  label: string;
  isExpanded: boolean;
  onToggle: () => void;
  /**
   * Optional custom content for the label area (from `renderGroupHeader`).
   * The chevron button is always rendered by the library; this replaces only
   * the label span's content.
   */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

/**
 * A resource-group row with a chevron button that toggles expansion.
 *
 * The chevron `<button>` is the ONLY hit target for toggling — the outer row
 * has `role="row"` + `aria-expanded` but no click handler. This prevents
 * consumer-supplied `renderGroupHeader` content from causing accidental toggles.
 */
export const GroupHeader = React.memo(function GroupHeaderImpl({
  label,
  isExpanded,
  onToggle,
  children,
  style,
}: GroupHeaderProps) {
  const className = `rtb-group-header ${
    isExpanded ? 'rtb-group-header--expanded' : 'rtb-group-header--collapsed'
  }`;
  const chevronLabel = `${isExpanded ? 'Collapse' : 'Expand'} ${label}`;
  return (
    <div className={className} role="row" aria-expanded={isExpanded} style={style}>
      <button
        type="button"
        className="rtb-group-header__chevron"
        aria-label={chevronLabel}
        aria-expanded={isExpanded}
        onClick={onToggle}
      >
        <span aria-hidden="true">{isExpanded ? '▼' : '▶'}</span>
      </button>
      <span className="rtb-group-header__label">{children ?? label}</span>
    </div>
  );
});
