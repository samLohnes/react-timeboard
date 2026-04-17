import { describe, it, expect } from 'vitest';
import { assignLanes } from './lanes';
import type { BaseEvent } from '../types';

const RANGE = { start: new Date(2024, 2, 15, 12), end: new Date(2024, 2, 16, 0) };
const INTERVAL = 'hourly' as const;

function ev(id: string, startHour: number, endHour: number): BaseEvent {
  return {
    id,
    resourceId: 'r1',
    start: new Date(2024, 2, 15, startHour),
    end: new Date(2024, 2, 15, endHour),
  };
}

function evMinutes(id: string, startH: number, startM: number, endH: number, endM: number): BaseEvent {
  return {
    id,
    resourceId: 'r1',
    start: new Date(2024, 2, 15, startH, startM),
    end: new Date(2024, 2, 15, endH, endM),
  };
}

describe('assignLanes', () => {
  it('returns an empty result for empty input', () => {
    const result = assignLanes([], RANGE, INTERVAL);
    expect(result.eventLanes.size).toBe(0);
    expect(result.eventSpans.size).toBe(0);
    expect(result.laneCount).toBe(0);
  });

  it('places a single event in lane 0', () => {
    const result = assignLanes([ev('a', 13, 14)], RANGE, INTERVAL);
    expect(result.eventLanes.get('a')).toBe(0);
    expect(result.laneCount).toBe(1);
    expect(result.eventSpans.get('a')).toEqual({ startColumn: 1, endColumn: 2 });
  });

  it('keeps two sequentially touching events in lane 0', () => {
    const result = assignLanes([ev('a', 13, 14), ev('b', 14, 15)], RANGE, INTERVAL);
    expect(result.eventLanes.get('a')).toBe(0);
    expect(result.eventLanes.get('b')).toBe(0);
    expect(result.laneCount).toBe(1);
  });

  it('splits two overlapping events across lanes 0 and 1', () => {
    const result = assignLanes([ev('a', 13, 15), ev('b', 14, 16)], RANGE, INTERVAL);
    expect(result.eventLanes.get('a')).toBe(0);
    expect(result.eventLanes.get('b')).toBe(1);
    expect(result.laneCount).toBe(2);
  });

  it('places three mutually overlapping events in lanes 0, 1, 2', () => {
    const result = assignLanes(
      [ev('a', 13, 16), ev('b', 14, 17), ev('c', 15, 18)],
      RANGE,
      INTERVAL,
    );
    expect(result.eventLanes.get('a')).toBe(0);
    expect(result.eventLanes.get('b')).toBe(1);
    expect(result.eventLanes.get('c')).toBe(2);
    expect(result.laneCount).toBe(3);
  });

  it('reuses lane 0 for a later non-overlapping event (gap-fill)', () => {
    // a: 1pm-2pm (cols 1-2) → lane 0
    // b: 1:30pm-2:30pm (cols 1-3) → lane 1
    // c: 3pm-4pm (cols 3-4) → can slot into lane 0 (ends at col 2, c starts at col 3)
    const result = assignLanes(
      [ev('a', 13, 14), evMinutes('b', 13, 30, 14, 30), ev('c', 15, 16)],
      RANGE,
      INTERVAL,
    );
    expect(result.eventLanes.get('a')).toBe(0);
    expect(result.eventLanes.get('b')).toBe(1);
    expect(result.eventLanes.get('c')).toBe(0);
    expect(result.laneCount).toBe(2);
  });

  it('treats a zero-duration event as a one-column span', () => {
    const result = assignLanes([ev('a', 14, 14)], RANGE, INTERVAL);
    expect(result.eventSpans.get('a')).toEqual({ startColumn: 2, endColumn: 3 });
    expect(result.laneCount).toBe(1);
  });

  it('treats a reversed end<start event as a one-column span', () => {
    const result = assignLanes([ev('a', 15, 14)], RANGE, INTERVAL);
    expect(result.eventSpans.get('a')).toEqual({ startColumn: 3, endColumn: 4 });
  });

  it('skips an event entirely before the range', () => {
    const result = assignLanes(
      [{ id: 'x', resourceId: 'r1', start: new Date(2024, 2, 15, 8), end: new Date(2024, 2, 15, 10) }],
      RANGE,
      INTERVAL,
    );
    expect(result.eventLanes.size).toBe(0);
    expect(result.eventSpans.size).toBe(0);
  });

  it('skips an event entirely after the range', () => {
    const result = assignLanes(
      [{ id: 'x', resourceId: 'r1', start: new Date(2024, 2, 16, 1), end: new Date(2024, 2, 16, 3) }],
      RANGE,
      INTERVAL,
    );
    expect(result.eventLanes.size).toBe(0);
  });

  it('clamps an event straddling the range start', () => {
    // 10am-2pm → range starts at 12pm. Clamped to cols [0, 2).
    const result = assignLanes(
      [{ id: 'x', resourceId: 'r1', start: new Date(2024, 2, 15, 10), end: new Date(2024, 2, 15, 14) }],
      RANGE,
      INTERVAL,
    );
    expect(result.eventSpans.get('x')).toEqual({ startColumn: 0, endColumn: 2 });
  });

  it('clamps an event straddling the range end', () => {
    // 11pm-2am next day → range ends at midnight. Clamped to cols [11, 12).
    const result = assignLanes(
      [{ id: 'x', resourceId: 'r1', start: new Date(2024, 2, 15, 23), end: new Date(2024, 2, 16, 2) }],
      RANGE,
      INTERVAL,
    );
    expect(result.eventSpans.get('x')).toEqual({ startColumn: 11, endColumn: 12 });
  });

  it('produces identical output regardless of input order', () => {
    const events = [ev('a', 13, 15), ev('b', 14, 16), ev('c', 15, 17)];
    const resultA = assignLanes(events, RANGE, INTERVAL);
    const resultB = assignLanes([events[2]!, events[0]!, events[1]!], RANGE, INTERVAL);
    expect(Array.from(resultA.eventLanes.entries()).sort()).toEqual(
      Array.from(resultB.eventLanes.entries()).sort(),
    );
    expect(resultA.laneCount).toBe(resultB.laneCount);
  });

  it('packs three sequential non-overlapping events into a single lane', () => {
    const result = assignLanes(
      [ev('a', 13, 14), ev('b', 14, 15), ev('c', 15, 16)],
      RANGE,
      INTERVAL,
    );
    expect(result.eventLanes.get('a')).toBe(0);
    expect(result.eventLanes.get('b')).toBe(0);
    expect(result.eventLanes.get('c')).toBe(0);
    expect(result.laneCount).toBe(1);
  });
});
