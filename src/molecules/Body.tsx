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
  /** Drop-layer cell attributes keyed `${resourceId}___${columnIndex}`. */
  cellDataAttributesByCell?: Map<string, Record<string, string>>;
}

const EMPTY_LANE_RESULT = {
  eventLanes: new Map<string, number>(),
  eventSpans: new Map<string, { startColumn: number; endColumn: number }>(),
};

/**
 * Builds the per-row cell-attribute map by stripping the resourceId prefix from the
 * global key. Returns `undefined` if no attrs apply to this row — keeps the molecule
 * from allocating empty Maps on every render of a row with no hover state.
 */
function buildRowCellAttrs(
  resourceId: string,
  columnCount: number,
  all: Map<string, Record<string, string>> | undefined,
): Map<number, Record<string, string>> | undefined {
  if (!all) return undefined;
  const out = new Map<number, Record<string, string>>();
  for (let i = 0; i < columnCount; i += 1) {
    const attrs = all.get(`${resourceId}___${i}`);
    if (attrs) out.set(i, attrs);
  }
  return out.size > 0 ? out : undefined;
}

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
  cellDataAttributesByCell,
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
        const cellAttrsForRow = buildRowCellAttrs(
          resource.id,
          columns.length,
          cellDataAttributesByCell,
        );
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
            cellDataAttributesByColumnIndex={cellAttrsForRow}
          />
        );
      })}
    </div>
  );
}

export const Body = React.memo(BodyImpl) as typeof BodyImpl;
