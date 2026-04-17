import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ResourceRow } from './ResourceRow';
import type { BaseEvent } from '../types';

function makeColumns(count: number): Date[] {
  const base = new Date(2024, 2, 15, 12).getTime();
  return Array.from({ length: count }, (_, i) => new Date(base + i * 3600_000));
}

describe('ResourceRow', () => {
  it('positions events using startColumn, lane, columnWidth, laneHeight, rowPadding, and eventMarginX', () => {
    const columns = makeColumns(6);
    const events: BaseEvent[] = [
      { id: 'e1', resourceId: 'r1', start: columns[1]!, end: columns[3]! },
    ];
    const eventLanes = new Map([['e1', 1]]);
    const eventSpans = new Map([['e1', { startColumn: 1, endColumn: 3 }]]);

    render(
      <ResourceRow
        resourceId="r1"
        rowIndex={0}
        columns={columns}
        columnWidth={80}
        laneHeight={28}
        rowPadding={4}
        eventMarginX={2}
        events={events}
        eventLanes={eventLanes}
        eventSpans={eventSpans}
      />,
    );

    const eventEl = screen.getByLabelText('e1');
    // left = 1 * 80 + 2 = 82
    expect(eventEl.style.left).toBe('82px');
    // width = (3 - 1) * 80 - 2 * 2 = 156
    expect(eventEl.style.width).toBe('156px');
    // top = 4 + 1 * 28 = 32
    expect(eventEl.style.top).toBe('32px');
    expect(eventEl.style.height).toBe('28px');
    expect(eventEl.style.pointerEvents).toBe('auto');
  });

  it('clamps width to 0 when eventMarginX exceeds half the column span', () => {
    const columns = makeColumns(6);
    const events: BaseEvent[] = [
      { id: 'e1', resourceId: 'r1', start: columns[0]!, end: columns[1]! },
    ];
    render(
      <ResourceRow
        resourceId="r1"
        rowIndex={0}
        columns={columns}
        columnWidth={10}
        laneHeight={28}
        rowPadding={4}
        eventMarginX={100}
        events={events}
        eventLanes={new Map([['e1', 0]])}
        eventSpans={new Map([['e1', { startColumn: 0, endColumn: 1 }]])}
      />,
    );
    expect(screen.getByLabelText('e1').style.width).toBe('0px');
  });

  it('renders a Cell per column with the correct alternating class for odd columns', () => {
    const columns = makeColumns(4);
    render(
      <ResourceRow
        resourceId="r1"
        rowIndex={0}
        columns={columns}
        columnWidth={80}
        laneHeight={28}
        rowPadding={4}
        eventMarginX={2}
        events={[]}
        eventLanes={new Map()}
        eventSpans={new Map()}
      />,
    );
    const cells = screen.getAllByRole('gridcell');
    expect(cells).toHaveLength(4);
    expect(cells[0]!.className).toBe('rtb-cell');
    expect(cells[1]!.className).toBe('rtb-cell rtb-cell--alt');
  });

  it('invokes onCellClick with resourceId and date when a cell is clicked', async () => {
    const columns = makeColumns(3);
    const onCellClick = vi.fn();
    render(
      <ResourceRow
        resourceId="r1"
        rowIndex={0}
        columns={columns}
        columnWidth={80}
        laneHeight={28}
        rowPadding={4}
        eventMarginX={2}
        events={[]}
        eventLanes={new Map()}
        eventSpans={new Map()}
        onCellClick={onCellClick}
      />,
    );
    const cells = screen.getAllByRole('gridcell');
    await userEvent.click(cells[1]!);
    expect(onCellClick).toHaveBeenCalledWith('r1', columns[1]);
  });

  it('skips events missing from eventLanes or eventSpans', () => {
    const columns = makeColumns(3);
    const events: BaseEvent[] = [
      { id: 'e1', resourceId: 'r1', start: columns[0]!, end: columns[1]! },
      { id: 'e2', resourceId: 'r1', start: columns[1]!, end: columns[2]! },
    ];
    render(
      <ResourceRow
        resourceId="r1"
        rowIndex={0}
        columns={columns}
        columnWidth={80}
        laneHeight={28}
        rowPadding={4}
        eventMarginX={2}
        events={events}
        eventLanes={new Map([['e1', 0]])}
        eventSpans={new Map([['e1', { startColumn: 0, endColumn: 1 }]])}
      />,
    );
    expect(screen.queryByLabelText('e1')).not.toBeNull();
    expect(screen.queryByLabelText('e2')).toBeNull();
  });

  it('forwards injected data-* attributes from cellDataAttributesByColumnIndex', () => {
    const columns = makeColumns(3);
    const cellAttrs = new Map<number, Record<string, string>>([[1, { 'data-over': 'true' }]]);
    render(
      <ResourceRow
        resourceId="r1"
        rowIndex={0}
        columns={columns}
        columnWidth={80}
        laneHeight={28}
        rowPadding={4}
        eventMarginX={2}
        events={[]}
        eventLanes={new Map()}
        eventSpans={new Map()}
        cellDataAttributesByColumnIndex={cellAttrs}
      />,
    );
    const cells = screen.getAllByRole('gridcell');
    expect(cells[0]!.getAttribute('data-over')).toBeNull();
    expect(cells[1]!.getAttribute('data-over')).toBe('true');
  });
});
