const SEPARATOR = '___';

/**
 * Formats a droppable ID for a cell. The triple-underscore separator is
 * deliberately distinctive so consumer resource IDs are extremely unlikely
 * to collide.
 */
export function formatDropId(resourceId: string, date: Date): string {
  return `${resourceId}${SEPARATOR}${date.toISOString()}`;
}

/**
 * Parses a droppable ID back into its resource ID and date. Returns `null`
 * for any string that doesn't contain the separator or whose date portion
 * is unparseable.
 *
 * If the resource ID itself contains the separator (unsupported but possible
 * via a custom id format), the FIRST occurrence wins — behavior stays
 * deterministic even in that edge case.
 */
export function parseDropId(dropId: string): { resourceId: string; date: Date } | null {
  const idx = dropId.indexOf(SEPARATOR);
  if (idx === -1) return null;
  const resourceId = dropId.slice(0, idx);
  const isoString = dropId.slice(idx + SEPARATOR.length);
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return null;
  return { resourceId, date };
}
