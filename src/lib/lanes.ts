import type { BaseEvent, IntervalMode } from '../types';
import { generateColumns, getColumnForDate } from './time';

export interface LaneAssignmentResult {
  /** Map of event.id to its assigned 0-based lane index. */
  eventLanes: Map<string, number>;
  /** Total number of lanes used (max lane index + 1, or 0 if no events placed). */
  laneCount: number;
  /** Map of event.id to its column span; `endColumn` is exclusive. */
  eventSpans: Map<string, { startColumn: number; endColumn: number }>;
}

interface ComputedEvent {
  id: string;
  startColumn: number;
  endColumn: number;
}

/**
 * Computes the column span for a single event, clamped to the visible range.
 *
 * Returns `null` if the event falls entirely outside the range. Zero-duration
 * or reversed events collapse to a one-column span at their start.
 */
function computeEventSpan(
  event: BaseEvent,
  timeRange: { start: Date; end: Date },
  interval: IntervalMode,
  totalColumns: number,
): { startColumn: number; endColumn: number } | null {
  if (event.end.getTime() <= timeRange.start.getTime()) return null;
  if (event.start.getTime() >= timeRange.end.getTime()) return null;

  const rawStart = getColumnForDate(event.start, timeRange, interval);
  const startColumn = Math.max(0, rawStart);

  let endColumn: number;
  if (event.end.getTime() <= event.start.getTime()) {
    // Zero-duration or reversed: collapse to one column at start.
    endColumn = startColumn + 1;
  } else {
    // Last column the event touches is derived from `end - 1ms` so an event
    // whose end falls exactly on a column boundary does not spill into that column.
    const lastTouched = getColumnForDate(
      new Date(event.end.getTime() - 1),
      timeRange,
      interval,
    );
    endColumn = lastTouched < 0 ? totalColumns : lastTouched + 1;
  }
  endColumn = Math.min(totalColumns, endColumn);
  if (endColumn <= startColumn) endColumn = startColumn + 1;
  return { startColumn, endColumn };
}

/**
 * Assigns each event in a single resource's event list to a horizontal lane such
 * that no two events with overlapping column spans share a lane.
 *
 * Uses greedy first-fit: events are sorted by `startColumn`, then `endColumn`,
 * and each is placed in the lowest-indexed lane whose last-placed event ends
 * at or before this event's start column. Deterministic for the same input.
 *
 * Events whose column span falls entirely outside `timeRange` are omitted from
 * both `eventLanes` and `eventSpans`.
 */
export function assignLanes<TEvent extends BaseEvent>(
  events: TEvent[],
  timeRange: { start: Date; end: Date },
  interval: IntervalMode,
): LaneAssignmentResult {
  const eventLanes = new Map<string, number>();
  const eventSpans = new Map<string, { startColumn: number; endColumn: number }>();

  const totalColumns = generateColumns(timeRange, interval).length;
  if (totalColumns === 0 || events.length === 0) {
    return { eventLanes, laneCount: 0, eventSpans };
  }

  const computed: ComputedEvent[] = [];
  for (const event of events) {
    const span = computeEventSpan(event, timeRange, interval, totalColumns);
    if (!span) continue;
    computed.push({ id: event.id, ...span });
    eventSpans.set(event.id, span);
  }

  computed.sort((a, b) => {
    if (a.startColumn !== b.startColumn) return a.startColumn - b.startColumn;
    if (a.endColumn !== b.endColumn) return a.endColumn - b.endColumn;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });

  // laneEnds[i] = exclusive endColumn of the last event placed in lane i.
  const laneEnds: number[] = [];
  for (const e of computed) {
    let placed = false;
    for (let i = 0; i < laneEnds.length; i += 1) {
      if (laneEnds[i]! <= e.startColumn) {
        laneEnds[i] = e.endColumn;
        eventLanes.set(e.id, i);
        placed = true;
        break;
      }
    }
    if (!placed) {
      eventLanes.set(e.id, laneEnds.length);
      laneEnds.push(e.endColumn);
    }
  }

  return { eventLanes, laneCount: laneEnds.length, eventSpans };
}
