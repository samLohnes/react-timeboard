# react-timeboard

A TypeScript-first React component library for resource × time grids with external drag-and-drop support.

**Status:** v0.0.1 (pre-release)

## Features

- Resources on the Y-axis, time on the X-axis. Drop external items onto `{resource, date}` cells.
- Three interval modes: `hourly`, `daily`, `weekly`.
- Generic over event and resource types — extend `BaseEvent` and `BaseResource` with your own fields.
- Events stack into lanes when they overlap (greedy first-fit).
- Optional **collapsible resource groups** — organize resources under section headers (department, team, sport) and let users expand/collapse each. Supports both controlled and uncontrolled expansion state.
- **State-less by design** — the library never mutates your data. All drops, clicks, and group toggles flow through callbacks, so it slots into any state management (React state, Redux, React Query) and any backend pattern (optimistic update, pessimistic-then-refresh, offline queue).
- Clean default styling, fully themeable via `--rtb-*` CSS custom properties. No CSS-in-JS.
- ESM + CJS builds. Vite library mode. TypeScript declarations included.
- `@dnd-kit/core` as a peer dependency; no bundled drag-and-drop code.

## Install

```bash
npm install react-timeboard @dnd-kit/core
```

`react`, `react-dom`, and `@dnd-kit/core` are peer dependencies.

## Usage

```tsx
import { DndContext } from '@dnd-kit/core';
import {
  ResourceTimeline,
  useTimeboardDraggable,
  type BaseEvent,
  type BaseResource,
} from 'react-timeboard';
import 'react-timeboard/styles.css';

interface MyEvent extends BaseEvent {
  title: string;
}
interface MyResource extends BaseResource {
  color: string;
}

function DraggableItem({ item }: { item: { label: string } }) {
  const { setNodeRef, attributes, listeners, dragStyle, isDragging } =
    useTimeboardDraggable({ id: `item-${item.label}`, data: item });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ ...dragStyle, opacity: isDragging ? 0.5 : 1 }}
    >
      {item.label}
    </div>
  );
}

function App() {
  return (
    <DndContext>
      <DraggableItem item={{ label: 'Task A' }} />
      <ResourceTimeline<MyEvent, MyResource>
        resources={[
          { id: 'r1', label: 'Alice', color: '#f00' },
          { id: 'r2', label: 'Bob', color: '#00f' },
        ]}
        events={[
          {
            id: 'e1',
            title: 'Kickoff',
            start: new Date('2024-03-15T10:00'),
            end: new Date('2024-03-15T11:00'),
            resourceId: 'r1',
          },
        ]}
        timeRange={{
          start: new Date('2024-03-15T09:00'),
          end: new Date('2024-03-15T17:00'),
        }}
        interval="hourly"
        height="80vh"
        renderEvent={(e) => <div>{e.title}</div>}
        renderResource={(r) => <div style={{ color: r.color }}>{r.label}</div>}
        onExternalDrop={(item, resourceId, date) => {
          console.log('Dropped', item, 'on', resourceId, 'at', date);
        }}
      />
    </DndContext>
  );
}
```

**Important:** your app must wrap `ResourceTimeline` in a `<DndContext>` from `@dnd-kit/core`. The library uses `useDndMonitor` to listen for drops — it does NOT own its own `DndContext`. This is what lets you define draggables anywhere in your app, not just inside the timeline.

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `resources` | `TResource[]` | Yes | Rows of the grid. `TResource` extends `BaseResource`. Each resource may optionally carry a `groupId` to render under a group header. |
| `events` | `TEvent[]` | Yes | Events to render. `TEvent` extends `BaseEvent`. |
| `timeRange` | `{ start: Date; end: Date }` | Yes | Visible time window (local timezone). For weekly interval, the first column snaps back to the Monday on or before `start`. |
| `interval` | `'hourly' \| 'daily' \| 'weekly'` | Yes | Column granularity. Fixed at instantiation. |
| `height` | `string \| number` | **Yes** | CSS height of the outer container (e.g. `'80vh'` or `600`). The body uses `overflow: auto`; without a bounded outer height it cannot scroll. |
| `groups` | `ResourceGroup[]` | No | Group definitions. When provided, resources whose `groupId` matches a group's `id` render under that group's collapsible header. Resources with no matching group render ungrouped at the top. |
| `expandedGroupIds` | `string[]` | No | **Controlled mode.** The set of group IDs currently expanded. If provided, the library does not manage expansion state — the consumer updates this prop in response to `onGroupToggle`. |
| `defaultExpandedGroupIds` | `string[]` | No | **Uncontrolled mode initial state.** Used only when `expandedGroupIds` is omitted. Defaults to all groups expanded. |
| `onGroupToggle` | `(groupId: string, nextExpanded: boolean) => void` | No | Fired when a user clicks a group header's chevron (the only toggle hit target). In controlled mode, use this to update `expandedGroupIds`. |
| `renderEvent` | `(event: TEvent) => ReactNode` | No | Custom event renderer. Defaults to rendering `event.id`. |
| `renderResource` | `(resource: TResource) => ReactNode` | No | Custom sidebar row renderer. Defaults to `resource.label`. |
| `renderGroupHeader` | `(group: ResourceGroup, isExpanded: boolean) => ReactNode` | No | Custom renderer for the label area inside a group header. The library always renders its own chevron button; this prop controls the label content only. |
| `onExternalDrop` | `(item: unknown, resourceId: string, date: Date) => void` | No | Fired when an external draggable is dropped on a cell. |
| `onEventClick` | `(event: TEvent, e: MouseEvent) => void` | No | Fired when an event block is clicked. |
| `onCellClick` | `(resourceId: string, date: Date) => void` | No | Fired when an empty cell area is clicked. |
| `columnWidth` | `number` | No | Pixels per column. Defaults: 80 (hourly), 120 (daily), 160 (weekly). Pass when overriding the matching CSS. |
| `laneHeight` | `number` | No | Pixels per event lane. Default `28`. Pass when overriding `--rtb-event-lane-height`. |
| `rowPadding` | `number` | No | Pixels of top+bottom padding inside a resource row. Default `4`. Pass when overriding `--rtb-row-padding`. |
| `groupHeaderHeight` | `number` | No | Pixels of row height for a group header. Default `36`. Pass when overriding `--rtb-group-header-height`. |
| `loading` | `boolean` | No | Renders a full-board spinner overlay and disables drops. |
| `ariaLabel` | `string` | No | Accessible label for the root grid. |

### Keeping CSS and JS in sync for layout dimensions

Colors, fonts, and borders are free to override with CSS alone. **Layout dimensions** (column width, lane height, row padding, group header height) must match between the `--rtb-*` CSS variable AND the matching prop — otherwise the sidebar column and body grid drift apart. Two-source-of-truth by design; the tradeoff is explicit.

```tsx
// Taller event lanes — both sources updated together.
<div style={{ ['--rtb-event-lane-height' as string]: '40px' }}>
  <ResourceTimeline
    /* ... */
    laneHeight={40}
  />
</div>
```

## Theming

All colors, sizes, and spacings are CSS custom properties prefixed `--rtb-*`. Override them in your own stylesheet:

```css
.rtb-root {
  --rtb-event-bg: #10b981;
  --rtb-event-text: #fff;
  --rtb-sidebar-width: 220px;
  --rtb-cell-hover-bg: rgba(16, 185, 129, 0.15);
}
```

**Full variable reference:** see [`src/styles.css`](./src/styles.css).

### Dark mode

Define a dark-mode theme by overriding variables inside a media query:

```css
@media (prefers-color-scheme: dark) {
  .rtb-root {
    --rtb-bg: #0a0a0a;
    --rtb-text: #fafafa;
    --rtb-border: #27272a;
    --rtb-cell-bg-alt: #18181b;
    --rtb-sidebar-bg: #0f0f10;
    --rtb-time-axis-bg: #0f0f10;
    --rtb-corner-bg: #18181b;
  }
}
```

## Exports

- `ResourceTimeline` — the main component.
- `useTimeboardDraggable` — convenience hook wrapping `@dnd-kit/core`'s `useDraggable`.
- Types: `BaseEvent`, `BaseResource`, `ResourceGroup`, `IntervalMode`, `ResourceTimelineProps`, `UseTimeboardDraggableOptions`.

No `VERSION` export — read it from your own `package.json` if you need it.

## Resource Groups

Group resources under collapsible section headers by (1) attaching a `groupId` to each resource and (2) passing a matching `groups` array.

```tsx
import {
  ResourceTimeline,
  type BaseResource,
  type ResourceGroup,
} from 'react-timeboard';

const GROUPS: ResourceGroup[] = [
  { id: 'engineering', label: 'Engineering' },
  { id: 'design', label: 'Design' },
];

const resources: BaseResource[] = [
  { id: 'r1', label: 'Alice', groupId: 'engineering' },
  { id: 'r2', label: 'Bob', groupId: 'engineering' },
  { id: 'r3', label: 'Charlie', groupId: 'design' },
];
```

**Uncontrolled:** the library manages expansion state.

```tsx
<ResourceTimeline
  resources={resources}
  events={events}
  timeRange={timeRange}
  interval="hourly"
  height="80vh"
  groups={GROUPS}
  defaultExpandedGroupIds={['engineering']} // only Engineering starts expanded
/>
```

**Controlled:** you own the expansion state.

```tsx
const [expanded, setExpanded] = useState<string[]>(['engineering', 'design']);

<ResourceTimeline
  resources={resources}
  events={events}
  timeRange={timeRange}
  interval="hourly"
  height="80vh"
  groups={GROUPS}
  expandedGroupIds={expanded}
  onGroupToggle={(id, nextExpanded) => {
    setExpanded((prev) =>
      nextExpanded ? [...prev, id] : prev.filter((x) => x !== id),
    );
  }}
/>;
```

Resources whose `groupId` doesn't match any provided group (or that have no `groupId`) render ungrouped at the top of the grid. Collapsed groups remove their resource rows from the DOM (not just hide them) — keeps large, mostly-collapsed boards fast.

## Backend Integration Patterns

`ResourceTimeline` renders `resources`, `events`, and group state from props and fires callbacks (`onExternalDrop`, `onEventClick`, `onCellClick`, `onGroupToggle`) for every user action. It never mutates your data — so it slots into any state pattern.

### 1. Optimistic update (snappy UX, roll back on error)

```tsx
function Board() {
  const [events, setEvents] = useState<MyEvent[]>(initialEvents);

  const handleDrop = async (item: unknown, resourceId: string, date: Date) => {
    const dropped = item as MyItem;
    const optimisticEvent: MyEvent = { /* ...construct from item... */ };

    // 1. Update UI immediately.
    setEvents((prev) => [...prev, optimisticEvent]);

    try {
      // 2. Persist to backend.
      const saved = await api.createEvent({ resourceId, date, itemId: dropped.id });
      // 3. Reconcile: replace optimistic event with the saved (canonical) one.
      setEvents((prev) =>
        prev.map((e) => (e.id === optimisticEvent.id ? saved : e)),
      );
    } catch (err) {
      // 4. Roll back.
      setEvents((prev) => prev.filter((e) => e.id !== optimisticEvent.id));
      toast.error('Failed to save — please try again.');
    }
  };

  return <ResourceTimeline events={events} onExternalDrop={handleDrop} /* ... */ />;
}
```

### 2. Pessimistic-then-refresh (simpler, slightly less responsive)

```tsx
function Board() {
  const [events, setEvents] = useState<MyEvent[]>(initialEvents);
  const [saving, setSaving] = useState(false);

  const handleDrop = async (item: unknown, resourceId: string, date: Date) => {
    setSaving(true);
    try {
      await api.createEvent({ resourceId, date, itemId: (item as MyItem).id });
      const fresh = await api.listEvents(); // re-fetch canonical list
      setEvents(fresh);
    } catch (err) {
      toast.error('Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ResourceTimeline
      events={events}
      loading={saving} // dims the grid + spinner while saving
      onExternalDrop={handleDrop}
      /* ... */
    />
  );
}
```

### 3. React Query (recommended for most apps)

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

function Board() {
  const qc = useQueryClient();
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: api.listEvents,
  });

  const createEvent = useMutation({
    mutationFn: api.createEvent,
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ['events'] });
      const prev = qc.getQueryData<MyEvent[]>(['events']);
      const optimistic: MyEvent = { /* construct */ };
      qc.setQueryData<MyEvent[]>(['events'], (curr = []) => [...curr, optimistic]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['events'], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['events'] });
    },
  });

  return (
    <ResourceTimeline
      events={events}
      loading={isLoading}
      onExternalDrop={(item, resourceId, date) =>
        createEvent.mutate({ resourceId, date, itemId: (item as MyItem).id })
      }
      /* ... */
    />
  );
}
```

All three patterns share the same key property: `<ResourceTimeline>` re-renders whenever the `events` prop changes, so any source of truth — React state, Redux, React Query cache, Zustand store — flows through cleanly.

## Non-Goals (v1)

- **No internal drag.** Events on the board cannot be dragged to a new cell. External drops only.
- **No recurring events.** Each event is a single instance.
- **No virtualization.** Large grids render every DOM node. Target is ~hundreds of cells.
- **No timezone library.** Native `Date` and local timezone. DST edge cases documented.
- **No RTL support.**
- **No mobile-specific drag handling** beyond `@dnd-kit/core` defaults.

## Browser Support

All evergreen browsers (Chrome, Safari, Firefox, Edge latest). No IE11.

## Development

See [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

[MIT](./LICENSE)
