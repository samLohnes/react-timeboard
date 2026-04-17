import type { Meta, StoryObj } from '@storybook/react';
import { ResourceTimeline, useTimeboardDraggable } from '../../src';
import { DragPreview } from '../DragPreview';
import {
  THEME_GROUPS,
  THEME_RESOURCES,
  THEME_TIME_RANGE,
} from './shared-data';
import { useThemeDemoState, type DraggedTemplate } from './useThemeDemoState';

const TEMPLATES: DraggedTemplate[] = [
  { id: 'interview', label: 'Interview', durationHours: 1 },
  { id: 'review', label: 'Editorial review', durationHours: 2 },
  { id: 'office-hours', label: 'Office hours', durationHours: 1 },
];

/**
 * Editorial Technical — Fraunces display serif + Geist Mono on warm
 * unbleached paper. Accents in burnt sienna. Every `--rtb-*` variable
 * is scoped under `.theme-editorial .rtb-root` — nothing leaks.
 */
const THEME_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,700&family=Geist+Mono:wght@400;500&display=swap');

.theme-editorial-stage {
  background: #fbf8f3;
  padding: 40px 48px;
  min-height: 100vh;
  font-family: 'Fraunces', Georgia, serif;
}

.theme-editorial-stage .theme-editorial-heading {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 500;
  font-variation-settings: 'opsz' 72;
  font-size: 42px;
  letter-spacing: -0.02em;
  color: #1a1714;
  margin: 0 0 6px;
}

.theme-editorial-stage .theme-editorial-subhead {
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #8a7a68;
  margin: 0 0 28px;
}

.theme-editorial-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 32px;
  align-items: start;
}

.theme-editorial-drafts {
  padding: 20px 0 0;
  border-top: 1px solid #e0d9cb;
}

.theme-editorial-drafts__title {
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #8a7a68;
  margin: 0 0 16px;
}

.theme-editorial-drafts__hint {
  font-family: 'Fraunces', Georgia, serif;
  font-variation-settings: 'opsz' 12;
  font-size: 13px;
  font-style: italic;
  color: #8a7a68;
  margin: 18px 0 0;
  line-height: 1.5;
}

.theme-editorial-chip {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: baseline;
  gap: 12px;
  padding: 10px 14px;
  margin-bottom: 10px;
  background: #fbf8f3;
  border: 1px solid #e0d9cb;
  border-left: 3px solid #c44818;
  border-radius: 2px;
  cursor: grab;
  touch-action: none;
  transition: box-shadow 160ms ease-out, transform 120ms ease-out, background 120ms ease-out;
}

.theme-editorial-chip:hover {
  background: #f5f0e6;
  box-shadow: 0 3px 12px rgba(74, 52, 24, 0.1);
  transform: translateY(-1px);
}

.theme-editorial-chip:active {
  cursor: grabbing;
}

.theme-editorial-chip--dragging {
  cursor: grabbing;
  background: #fbf8f3;
  box-shadow: 0 20px 50px -12px rgba(74, 52, 24, 0.35);
  transform: rotate(-1deg);
}

.theme-editorial-chip__label {
  font-family: 'Fraunces', Georgia, serif;
  font-variation-settings: 'opsz' 14;
  font-weight: 500;
  font-size: 15px;
  color: #1a1714;
  letter-spacing: -0.005em;
}

.theme-editorial-chip__duration {
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.1em;
  color: #8a7a68;
  text-transform: uppercase;
}

.theme-editorial-reset {
  margin-top: 18px;
  appearance: none;
  background: transparent;
  border: 0;
  padding: 6px 0;
  font-family: 'Geist Mono', ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #c44818;
  cursor: pointer;
}

.theme-editorial-reset:hover {
  text-decoration: underline;
  text-underline-offset: 4px;
}

.theme-editorial .rtb-root {
  --rtb-font-family: 'Fraunces', Georgia, serif;
  --rtb-font-mono: 'Geist Mono', ui-monospace, monospace;
  --rtb-font-size-base: 14px;

  --rtb-bg: #fbf8f3;
  --rtb-text: #1a1714;
  --rtb-text-muted: #8a7a68;
  --rtb-border: #e0d9cb;
  --rtb-border-subtle: #efebe1;

  --rtb-cell-bg: #fbf8f3;
  --rtb-cell-bg-alt: #fbf8f3;
  --rtb-cell-border: #efebe1;
  --rtb-cell-hover-bg: rgba(196, 72, 24, 0.1);

  --rtb-event-bg: #fbf8f3;
  --rtb-event-text: #1a1714;
  --rtb-event-accent: #c44818;
  --rtb-event-accent-width: 3px;
  --rtb-event-radius: 2px;
  --rtb-event-padding: 6px 12px;
  --rtb-event-border-color: #d8cfbd;
  --rtb-event-shadow: 0 1px 0 rgba(74, 52, 24, 0.04), 0 1px 2px rgba(74, 52, 24, 0.05);
  --rtb-event-shadow-hover: 0 3px 10px rgba(74, 52, 24, 0.12);
  --rtb-event-hover-brightness: 1;

  --rtb-sidebar-bg: #f5f0e6;
  --rtb-sidebar-text: #1a1714;
  --rtb-sidebar-border: #e0d9cb;
  --rtb-sidebar-font-size: 14px;
  --rtb-sidebar-font-weight: 500;

  --rtb-time-axis-bg: #f5f0e6;
  --rtb-time-axis-text: #8a7a68;
  --rtb-time-axis-border: #e0d9cb;
  --rtb-time-axis-font-family: 'Geist Mono', ui-monospace, monospace;
  --rtb-time-axis-font-size: 10px;
  --rtb-time-axis-letter-spacing: 0.14em;

  --rtb-corner-bg: #f5f0e6;
  --rtb-corner-border: #e0d9cb;

  --rtb-group-header-bg: #ebe4d4;
  --rtb-group-header-hover-bg: #ddd4c0;
  --rtb-group-header-text: #1a1714;
  --rtb-group-header-font-weight: 700;
  --rtb-group-header-font-size: 13px;

  --rtb-focus-outline: 2px solid #c44818;
  --rtb-loading-overlay-bg: rgba(251, 248, 243, 0.8);
  --rtb-spinner-color: #c44818;
}

.theme-editorial .rtb-event {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 500;
  font-variation-settings: 'opsz' 14;
}

.theme-editorial .rtb-resource-label {
  font-variation-settings: 'opsz' 14;
  letter-spacing: -0.005em;
}

.theme-editorial .rtb-group-header__label {
  font-family: 'Fraunces', Georgia, serif;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 12px;
}

.theme-editorial .rtb-group-header__label::before {
  content: '§';
  color: #c44818;
  margin-right: 8px;
  font-weight: 500;
}
`;

function EditorialChipContent({ template }: { template: DraggedTemplate }) {
  return (
    <>
      <span className="theme-editorial-chip__label">{template.label}</span>
      <span className="theme-editorial-chip__duration">
        {template.durationHours}h
      </span>
    </>
  );
}

function EditorialChip({ template }: { template: DraggedTemplate }) {
  const { setNodeRef, attributes, listeners, isDragging } = useTimeboardDraggable({
    id: `editorial-${template.id}`,
    data: template,
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="theme-editorial-chip"
      style={{ opacity: isDragging ? 0.3 : 1 }}
    >
      <EditorialChipContent template={template} />
    </div>
  );
}

function EditorialChipOverlay({ template }: { template: DraggedTemplate }) {
  return (
    <div className="theme-editorial-chip theme-editorial-chip--dragging">
      <EditorialChipContent template={template} />
    </div>
  );
}

const meta: Meta = {
  title: 'Themes/Editorial Technical',
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'light', values: [{ name: 'light', value: '#fbf8f3' }] },
  },
};
export default meta;

export const Default: StoryObj = {
  render: () => {
    const Demo = () => {
      const { events, handleDrop, reset } = useThemeDemoState();
      return (
        <>
          <style>{THEME_STYLES}</style>
          <div className="theme-editorial-stage">
            <h1 className="theme-editorial-heading">The Schedule</h1>
            <p className="theme-editorial-subhead">
              March 15, 2024 · Engineering &amp; Design
            </p>
            <div className="theme-editorial-layout">
              <aside className="theme-editorial-drafts">
                <h2 className="theme-editorial-drafts__title">Drafts</h2>
                {TEMPLATES.map((t) => (
                  <EditorialChip key={t.id} template={t} />
                ))}
                <p className="theme-editorial-drafts__hint">
                  Drag a draft onto any cell to assign it.
                </p>
                <button
                  type="button"
                  className="theme-editorial-reset"
                  onClick={reset}
                >
                  Reset
                </button>
              </aside>
              <div className="theme-editorial">
                <ResourceTimeline
                  resources={THEME_RESOURCES}
                  events={events}
                  timeRange={THEME_TIME_RANGE}
                  interval="hourly"
                  height={420}
                  groups={THEME_GROUPS}
                  onExternalDrop={handleDrop}
                  ariaLabel="Editorial Technical theme demo"
                />
              </div>
            </div>
            <DragPreview<DraggedTemplate>
              render={(t) => <EditorialChipOverlay template={t} />}
            />
          </div>
        </>
      );
    };
    return <Demo />;
  },
};
