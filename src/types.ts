import type * as React from 'react';

/**
 * An event rendered on the timeline. Consumers typically extend this with
 * domain-specific fields.
 */
export interface BaseEvent {
  /** Stable unique identifier used as the React key. */
  id: string;
  /** Inclusive start of the event. */
  start: Date;
  /** Exclusive end of the event. */
  end: Date;
  /** References a BaseResource.id. Events whose resourceId does not match any resource are silently skipped. */
  resourceId: string;
}

/**
 * A resource represents one row on the timeline (a person, room, channel, machine, etc.).
 */
export interface BaseResource {
  /** Stable unique identifier. */
  id: string;
  /** Human-readable label. Used by the default renderer when `renderResource` is not provided. */
  label: string;
  /**
   * Optional reference to a ResourceGroup.id. When set, this resource renders under that
   * group's header. Resources with no groupId (or with a groupId that doesn't match any
   * provided group) render ungrouped at the top of the grid.
   */
  groupId?: string;
}

/**
 * A collapsible section header that groups a set of resources.
 */
export interface ResourceGroup {
  /** Stable unique identifier referenced by BaseResource.groupId. */
  id: string;
  /** Display label shown in the group header row. */
  label: string;
}

/**
 * Interval modes are fixed at instantiation.
 *
 * - `hourly`: each column is one hour.
 * - `daily`: each column is one day at local midnight.
 * - `weekly`: each column is one ISO week starting Monday at local midnight.
 */
export type IntervalMode = 'hourly' | 'daily' | 'weekly';

/**
 * Props for the top-level `ResourceTimeline` component. Generic over event and resource types.
 */
export interface ResourceTimelineProps<
  TEvent extends BaseEvent,
  TResource extends BaseResource,
> {
  /** Resources rendered in array order. Grouped resources appear under their group header. */
  resources: TResource[];
  /** Events rendered on the body's absolute event layer. */
  events: TEvent[];
  /** Inclusive start / exclusive end. Columns generate from `start` stepping by `interval` up to `end`. */
  timeRange: { start: Date; end: Date };
  /** One of the three fixed modes. */
  interval: IntervalMode;
  /**
   * Required. CSS height for the outer container (string like `'80vh'` or a pixel number).
   * The library's body is `overflow: auto`; without a bounded outer height it cannot scroll.
   */
  height: string | number;
  /** Optional resource groups. When provided, resources with matching `groupId` render under group headers. */
  groups?: ResourceGroup[];
  /** Controlled expansion state. If provided, only groups whose id appears here are expanded. */
  expandedGroupIds?: string[];
  /** Uncontrolled-mode initial expanded group IDs. Ignored if `expandedGroupIds` is provided. Defaults to all groups expanded. */
  defaultExpandedGroupIds?: string[];
  /** Fires when the user toggles a group's expansion via the chevron button. */
  onGroupToggle?: (groupId: string, nextExpanded: boolean) => void;
  /** Optional custom event renderer. */
  renderEvent?: (event: TEvent) => React.ReactNode;
  /** Optional custom sidebar resource renderer. */
  renderResource?: (resource: TResource) => React.ReactNode;
  /**
   * Optional custom renderer for group header label content. The library always renders its
   * own chevron button; this prop only replaces the label area.
   */
  renderGroupHeader?: (group: ResourceGroup, isExpanded: boolean) => React.ReactNode;
  /** Fires when a draggable from outside the grid is dropped onto a cell. */
  onExternalDrop?: (item: unknown, resourceId: string, date: Date) => void;
  /** Fires when an event block is clicked. */
  onEventClick?: (event: TEvent, e: React.MouseEvent) => void;
  /** Fires when a cell is clicked (not during a drag, not on an event). */
  onCellClick?: (resourceId: string, date: Date) => void;
  /** px per column. Default: 80 (hourly), 120 (daily), 160 (weekly). Pass when overriding `--rtb-column-width`. */
  columnWidth?: number;
  /** px per event lane. Default: 28. Pass when overriding `--rtb-event-lane-height`. */
  laneHeight?: number;
  /** px top+bottom inside a resource row. Default: 4. Pass when overriding `--rtb-row-padding`. */
  rowPadding?: number;
  /** px height of a group header row. Default: 36. Pass when overriding `--rtb-group-header-height`. */
  groupHeaderHeight?: number;
  /** Dim the grid and render a spinner overlay; suppresses drop handling. */
  loading?: boolean;
  /** Accessible label for the root grid element. */
  ariaLabel?: string;
}
