import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndContext } from '@dnd-kit/core';
import { ResourceTimeline } from './ResourceTimeline';
import type { BaseEvent, BaseResource } from './types';

function renderWithDnd(ui: React.ReactElement) {
  return render(<DndContext>{ui}</DndContext>);
}

const resources: BaseResource[] = [
  { id: 'r1', label: 'Court 1' },
  { id: 'r2', label: 'Court 2' },
];

const timeRange = { start: new Date(2024, 2, 15, 9), end: new Date(2024, 2, 15, 17) };

function makeEvents(): BaseEvent[] {
  return [
    { id: 'e1', resourceId: 'r1', start: new Date(2024, 2, 15, 10), end: new Date(2024, 2, 15, 12) },
    { id: 'e2', resourceId: 'r1', start: new Date(2024, 2, 15, 11), end: new Date(2024, 2, 15, 13) },
    { id: 'e3', resourceId: 'r2', start: new Date(2024, 2, 15, 14), end: new Date(2024, 2, 15, 16) },
  ];
}

describe('ResourceTimeline', () => {
  it('renders the root grid with ariaLabel and an aria-rowcount of resources.length + 1', () => {
    renderWithDnd(
      <ResourceTimeline
        resources={resources}
        events={[]}
        timeRange={timeRange}
        interval="hourly"
        height={400}
        ariaLabel="Court schedule"
      />,
    );
    const grid = screen.getByRole('grid', { name: 'Court schedule' });
    expect(grid.getAttribute('aria-rowcount')).toBe('3');
    expect(grid.getAttribute('aria-colcount')).toBe('9');
  });

  it('applies the height prop as a pixel string when given a number', () => {
    const { container } = renderWithDnd(
      <ResourceTimeline
        resources={resources}
        events={[]}
        timeRange={timeRange}
        interval="hourly"
        height={500}
      />,
    );
    const root = container.querySelector('.rtb-root') as HTMLElement;
    expect(root.style.height).toBe('500px');
  });

  it('passes through a string height verbatim (e.g. "80vh")', () => {
    const { container } = renderWithDnd(
      <ResourceTimeline
        resources={resources}
        events={[]}
        timeRange={timeRange}
        interval="hourly"
        height="80vh"
      />,
    );
    expect((container.querySelector('.rtb-root') as HTMLElement).style.height).toBe('80vh');
  });

  it('renders a sidebar label per resource using resource.label by default', () => {
    renderWithDnd(
      <ResourceTimeline
        resources={resources}
        events={[]}
        timeRange={timeRange}
        interval="hourly"
        height={400}
      />,
    );
    expect(screen.getByText('Court 1')).toBeTruthy();
    expect(screen.getByText('Court 2')).toBeTruthy();
  });

  it('uses renderResource when provided', () => {
    renderWithDnd(
      <ResourceTimeline
        resources={resources}
        events={[]}
        timeRange={timeRange}
        interval="hourly"
        height={400}
        renderResource={(r) => <span>custom: {r.label}</span>}
      />,
    );
    expect(screen.getByText('custom: Court 1')).toBeTruthy();
  });

  it('renders events with lane-based positioning (overlapping events stack into separate lanes)', () => {
    renderWithDnd(
      <ResourceTimeline
        resources={resources}
        events={makeEvents()}
        timeRange={timeRange}
        interval="hourly"
        height={400}
      />,
    );
    const e1 = screen.getByLabelText('e1') as HTMLElement;
    const e2 = screen.getByLabelText('e2') as HTMLElement;
    // e1 at lane 0, e2 at lane 1 (they overlap in time).
    expect(e1.style.top).toBe('4px');
    expect(e2.style.top).toBe('32px');
  });

  it('grows the resource row to fit the tallest lane stack', () => {
    const { container } = renderWithDnd(
      <ResourceTimeline
        resources={resources}
        events={makeEvents()}
        timeRange={timeRange}
        interval="hourly"
        height={400}
      />,
    );
    // r1 has two overlapping events → laneCount 2 → 2*4 + 2*28 = 64px.
    // r2 has one event → laneCount 1 → 2*4 + 1*28 = 36px.
    const body = container.querySelector('.rtb-body') as HTMLElement;
    expect(body.style.gridTemplateRows).toBe('64px 36px');
  });

  it('uses renderEvent when provided', () => {
    renderWithDnd(
      <ResourceTimeline
        resources={resources}
        events={makeEvents()}
        timeRange={timeRange}
        interval="hourly"
        height={400}
        renderEvent={(e) => <span>evt:{e.id}</span>}
      />,
    );
    expect(screen.getByText('evt:e1')).toBeTruthy();
    expect(screen.getByText('evt:e3')).toBeTruthy();
  });

  it('fires onEventClick with the typed event object', async () => {
    const onEventClick = vi.fn();
    renderWithDnd(
      <ResourceTimeline
        resources={resources}
        events={makeEvents()}
        timeRange={timeRange}
        interval="hourly"
        height={400}
        onEventClick={onEventClick}
      />,
    );
    await userEvent.click(screen.getByLabelText('e1'));
    expect(onEventClick).toHaveBeenCalledTimes(1);
    expect(onEventClick.mock.calls[0]![0].id).toBe('e1');
  });

  it('fires onCellClick with resourceId and date', async () => {
    const onCellClick = vi.fn();
    renderWithDnd(
      <ResourceTimeline
        resources={resources}
        events={[]}
        timeRange={timeRange}
        interval="hourly"
        height={400}
        onCellClick={onCellClick}
      />,
    );
    const cells = screen.getAllByRole('gridcell');
    await userEvent.click(cells[0]!);
    expect(onCellClick).toHaveBeenCalledTimes(1);
    expect(onCellClick.mock.calls[0]![0]).toBe('r1');
    expect(onCellClick.mock.calls[0]![1]).toEqual(new Date(2024, 2, 15, 9));
  });

  it('renders a spinner overlay and applies the loading class when loading={true}', () => {
    const { container } = renderWithDnd(
      <ResourceTimeline
        resources={resources}
        events={[]}
        timeRange={timeRange}
        interval="hourly"
        height={400}
        loading
      />,
    );
    expect(container.querySelector('.rtb-root--loading')).not.toBeNull();
    expect(container.querySelector('.rtb-loading-overlay')).not.toBeNull();
  });

  it('does not render a spinner overlay by default', () => {
    const { container } = renderWithDnd(
      <ResourceTimeline
        resources={resources}
        events={[]}
        timeRange={timeRange}
        interval="hourly"
        height={400}
      />,
    );
    expect(container.querySelector('.rtb-loading-overlay')).toBeNull();
  });

  it('mirrors body scrollLeft to the time axis container on scroll', () => {
    const { container } = renderWithDnd(
      <ResourceTimeline
        resources={resources}
        events={[]}
        timeRange={timeRange}
        interval="hourly"
        height={400}
      />,
    );
    const body = container.querySelector('.rtb-body-container') as HTMLDivElement;
    const timeAxis = container.querySelector('.rtb-time-axis-container') as HTMLDivElement;
    const sidebar = container.querySelector('.rtb-sidebar-container') as HTMLDivElement;

    body.scrollLeft = 120;
    body.scrollTop = 60;
    body.dispatchEvent(new Event('scroll', { bubbles: true }));

    expect(timeAxis.scrollLeft).toBe(120);
    expect(sidebar.scrollTop).toBe(60);
  });
});
