import * as React from 'react';
import { ResourceRow } from './ResourceRow';
import type { BaseEvent, BaseResource } from '../types';

export interface BodyProps<TEvent extends BaseEvent, TResource extends BaseResource> {
  resources: TResource[];
  columns: Date[];
  columnWidth: number;
  /** Parallel to `resources`; pixel height per row. */
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
  resources,
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
      {resources.map((resource, i) => {
        const resourceEvents = eventsByResource.get(resource.id) ?? [];
        const laneResult = laneResultsByResource.get(resource.id) ?? EMPTY_LANE_RESULT;
        return (
          <ResourceRow<TEvent>
            key={resource.id}
            resourceId={resource.id}
            rowIndex={i}
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
