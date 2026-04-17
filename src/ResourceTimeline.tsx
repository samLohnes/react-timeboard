import * as React from 'react';
import { useCallback, useMemo, useRef } from 'react';
import { useDndMonitor } from '@dnd-kit/core';
import { CornerCell, SpinnerOverlay } from './atoms';
import { TimeAxis, Sidebar, Body } from './molecules';
import { assignLanes, type LaneAssignmentResult } from './lib/lanes';
import { generateColumns } from './lib/time';
import { parseDropId } from './lib/dropId';
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
    renderEvent,
    renderResource,
    onEventClick,
    onCellClick,
    onExternalDrop,
    loading,
    ariaLabel,
  } = props;

  const columnWidth = props.columnWidth ?? defaultColumnWidth(interval);
  const laneHeight = props.laneHeight ?? DEFAULT_LANE_HEIGHT;
  const rowPadding = props.rowPadding ?? DEFAULT_ROW_PADDING;
  // groupHeaderHeight is consumed in Task 8; we resolve it here so future-Task-8 logic has a ready value.
  const _groupHeaderHeight = props.groupHeaderHeight ?? DEFAULT_GROUP_HEADER_HEIGHT;
  void _groupHeaderHeight;
  const eventMarginX = DEFAULT_EVENT_MARGIN_X;

  // Compare Dates via getTime() so memoization holds when consumers pass fresh Date instances
  // with identical underlying timestamps.
  const rangeStartMs = timeRange.start.getTime();
  const rangeEndMs = timeRange.end.getTime();

  const columns = useMemo(
    () => generateColumns(timeRange, interval),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rangeStartMs, rangeEndMs, interval],
  );

  const eventsByResource = useMemo(() => {
    const map = new Map<string, TEvent[]>();
    for (const event of events) {
      const list = map.get(event.resourceId);
      if (list) {
        list.push(event);
      } else {
        map.set(event.resourceId, [event]);
      }
    }
    return map;
  }, [events]);

  const laneResultsByResource = useMemo(() => {
    const result = new Map<string, LaneAssignmentResult>();
    for (const resource of resources) {
      const resourceEvents = eventsByResource.get(resource.id) ?? [];
      result.set(resource.id, assignLanes(resourceEvents, timeRange, interval));
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resources, eventsByResource, rangeStartMs, rangeEndMs, interval]);

  const rowHeights = useMemo(() => {
    return resources.map((resource) => {
      const laneResult = laneResultsByResource.get(resource.id);
      const laneCount = Math.max(1, laneResult?.laneCount ?? 1);
      return rowPadding * 2 + laneCount * laneHeight;
    });
  }, [resources, laneResultsByResource, rowPadding, laneHeight]);

  // Body-as-scroll-authority: we drive the other two quadrants from its scroll event.
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

  // Listen for drag-end events from the ancestor DndContext. We use `useDndMonitor`
  // (not an owned DndContext) so consumers can keep draggables outside this component.
  useDndMonitor({
    onDragEnd: (event) => {
      if (loading) return;
      const overId = event.over?.id;
      if (typeof overId !== 'string') return;
      const parsed = parseDropId(overId);
      if (!parsed) return;
      // Only claim drops whose resourceId is in OUR resources list. Lets multiple
      // ResourceTimelines coexist inside one DndContext without cross-firing.
      if (!resources.some((r) => r.id === parsed.resourceId)) return;
      onExternalDrop?.(event.active.data.current, parsed.resourceId, parsed.date);
    },
  });

  const rootClassName = loading ? 'rtb-root rtb-root--loading' : 'rtb-root';
  const resolvedHeight = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={rootClassName}
      role="grid"
      aria-label={ariaLabel}
      aria-rowcount={resources.length + 1}
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
          resources={resources}
          rowHeights={rowHeights}
          renderResource={renderResource}
        />
      </div>

      <div
        ref={bodyScrollRef}
        className="rtb-body-container"
        style={{ overflow: 'auto' }}
        onScroll={handleBodyScroll}
      >
        <Body<TEvent, TResource>
          resources={resources}
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

// React.memo erases the generic parameters; the cast restores them so consumers get
// typed `renderEvent={(e) => e.customField}` autocomplete from their TEvent.
export const ResourceTimeline = React.memo(ResourceTimelineImpl) as typeof ResourceTimelineImpl;
