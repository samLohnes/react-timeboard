import * as React from 'react';
import { Cell, EventBlock } from '../atoms';
import type { BaseEvent } from '../types';

export interface ResourceRowProps<TEvent extends BaseEvent> {
  resourceId: string;
  rowIndex: number;
  columns: Date[];
  columnWidth: number;
  laneHeight: number;
  rowPadding: number;
  /** Horizontal inset per side. Applied in JS math, not as CSS margin. */
  eventMarginX: number;
  /** Events belonging to this resource only. */
  events: TEvent[];
  eventLanes: Map<string, number>;
  eventSpans: Map<string, { startColumn: number; endColumn: number }>;
  renderEvent?: (event: TEvent) => React.ReactNode;
  onEventClick?: (event: TEvent, e: React.MouseEvent) => void;
  onCellClick?: (resourceId: string, date: Date) => void;
  /** Per-cell data-* attributes injected by the drop layer (Task 7). */
  cellDataAttributesByColumnIndex?: Map<number, Record<string, string>>;
}

/** Minimal default renderer. Consumers override via `renderEvent`. */
export function DefaultEventContent<TEvent extends BaseEvent>({ event }: { event: TEvent }) {
  return <span className="rtb-event__default-text">{event.id}</span>;
}

function ResourceRowImpl<TEvent extends BaseEvent>({
  resourceId,
  rowIndex,
  columns,
  columnWidth,
  laneHeight,
  rowPadding,
  eventMarginX,
  events,
  eventLanes,
  eventSpans,
  renderEvent,
  onEventClick,
  onCellClick,
  cellDataAttributesByColumnIndex,
}: ResourceRowProps<TEvent>) {
  return (
    <div className="rtb-resource-row" role="row" style={{ position: 'relative' }}>
      <div
        className="rtb-cells-layer"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns.length}, ${columnWidth}px)`,
        }}
      >
        {columns.map((date, colIndex) => (
          <Cell
            key={date.toISOString()}
            resourceId={resourceId}
            date={date}
            columnIndex={colIndex}
            rowIndex={rowIndex}
            isAlternateColumn={colIndex % 2 === 1}
            onClick={onCellClick ? () => onCellClick(resourceId, date) : undefined}
            dataAttributes={cellDataAttributesByColumnIndex?.get(colIndex)}
          />
        ))}
      </div>

      <div
        className="rtb-events-layer"
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        {events.map((event) => {
          const span = eventSpans.get(event.id);
          const lane = eventLanes.get(event.id);
          if (span === undefined || lane === undefined) return null;
          const left = span.startColumn * columnWidth + eventMarginX;
          const width = Math.max(
            0,
            (span.endColumn - span.startColumn) * columnWidth - 2 * eventMarginX,
          );
          const top = rowPadding + lane * laneHeight;
          const height = laneHeight;
          const handleClick = onEventClick ? (e: React.MouseEvent) => onEventClick(event, e) : undefined;
          return (
            <EventBlock
              key={event.id}
              eventId={event.id}
              style={{
                position: 'absolute',
                left,
                top,
                width,
                height,
                pointerEvents: 'auto',
              }}
              onClick={handleClick}
              ariaLabel={event.id}
            >
              {renderEvent ? renderEvent(event) : <DefaultEventContent event={event} />}
            </EventBlock>
          );
        })}
      </div>
    </div>
  );
}

export const ResourceRow = React.memo(ResourceRowImpl) as typeof ResourceRowImpl;
