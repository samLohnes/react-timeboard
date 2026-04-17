import * as React from 'react';
import { ResourceRow } from './ResourceRow';
import type { RowPlanItem } from '../lib/grouping';
import type { BaseEvent, BaseResource } from '../types';

export interface BodyProps<TEvent extends BaseEvent, TResource extends BaseResource> {
  rows: RowPlanItem<TResource>[];
  columns: Date[];
  columnWidth: number;
  /** Parallel to `rows`; pixel height per row. */
  rowHeights: number[];
  laneHeight: number;
  rowPadding: number;
  eventMarginX: number;
  /** Pre-grouped: events keyed by resource.id. */
  eventsByResource: Map<string, TEvent[]>;
  /** Pre-computed lane assignments per resource. */
  laneResultsByResource: Map<
    string,
    {
      eventLanes: Map<string, number>;
      eventSpans: Map<string, { startColumn: number; endColumn: number }>;
    }
  >;
  renderEvent?: (event: TEvent) => React.ReactNode;
  onEventClick?: (event: TEvent, e: React.MouseEvent) => void;
  onCellClick?: (resourceId: string, date: Date) => void;
}

const EMPTY_LANE_RESULT = {
  eventLanes: new Map<string, number>(),
  eventSpans: new Map<string, { startColumn: number; endColumn: number }>(),
};

function BodyImpl<TEvent extends BaseEvent, TResource extends BaseResource>({
  rows,
  columns,
  columnWidth,
  rowHeights,
  laneHeight,
  rowPadding,
  eventMarginX,
  eventsByResource,
  laneResultsByResource,
  renderEvent,
  onEventClick,
  onCellClick,
}: BodyProps<TEvent, TResource>) {
  return (
    <div
      className="rtb-body"
      role="rowgroup"
      style={{
        display: 'grid',
        gridTemplateRows: rowHeights.map((h) => `${h}px`).join(' '),
        gridTemplateColumns: `${columns.length * columnWidth}px`,
      }}
    >
      {rows.map((row) => {
        if (row.kind === 'group-header') {
          // Body-side group header row is a visual spacer — no cells, no drop targets.
          return (
            <div
              key={`group-body-${row.group.id}`}
              className="rtb-group-header-body"
              role="presentation"
              aria-hidden="true"
            />
          );
        }
        const resourceEvents = eventsByResource.get(row.resource.id) ?? [];
        const laneResult = laneResultsByResource.get(row.resource.id) ?? EMPTY_LANE_RESULT;
        return (
          <ResourceRow<TEvent>
            key={row.resource.id}
            resourceId={row.resource.id}
            rowIndex={row.rowIndex}
            columns={columns}
            columnWidth={columnWidth}
            laneHeight={laneHeight}
            rowPadding={rowPadding}
            eventMarginX={eventMarginX}
            events={resourceEvents}
            eventLanes={laneResult.eventLanes}
            eventSpans={laneResult.eventSpans}
            renderEvent={renderEvent}
            onEventClick={onEventClick}
            onCellClick={onCellClick}
          />
        );
      })}
    </div>
  );
}

export const Body = React.memo(BodyImpl) as typeof BodyImpl;
