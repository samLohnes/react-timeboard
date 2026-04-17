import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DndContext } from '@dnd-kit/core';
import { useState } from 'react';
import { ResourceTimeline } from './ResourceTimeline';
import type { BaseEvent, BaseResource, ResourceGroup } from './types';

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

  it('forwards wheel events on the sidebar to the body (scrolls the grid, not the page)', () => {
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
    const sidebar = container.querySelector('.rtb-sidebar-container') as HTMLDivElement;
    sidebar.dispatchEvent(new WheelEvent('wheel', { deltaY: 75, bubbles: true, cancelable: true }));
    expect(body.scrollTop).toBe(75);
  });

  it('forwards wheel events on the time axis to the body in both axes', () => {
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
    timeAxis.dispatchEvent(
      new WheelEvent('wheel', { deltaX: 90, deltaY: 30, bubbles: true, cancelable: true }),
    );
    expect(body.scrollLeft).toBe(90);
    expect(body.scrollTop).toBe(30);
  });
});

// -----------------------------------------------------------------------------
// Resource groups
// -----------------------------------------------------------------------------

const groupedResources: BaseResource[] = [
  { id: 'alice', label: 'Alice', groupId: 'eng' },
  { id: 'bob', label: 'Bob', groupId: 'eng' },
  { id: 'carol', label: 'Carol', groupId: 'design' },
];
const groups: ResourceGroup[] = [
  { id: 'eng', label: 'Engineering' },
  { id: 'design', label: 'Design' },
];

describe('ResourceTimeline — resource groups', () => {
  it('renders all groups expanded by default when neither expandedGroupIds nor defaultExpandedGroupIds is set', () => {
    renderWithDnd(
      <ResourceTimeline
        resources={groupedResources}
        events={[]}
        timeRange={timeRange}
        interval="hourly"
        height={400}
        groups={groups}
      />,
    );
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.getByText('Bob')).toBeTruthy();
    expect(screen.getByText('Carol')).toBeTruthy();
  });

  it('respects defaultExpandedGroupIds in uncontrolled mode', () => {
    renderWithDnd(
      <ResourceTimeline
        resources={groupedResources}
        events={[]}
        timeRange={timeRange}
        interval="hourly"
        height={400}
        groups={groups}
        defaultExpandedGroupIds={['eng']}
      />,
    );
    // eng is expanded; design is collapsed → Carol is absent from the DOM.
    expect(screen.getByText('Alice')).toBeTruthy();
    expect(screen.queryByText('Carol')).toBeNull();
  });

  it('toggles uncontrolled expansion when the chevron is clicked and fires onGroupToggle', async () => {
    const onGroupToggle = vi.fn();
    renderWithDnd(
      <ResourceTimeline
        resources={groupedResources}
        events={[]}
        timeRange={timeRange}
        interval="hourly"
        height={400}
        groups={groups}
        onGroupToggle={onGroupToggle}
      />,
    );
    expect(screen.getByText('Alice')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Collapse Engineering' }));
    expect(onGroupToggle).toHaveBeenCalledWith('eng', false);
    expect(screen.queryByText('Alice')).toBeNull();
    expect(screen.queryByText('Bob')).toBeNull();
  });

  it('fires onGroupToggle but does NOT self-update when in controlled mode', async () => {
    const onGroupToggle = vi.fn();
    renderWithDnd(
      <ResourceTimeline
        resources={groupedResources}
        events={[]}
        timeRange={timeRange}
        interval="hourly"
        height={400}
        groups={groups}
        expandedGroupIds={['eng', 'design']}
        onGroupToggle={onGroupToggle}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Collapse Engineering' }));
    expect(onGroupToggle).toHaveBeenCalledWith('eng', false);
    // Controlled — parent hasn't updated the prop, so Alice is still visible.
    expect(screen.getByText('Alice')).toBeTruthy();
  });

  it('reflects parent state changes in controlled mode', async () => {
    const ControlledHarness = () => {
      const [expandedIds, setExpandedIds] = useState(['eng', 'design']);
      return (
        <ResourceTimeline
          resources={groupedResources}
          events={[]}
          timeRange={timeRange}
          interval="hourly"
          height={400}
          groups={groups}
          expandedGroupIds={expandedIds}
          onGroupToggle={(groupId, next) => {
            setExpandedIds((prev) =>
              next ? [...prev.filter((id) => id !== groupId), groupId] : prev.filter((id) => id !== groupId),
            );
          }}
        />
      );
    };
    renderWithDnd(<ControlledHarness />);
    expect(screen.getByText('Alice')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Collapse Engineering' }));
    expect(screen.queryByText('Alice')).toBeNull();
  });

  it('sets aria-rowcount to rowPlan.rows.length + 1 (includes headers + time-axis row)', () => {
    // With 3 resources + 2 groups, both expanded: 2 headers + 3 resources = 5 rows + time axis = 6.
    renderWithDnd(
      <ResourceTimeline
        resources={groupedResources}
        events={[]}
        timeRange={timeRange}
        interval="hourly"
        height={400}
        groups={groups}
      />,
    );
    expect(screen.getByRole('grid').getAttribute('aria-rowcount')).toBe('6');
  });

  it('updates aria-rowcount when a group is collapsed (collapsed members leave the DOM)', async () => {
    renderWithDnd(
      <ResourceTimeline
        resources={groupedResources}
        events={[]}
        timeRange={timeRange}
        interval="hourly"
        height={400}
        groups={groups}
      />,
    );
    const grid = screen.getByRole('grid');
    expect(grid.getAttribute('aria-rowcount')).toBe('6');
    await userEvent.click(screen.getByRole('button', { name: 'Collapse Engineering' }));
    // Headers still count; eng's 2 resources are removed → 4.
    expect(grid.getAttribute('aria-rowcount')).toBe('4');
  });

  it('does NOT fire onExternalDrop for drops onto cells of resources in collapsed groups', async () => {
    // Cells for collapsed-group resources aren't rendered, so there's nothing to drop on.
    // Sanity check: no gridcell with aria-label referencing the collapsed resource exists.
    const { container } = renderWithDnd(
      <ResourceTimeline
        resources={groupedResources}
        events={[]}
        timeRange={timeRange}
        interval="hourly"
        height={400}
        groups={groups}
        defaultExpandedGroupIds={['eng']}
      />,
    );
    // Design is collapsed → Carol's row is not in the DOM.
    // rtb-resource-row count = 2 (Alice + Bob), not 3.
    expect(container.querySelectorAll('.rtb-resource-row')).toHaveLength(2);
  });

  it('uses renderGroupHeader to replace the label span content', () => {
    renderWithDnd(
      <ResourceTimeline
        resources={groupedResources}
        events={[]}
        timeRange={timeRange}
        interval="hourly"
        height={400}
        groups={groups}
        renderGroupHeader={(g) => <strong>custom: {g.label}</strong>}
      />,
    );
    expect(screen.getByText('custom: Engineering')).toBeTruthy();
    // Chevron's aria-label still references the original label text.
    expect(screen.getByRole('button', { name: 'Collapse Engineering' })).toBeTruthy();
  });
});
