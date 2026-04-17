import type { IntervalMode } from '../types';

interface TimeRange {
  start: Date;
  end: Date;
}

const ONE_HOUR_MS = 3_600_000;

/**
 * Advances a date by one interval unit.
 *
 * - hourly: advances by 3600 seconds of real elapsed time. A DST fall-back day yields
 *   25 hourly steps from midnight-to-midnight (1am repeats); a spring-forward day yields 23.
 * - daily / weekly: advances by calendar days, snapping to local midnight. Correct across
 *   DST since the calendar-day count is unchanged even when the underlying day is 23 or 25 hours.
 */
function stepForward(d: Date, interval: IntervalMode): Date {
  switch (interval) {
    case 'hourly':
      return new Date(d.getTime() + ONE_HOUR_MS);
    case 'daily':
      return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
    case 'weekly':
      return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7);
  }
}

/**
 * Returns the local-midnight of the given date.
 */
function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Returns the Monday on or before the given date, at local midnight.
 *
 * ISO week convention: weeks start Monday. Sunday resolves to the Monday
 * six days earlier, not the following day.
 */
function mondayOnOrBefore(d: Date): Date {
  const dow = d.getDay();
  const daysBack = (dow + 6) % 7;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - daysBack);
}

/**
 * Returns the start-of-column date for the first column at the given interval.
 */
function firstColumnStart(rangeStart: Date, interval: IntervalMode): Date {
  switch (interval) {
    case 'hourly':
      return new Date(
        rangeStart.getFullYear(),
        rangeStart.getMonth(),
        rangeStart.getDate(),
        rangeStart.getHours(),
      );
    case 'daily':
      return startOfLocalDay(rangeStart);
    case 'weekly':
      return mondayOnOrBefore(rangeStart);
  }
}

/**
 * Returns an array of Date objects representing the start of each column in
 * the given time range at the given interval.
 *
 * - `hourly`: steps by 1 hour (calendar-based; DST days produce 23 or 25 columns).
 * - `daily`: steps by 1 day at local midnight; the first column snaps back to the local-midnight of `timeRange.start`.
 * - `weekly`: steps by 1 week; the first column snaps back to the Monday on or before `timeRange.start`.
 *
 * Columns whose start is `>= timeRange.end` are excluded. If `end <= start`,
 * returns an empty array.
 */
export function generateColumns(timeRange: TimeRange, interval: IntervalMode): Date[] {
  if (timeRange.end.getTime() <= timeRange.start.getTime()) {
    return [];
  }
  const columns: Date[] = [];
  const endMs = timeRange.end.getTime();
  let cursor = firstColumnStart(timeRange.start, interval);
  while (cursor.getTime() < endMs) {
    columns.push(cursor);
    cursor = stepForward(cursor, interval);
  }
  return columns;
}

/**
 * Returns the 0-based column index for a given date.
 *
 * - If `columns[i].start <= date < columns[i+1].start`, returns `i`.
 * - Returns `-1` if the date is before `columns[0].start` or `>= timeRange.end`.
 *
 * Weekly-mode note: `columns[0].start` can be earlier than `timeRange.start`
 * (the Monday snap). A date between that Monday and `timeRange.start` still
 * resolves to column 0, preserving the round-trip invariant
 * `getColumnForDate(getDateForColumn(i)) === i`.
 */
export function getColumnForDate(
  date: Date,
  timeRange: TimeRange,
  interval: IntervalMode,
): number {
  if (date.getTime() >= timeRange.end.getTime()) {
    return -1;
  }
  const columns = generateColumns(timeRange, interval);
  if (columns.length === 0) {
    return -1;
  }
  const first = columns[0]!;
  if (date.getTime() < first.getTime()) {
    return -1;
  }
  // Linear scan. O(n) in column count; simple and correct across DST.
  for (let i = columns.length - 1; i >= 0; i -= 1) {
    if (date.getTime() >= columns[i]!.getTime()) {
      return i;
    }
  }
  return -1;
}

/**
 * Returns the start-of-column date for the given column index.
 *
 * Inverse of `getColumnForDate` for column starts (not arbitrary dates within a column).
 * Returns the column's start at the given index; behavior is undefined for
 * out-of-range indices (caller is expected to guard).
 */
export function getDateForColumn(
  columnIndex: number,
  timeRange: TimeRange,
  interval: IntervalMode,
): Date {
  let cursor = firstColumnStart(timeRange.start, interval);
  for (let i = 0; i < columnIndex; i += 1) {
    cursor = stepForward(cursor, interval);
  }
  return cursor;
}

/**
 * Returns the default human-readable label for a column's date.
 *
 * - `hourly`: `"12 PM"`, `"1 PM"`, `"12 AM"` (12-hour, no minutes).
 * - `daily`: `"Mon 3/16"` (short weekday + M/D, no comma).
 * - `weekly`: `"Week of 3/16"` (M/D of the Monday).
 *
 * en-US formatting only in v1.
 */
export function formatColumnLabel(date: Date, interval: IntervalMode): string {
  switch (interval) {
    case 'hourly':
      return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
    case 'daily': {
      const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `${weekday} ${month}/${day}`;
    }
    case 'weekly': {
      const month = date.getMonth() + 1;
      const day = date.getDate();
      return `Week of ${month}/${day}`;
    }
  }
}

/**
 * Formats a Date for use in a drop target ID. Always uses `toISOString()`.
 *
 * Round-trippable: `new Date(formatDropIdDate(d)).getTime() === d.getTime()`.
 */
export function formatDropIdDate(date: Date): string {
  return date.toISOString();
}
