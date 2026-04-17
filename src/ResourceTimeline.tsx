import * as React from 'react';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useDndMonitor } from '@dnd-kit/core';
import { CornerCell, SpinnerOverlay } from './atoms';
import { TimeAxis, Sidebar, Body } from './molecules';
import { assignLanes, type LaneAssignmentResult } from './lib/lanes';
import { generateColumns } from './lib/time';
import { parseDropId } from './lib/dropId';
import { buildRowPlan } from './lib/grouping';
import type { BaseEvent, BaseResource, ResourceTimelineProps } from './types';

const DEFAULT_LANE_HEIGHT = 28;
const DEFAULT_ROW_PADDING = 4;
const DEFAULT_GROUP_HEADER_HEIGHT = 36;
const DEFAULT_EVENT_MARGIN_X = 2;

function defaultColumnWidth(interval: 'hourly' | 'daily' | 'weekly'): number {
  if (interval === 'hourly') return 80;
  if (interval === 'daily') return 120;
  return 160;
}

function ResourceTimelineImpl<
  TEvent extends BaseEvent,
  TResource extends BaseResource,
>(props: ResourceTimelineProps<TEvent, TResource>) {
  const {
    resources,
    events,
    timeRange,
    interval,
    height,
    groups,
    expandedGroupIds: controlledExpandedGroupIds,
    defaultExpandedGroupIds,
    onGroupToggle,
    renderEvent,
    renderResource,
    renderGroupHeader,
    onEventClick,
    onCellClick,
    onExternalDrop,
    loading,
    ariaLabel,
  } = props;

  const columnWidth = props.columnWidth ?? defaultColumnWidth(interval);
  const laneHeight = props.laneHeight ?? DEFAULT_LANE_HEIGHT;
  const rowPadding = props.rowPadding ?? DEFAULT_ROW_PADDING;
  const groupHeaderHeight = props.groupHeaderHeight ?? DEFAULT_GROUP_HEADER_HEIGHT;
  const eventMarginX = DEFAULT_EVENT_MARGIN_X;

  const rangeStartMs = timeRange.start.getTime();
  const rangeEndMs = timeRange.end.getTime();

  // Uncontrolled expansion state. Initialized lazily from defaultExpandedGroupIds
  // or — when neither controlled nor default is provided — all groups expanded.
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState<Set<string>>(() => {
    if (controlledExpandedGroupIds !== undefined) return new Set(controlledExpandedGroupIds);
    if (defaultExpandedGroupIds !== undefined) return new Set(defaultExpandedGroupIds);
    if (groups) return new Set(groups.map((g) => g.id));
    return new Set<string>();
  });

  const isControlled = controlledExpandedGroupIds !== undefined;
  const expandedSet = useMemo(
    () => (isControlled ? new Set(controlledExpandedGroupIds) : uncontrolledExpanded),
    [isControlled, controlledExpandedGroupIds, uncontrolledExpanded],
  );

  const handleGroupToggle = useCallback(
    (groupId: string) => {
      const nextExpanded = !expandedSet.has(groupId);
      onGroupToggle?.(groupId, nextExpanded);
      if (!isControlled) {
        setUncontrolledExpanded((prev) => {
          const next = new Set(prev);
          if (nextExpanded) next.add(groupId);
          else next.delete(groupId);
          return next;
        });
      }
    },
    [expandedSet, isControlled, onGroupToggle],
  );

  const columns = useMemo(
    () => generateColumns(timeRange, interval),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rangeStartMs, rangeEndMs, interval],
  );

  const rowPlan = useMemo(
    () => buildRowPlan(resources, groups, expandedSet),
    [resources, groups, expandedSet],
  );

  // Events grouped by VISIBLE resource only. Events for resources in collapsed
  // groups are skipped — no lane computation wasted on off-screen rows.
  const eventsByResource = useMemo(() => {
    const visibleIds = new Set(rowPlan.visibleResources.map((r) => r.id));
    const map = new Map<string, TEvent[]>();
    for (const event of events) {
      if (!visibleIds.has(event.resourceId)) continue;
      const list = map.get(event.resourceId);
      if (list) {
        list.push(event);
      } else {
        map.set(event.resourceId, [event]);
      }
    }
    return map;
  }, [events, rowPlan.visibleResources]);

  const laneResultsByResource = useMemo(() => {
    const result = new Map<string, LaneAssignmentResult>();
    for (const resource of rowPlan.visibleResources) {
      const resourceEvents = eventsByResource.get(resource.id) ?? [];
      result.set(resource.id, assignLanes(resourceEvents, timeRange, interval));
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowPlan.visibleResources, eventsByResource, rangeStartMs, rangeEndMs, interval]);

  const rowHeights = useMemo(() => {
    return rowPlan.rows.map((row) => {
      if (row.kind === 'group-header') return groupHeaderHeight;
      const laneResult = laneResultsByResource.get(row.resource.id);
      const laneCount = Math.max(1, laneResult?.laneCount ?? 1);
      return rowPadding * 2 + laneCount * laneHeight;
    });
  }, [rowPlan.rows, laneResultsByResource, groupHeaderHeight, rowPadding, laneHeight]);

  const bodyScrollRef = useRef<HTMLDivElement>(null);
  const timeAxisScrollRef = useRef<HTMLDivElement>(null);
  const sidebarScrollRef = useRef<HTMLDivElement>(null);

  const handleBodyScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (timeAxisScrollRef.current) {
      timeAxisScrollRef.current.scrollLeft = el.scrollLeft;
    }
    if (sidebarScrollRef.current) {
      sidebarScrollRef.current.scrollTop = el.scrollTop;
    }
  }, []);

  // Drops are only claimed if the target resource id is one of OUR visible rows;
  // this prevents cross-firing between multiple timelines sharing one DndContext
  // AND prevents drops onto cells belonging to resources hidden by a collapsed group
  // (though the DOM doesn't render those cells anyway).
  useDndMonitor({
    onDragEnd: (event) => {
      if (loading) return;
      const overId = event.over?.id;
      if (typeof overId !== 'string') return;
      const parsed = parseDropId(overId);
      if (!parsed) return;
      if (!resources.some((r) => r.id === parsed.resourceId)) return;
      onExternalDrop?.(event.active.data.current, parsed.resourceId, parsed.date);
    },
  });

  const rootClassName = loading ? 'rtb-root rtb-root--loading' : 'rtb-root';
  const resolvedHeight = typeof height === 'number' ? `${height}px` : height;
  const ariaRowCount = rowPlan.rows.length + 1;

  return (
    <div
      className={rootClassName}
      role="grid"
      aria-label={ariaLabel}
      aria-rowcount={ariaRowCount}
      aria-colcount={columns.length + 1}
      style={{
        display: 'grid',
        gridTemplateColumns: 'var(--rtb-sidebar-width, 180px) 1fr',
        gridTemplateRows: 'var(--rtb-time-axis-height, 40px) 1fr',
        height: resolvedHeight,
        position: 'relative',
      }}
    >
      <div className="rtb-corner-container">
        <CornerCell />
      </div>

      <div
        ref={timeAxisScrollRef}
        className="rtb-time-axis-container"
        style={{ overflowX: 'hidden', overflowY: 'hidden' }}
      >
        <TimeAxis columns={columns} interval={interval} columnWidth={columnWidth} />
      </div>

      <div
        ref={sidebarScrollRef}
        className="rtb-sidebar-container"
        style={{ overflowX: 'hidden', overflowY: 'hidden' }}
      >
        <Sidebar<TResource>
          rows={rowPlan.rows}
          rowHeights={rowHeights}
          renderResource={renderResource}
          renderGroupHeader={renderGroupHeader}
          onGroupToggle={handleGroupToggle}
        />
      </div>

      <div
        ref={bodyScrollRef}
        className="rtb-body-container"
        style={{ overflow: 'auto' }}
        onScroll={handleBodyScroll}
      >
        <Body<TEvent, TResource>
          rows={rowPlan.rows}
          columns={columns}
          columnWidth={columnWidth}
          rowHeights={rowHeights}
          laneHeight={laneHeight}
          rowPadding={rowPadding}
          eventMarginX={eventMarginX}
          eventsByResource={eventsByResource}
          laneResultsByResource={laneResultsByResource}
          renderEvent={renderEvent}
          onEventClick={onEventClick}
          onCellClick={onCellClick}
        />
      </div>

      <SpinnerOverlay visible={!!loading} />
    </div>
  );
}

export const ResourceTimeline = React.memo(ResourceTimelineImpl) as typeof ResourceTimelineImpl;
