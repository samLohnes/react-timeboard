import { describe, it, expect } from 'vitest';
import { formatDropId, parseDropId } from './dropId';

describe('formatDropId', () => {
  it('joins resourceId and ISO date with the triple-underscore separator', () => {
    expect(formatDropId('game-001', new Date('2024-03-15T12:00:00Z'))).toBe(
      'game-001___2024-03-15T12:00:00.000Z',
    );
  });

  it('handles resource IDs with spaces, hyphens, and single underscores', () => {
    const d = new Date('2024-03-15T12:00:00Z');
    expect(formatDropId('team alpha_1', d)).toBe('team alpha_1___2024-03-15T12:00:00.000Z');
  });
});

describe('parseDropId', () => {
  it('parses a normal dropId back into resourceId and date', () => {
    const result = parseDropId('game-001___2024-03-15T12:00:00.000Z');
    expect(result).not.toBeNull();
    expect(result!.resourceId).toBe('game-001');
    expect(result!.date.getTime()).toBe(new Date('2024-03-15T12:00:00Z').getTime());
  });

  it('returns null when the separator is absent', () => {
    expect(parseDropId('no-separator-here')).toBeNull();
  });

  it('returns null when the date portion is unparseable', () => {
    expect(parseDropId('game-001___not-a-date')).toBeNull();
  });

  it('splits on the FIRST occurrence deterministically', () => {
    // If a resource id contained ___, the first-occurrence split means the remainder
    // is "id___<iso>" which is not a parseable date, so we return null. That's fine
    // — `useTimeboardDraggable` guards against '___' in ids at construction.
    expect(parseDropId('weird___id___2024-03-15T12:00:00.000Z')).toBeNull();
  });
});

describe('round-trip: parseDropId(formatDropId(...)) === original', () => {
  const cases: Array<{ id: string; date: Date }> = [
    { id: 'simple', date: new Date('2024-03-15T12:00:00Z') },
    { id: 'with-hyphen', date: new Date('2024-11-03T08:30:00Z') },
    { id: 'with_underscore', date: new Date('2024-06-15T00:00:00Z') },
    { id: 'with space', date: new Date('2024-01-01T23:59:59Z') },
  ];
  for (const { id, date } of cases) {
    it(`round-trips "${id}"`, () => {
      const result = parseDropId(formatDropId(id, date));
      expect(result).not.toBeNull();
      expect(result!.resourceId).toBe(id);
      expect(result!.date.getTime()).toBe(date.getTime());
    });
  }
});
