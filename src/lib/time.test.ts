import { describe, it, expect } from 'vitest';
import {
  generateColumns,
  getColumnForDate,
  getDateForColumn,
  formatColumnLabel,
  formatDropIdDate,
} from './time';

describe('generateColumns — hourly', () => {
  it('produces exactly 12 columns for a noon-to-midnight range', () => {
    const cols = generateColumns(
      { start: new Date(2024, 2, 15, 12), end: new Date(2024, 2, 16, 0) },
      'hourly',
    );
    expect(cols).toHaveLength(12);
    expect(cols[0]).toEqual(new Date(2024, 2, 15, 12));
    expect(cols[11]).toEqual(new Date(2024, 2, 15, 23));
  });

  it('produces exactly 1 column for a one-hour range', () => {
    const cols = generateColumns(
      { start: new Date(2024, 2, 15, 9), end: new Date(2024, 2, 15, 10) },
      'hourly',
    );
    expect(cols).toHaveLength(1);
  });

  it('produces an empty array for a zero-duration range', () => {
    const cols = generateColumns(
      { start: new Date(2024, 2, 15, 9), end: new Date(2024, 2, 15, 9) },
      'hourly',
    );
    expect(cols).toHaveLength(0);
  });

  it('produces an empty array for a negative-duration range', () => {
    const cols = generateColumns(
      { start: new Date(2024, 2, 15, 10), end: new Date(2024, 2, 15, 9) },
      'hourly',
    );
    expect(cols).toHaveLength(0);
  });
});

describe('generateColumns — daily', () => {
  it('produces 3 columns at local midnight for a 3-day range', () => {
    const cols = generateColumns(
      { start: new Date(2024, 2, 15), end: new Date(2024, 2, 18) },
      'daily',
    );
    expect(cols).toHaveLength(3);
    expect(cols[0]).toEqual(new Date(2024, 2, 15));
    expect(cols[1]).toEqual(new Date(2024, 2, 16));
    expect(cols[2]).toEqual(new Date(2024, 2, 17));
  });

  it('snaps the first column to local-midnight when start is mid-day', () => {
    const cols = generateColumns(
      { start: new Date(2024, 2, 15, 14, 30), end: new Date(2024, 2, 17) },
      'daily',
    );
    expect(cols[0]).toEqual(new Date(2024, 2, 15));
  });
});

describe('generateColumns — weekly', () => {
  it('snaps the first column back to the Monday on or before start', () => {
    // Wednesday Mar 13, 2024
    const cols = generateColumns(
      { start: new Date(2024, 2, 13), end: new Date(2024, 3, 3) },
      'weekly',
    );
    // First column is Monday Mar 11
    expect(cols[0]).toEqual(new Date(2024, 2, 11));
    // Subsequent Mondays
    expect(cols[1]).toEqual(new Date(2024, 2, 18));
    expect(cols[2]).toEqual(new Date(2024, 2, 25));
  });

  it('resolves Sunday back to the previous Monday, not the next one', () => {
    // Sunday Mar 17, 2024
    const cols = generateColumns(
      { start: new Date(2024, 2, 17), end: new Date(2024, 2, 25) },
      'weekly',
    );
    expect(cols[0]).toEqual(new Date(2024, 2, 11));
  });
});

describe('generateColumns — DST (TZ=America/Los_Angeles)', () => {
  // Spring-forward day in LA is 2024-03-10: clocks jump from 1:59am PST to 3am PDT,
  // so midnight-to-midnight that day is only 23 actual hours.
  it('produces 23 columns for the spring-forward day (midnight-to-midnight)', () => {
    const cols = generateColumns(
      { start: new Date(2024, 2, 10, 0), end: new Date(2024, 2, 11, 0) },
      'hourly',
    );
    expect(cols).toHaveLength(23);
  });

  // Fall-back day in LA is 2024-11-03: clocks fall from 2am PDT back to 1am PST,
  // so midnight-to-midnight that day is 25 actual hours.
  it('produces 25 columns for the fall-back day (midnight-to-midnight)', () => {
    const cols = generateColumns(
      { start: new Date(2024, 10, 3, 0), end: new Date(2024, 10, 4, 0) },
      'hourly',
    );
    expect(cols).toHaveLength(25);
  });
});

describe('getColumnForDate', () => {
  const range = { start: new Date(2024, 2, 15, 9), end: new Date(2024, 2, 15, 17) };

  it('returns 0 for a date exactly at timeRange.start', () => {
    expect(getColumnForDate(new Date(2024, 2, 15, 9), range, 'hourly')).toBe(0);
  });

  it('returns -1 for a date exactly at timeRange.end', () => {
    expect(getColumnForDate(new Date(2024, 2, 15, 17), range, 'hourly')).toBe(-1);
  });

  it('returns the correct midpoint index', () => {
    // Range is 9am–5pm (8 hours). 1pm is hour 4.
    expect(getColumnForDate(new Date(2024, 2, 15, 13), range, 'hourly')).toBe(4);
  });

  it('returns -1 for a date before columns[0].start', () => {
    expect(getColumnForDate(new Date(2024, 2, 15, 8), range, 'hourly')).toBe(-1);
  });

  it('returns the column index when the date equals that column start', () => {
    expect(getColumnForDate(new Date(2024, 2, 15, 14), range, 'hourly')).toBe(5);
  });

  it('weekly: Monday before timeRange.start resolves to column 0, not -1', () => {
    const weeklyRange = { start: new Date(2024, 2, 13), end: new Date(2024, 2, 25) };
    expect(getColumnForDate(new Date(2024, 2, 11), weeklyRange, 'weekly')).toBe(0);
  });

  it('weekly: the Sunday before columns[0] resolves to -1', () => {
    const weeklyRange = { start: new Date(2024, 2, 13), end: new Date(2024, 2, 25) };
    expect(getColumnForDate(new Date(2024, 2, 10), weeklyRange, 'weekly')).toBe(-1);
  });
});

describe('getDateForColumn', () => {
  it('returns timeRange.start for column 0 at hourly interval', () => {
    const range = { start: new Date(2024, 2, 15, 9), end: new Date(2024, 2, 15, 17) };
    expect(getDateForColumn(0, range, 'hourly')).toEqual(new Date(2024, 2, 15, 9));
  });

  it('returns the correct date for a mid-range column (hourly)', () => {
    const range = { start: new Date(2024, 2, 15, 9), end: new Date(2024, 2, 15, 17) };
    expect(getDateForColumn(3, range, 'hourly')).toEqual(new Date(2024, 2, 15, 12));
  });

  it('returns the snapped midnight for column 0 at daily interval', () => {
    const range = { start: new Date(2024, 2, 15, 14, 30), end: new Date(2024, 2, 17) };
    expect(getDateForColumn(0, range, 'daily')).toEqual(new Date(2024, 2, 15));
  });

  it('returns the snapped Monday for column 0 at weekly interval', () => {
    const range = { start: new Date(2024, 2, 13), end: new Date(2024, 2, 25) };
    expect(getDateForColumn(0, range, 'weekly')).toEqual(new Date(2024, 2, 11));
  });
});

describe('round-trip: getColumnForDate(getDateForColumn(i)) === i', () => {
  it('holds for every column index across hourly/daily/weekly', () => {
    const cases: Array<{ range: { start: Date; end: Date }; interval: 'hourly' | 'daily' | 'weekly' }> = [
      { range: { start: new Date(2024, 2, 15, 9), end: new Date(2024, 2, 15, 17) }, interval: 'hourly' },
      { range: { start: new Date(2024, 2, 15), end: new Date(2024, 2, 22) }, interval: 'daily' },
      { range: { start: new Date(2024, 2, 13), end: new Date(2024, 3, 10) }, interval: 'weekly' },
    ];
    for (const { range, interval } of cases) {
      const cols = generateColumns(range, interval);
      for (let i = 0; i < cols.length; i += 1) {
        expect(getColumnForDate(getDateForColumn(i, range, interval), range, interval)).toBe(i);
      }
    }
  });
});

describe('formatColumnLabel', () => {
  it('formats hourly noon as "12 PM"', () => {
    expect(formatColumnLabel(new Date(2024, 2, 15, 12), 'hourly')).toBe('12 PM');
  });

  it('formats hourly 1pm as "1 PM"', () => {
    expect(formatColumnLabel(new Date(2024, 2, 15, 13), 'hourly')).toBe('1 PM');
  });

  it('formats hourly midnight as "12 AM"', () => {
    expect(formatColumnLabel(new Date(2024, 2, 15, 0), 'hourly')).toBe('12 AM');
  });

  it('formats daily as "<Weekday> M/D" with no comma', () => {
    expect(formatColumnLabel(new Date(2024, 2, 15), 'daily')).toBe('Fri 3/15');
  });

  it('formats weekly as "Week of M/D"', () => {
    expect(formatColumnLabel(new Date(2024, 2, 11), 'weekly')).toBe('Week of 3/11');
  });
});

describe('formatDropIdDate', () => {
  it('returns the ISO string of the date', () => {
    const d = new Date(2024, 2, 15, 12);
    expect(formatDropIdDate(d)).toBe(d.toISOString());
  });

  it('round-trips with new Date(...)', () => {
    const d = new Date(2024, 2, 15, 12);
    expect(new Date(formatDropIdDate(d)).getTime()).toBe(d.getTime());
  });
});
