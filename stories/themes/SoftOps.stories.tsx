import type { Meta, StoryObj } from '@storybook/react';
import { ResourceTimeline, useTimeboardDraggable } from '../../src';
import { DragPreview } from '../DragPreview';
import {
  THEME_GROUPS,
  THEME_RESOURCES,
  THEME_TIME_RANGE,
} from './shared-data';
import { useThemeDemoState, type DraggedTemplate } from './useThemeDemoState';

type SoftTemplate = DraggedTemplate & { emoji: string };

const TEMPLATES: SoftTemplate[] = [
  { id: 'one-on-one', label: '1:1 meeting', durationHours: 1, emoji: '☕' },
  { id: 'focus', label: 'Focus time', durationHours: 2, emoji: '🎧' },
  { id: 'coffee', label: 'Coffee chat', durationHours: 1, emoji: '🌱' },
];

/**
 * Soft Ops — warm pastel palette (mint + cream + amber), generous
 * rounded corners, a playful contrast to the Editorial theme.
 */
const THEME_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=DM+Mono:wght@400;500&display=swap');

.theme-soft-stage {
  background:
    radial-gradient(circle at 20% 0%, #d9f2e3 0%, transparent 50%),
    radial-gradient(circle at 100% 100%, #ffe8cf 0%, transparent 45%),
    #fbf7ee;
  padding: 48px;
  min-height: 100vh;
  font-family: 'DM Sans', ui-sans-serif, sans-serif;
}

.theme-soft-stage .theme-soft-heading {
  font-family: 'DM Sans', ui-sans-serif, sans-serif;
  font-weight: 700;
  font-size: 36px;
  letter-spacing: -0.02em;
  color: #2a3a33;
  margin: 0 0 6px;
}

.theme-soft-stage .theme-soft-subhead {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 12px;
  letter-spacing: 0.02em;
  color: #6b7c73;
  margin: 0 0 32px;
}

.theme-soft-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 32px;
  align-items: start;
}

.theme-soft-templates {
  padding: 18px;
  background: rgba(255, 255, 255, 0.55);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(42, 58, 51, 0.06);
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(42, 58, 51, 0.05);
}

.theme-soft-templates__title {
  font-family: 'DM Sans', ui-sans-serif, sans-serif;
  font-size: 13px;
  font-weight: 700;
  color: #2a3a33;
  letter-spacing: 0.02em;
  margin: 0 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.theme-soft-templates__title span {
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  font-weight: 500;
  color: #6b7c73;
}

.theme-soft-templates__hint {
  font-family: 'DM Sans', ui-sans-serif, sans-serif;
  font-size: 12px;
  color: #6b7c73;
  margin: 14px 0 0;
  line-height: 1.5;
}

.theme-soft-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  margin-bottom: 8px;
  background: white;
  border: 1px solid rgba(42, 58, 51, 0.06);
  border-radius: 10px;
  cursor: grab;
  touch-action: none;
  box-shadow: 0 2px 6px rgba(42, 58, 51, 0.04);
  transition: transform 140ms ease-out, box-shadow 160ms ease-out;
}

.theme-soft-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(42, 58, 51, 0.1);
}

.theme-soft-chip:active {
  cursor: grabbing;
}

.theme-soft-chip--dragging {
  cursor: grabbing;
  transform: scale(1.03) rotate(-2deg);
  box-shadow: 0 24px 60px -16px rgba(42, 58, 51, 0.28);
  border-color: #4ca782;
}

.theme-soft-chip__emoji {
  font-size: 18px;
  line-height: 1;
}

.theme-soft-chip__body {
  flex: 1;
  min-width: 0;
}

.theme-soft-chip__label {
  display: block;
  font-family: 'DM Sans', ui-sans-serif, sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #2a3a33;
  letter-spacing: -0.005em;
}

.theme-soft-chip__duration {
  display: block;
  font-family: 'DM Mono', ui-monospace, monospace;
  font-size: 10px;
  color: #6b7c73;
  margin-top: 1px;
}

.theme-soft-reset {
  margin-top: 10px;
  appearance: none;
  background: transparent;
  border: 1px solid rgba(42, 58, 51, 0.12);
  padding: 8px 14px;
  border-radius: 999px;
  font-family: 'DM Sans', ui-sans-serif, sans-serif;
  font-size: 12px;
  color: #4ca782;
  cursor: pointer;
  transition: background 120ms ease-out, border-color 120ms ease-out;
}

.theme-soft-reset:hover {
  background: rgba(76, 167, 130, 0.08);
  border-color: #4ca782;
}

.theme-soft .rtb-root {
  --rtb-font-family: 'DM Sans', ui-sans-serif, sans-serif;
  --rtb-font-mono: 'DM Mono', ui-monospace, monospace;
  --rtb-font-size-base: 13px;

  --rtb-bg: #fbf7ee;
  --rtb-text: #2a3a33;
  --rtb-text-muted: #6b7c73;
  --rtb-border: #e4ded0;
  --rtb-border-subtle: #eee7d8;

  --rtb-cell-bg: #fbf7ee;
  --rtb-cell-bg-alt: #f7f1e2;
  --rtb-cell-border: #eee7d8;
  --rtb-cell-hover-bg: rgba(76, 167, 130, 0.15);

  --rtb-event-bg: #ffffff;
  --rtb-event-text: #2a3a33;
  --rtb-event-accent: #4ca782;
  --rtb-event-accent-width: 4px;
  --rtb-event-radius: 10px;
  --rtb-event-padding: 8px 12px;
  --rtb-event-border-color: rgba(42, 58, 51, 0.08);
  --rtb-event-shadow: 0 2px 6px rgba(42, 58, 51, 0.06), 0 1px 2px rgba(42, 58, 51, 0.04);
  --rtb-event-shadow-hover: 0 6px 16px rgba(42, 58, 51, 0.12);
  --rtb-event-hover-brightness: 1;

  --rtb-sidebar-bg: transparent;
  --rtb-sidebar-text: #2a3a33;
  --rtb-sidebar-border: #e4ded0;
  --rtb-sidebar-font-size: 13px;
  --rtb-sidebar-font-weight: 500;
  --rtb-sidebar-padding: 12px 16px;

  --rtb-time-axis-bg: transparent;
  --rtb-time-axis-text: #6b7c73;
  --rtb-time-axis-border: #e4ded0;
  --rtb-time-axis-font-family: 'DM Mono', ui-monospace, monospace;
  --rtb-time-axis-font-size: 11px;
  --rtb-time-axis-letter-spacing: 0.04em;

  --rtb-corner-bg: transparent;
  --rtb-corner-border: #e4ded0;

  --rtb-group-header-bg: rgba(76, 167, 130, 0.1);
  --rtb-group-header-hover-bg: rgba(76, 167, 130, 0.2);
  --rtb-group-header-text: #2a3a33;
  --rtb-group-header-font-weight: 700;
  --rtb-group-header-font-size: 12px;

  --rtb-focus-outline: 2px solid #4ca782;
  --rtb-loading-overlay-bg: rgba(251, 247, 238, 0.8);
  --rtb-spinner-color: #4ca782;

  box-shadow: 0 24px 60px -24px rgba(42, 58, 51, 0.18);
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(42, 58, 51, 0.06);
}

.theme-soft .rtb-event {
  text-transform: none;
}

.theme-soft .rtb-time-label {
  text-transform: none;
}

.theme-soft .rtb-group-header__label {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 11px;
}

/* Amber accent for every other event so overlapping work reads at a glance. */
.theme-soft .rtb-event:nth-of-type(2n) {
  --rtb-event-accent: #e89a42;
}
`;

function SoftChipContent({ template }: { template: SoftTemplate }) {
  return (
    <>
      <span className="theme-soft-chip__emoji" aria-hidden="true">
        {template.emoji}
      </span>
      <span className="theme-soft-chip__body">
        <span className="theme-soft-chip__label">{template.label}</span>
        <span className="theme-soft-chip__duration">
          {template.durationHours}h
        </span>
      </span>
    </>
  );
}

function SoftChip({ template }: { template: SoftTemplate }) {
  const { setNodeRef, attributes, listeners, isDragging } = useTimeboardDraggable({
    id: `soft-${template.id}`,
    data: template,
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="theme-soft-chip"
      style={{ opacity: isDragging ? 0.3 : 1 }}
    >
      <SoftChipContent template={template} />
    </div>
  );
}

function SoftChipOverlay({ template }: { template: SoftTemplate }) {
  return (
    <div className="theme-soft-chip theme-soft-chip--dragging">
      <SoftChipContent template={template} />
    </div>
  );
}

const meta: Meta = {
  title: 'Themes/Soft Ops',
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'light', values: [{ name: 'light', value: '#fbf7ee' }] },
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
          <div className="theme-soft-stage">
            <h1 className="theme-soft-heading">This week</h1>
            <p className="theme-soft-subhead">
              2 groups · 5 teammates · {events.length} blocks
            </p>
            <div className="theme-soft-layout">
              <aside className="theme-soft-templates">
                <h2 className="theme-soft-templates__title">
                  Templates <span>drag to assign</span>
                </h2>
                {TEMPLATES.map((t) => (
                  <SoftChip key={t.id} template={t} />
                ))}
                <button type="button" className="theme-soft-reset" onClick={reset}>
                  Reset board
                </button>
                <p className="theme-soft-templates__hint">
                  Drop onto any cell to schedule.
                </p>
              </aside>
              <div className="theme-soft">
                <ResourceTimeline
                  resources={THEME_RESOURCES}
                  events={events}
                  timeRange={THEME_TIME_RANGE}
                  interval="hourly"
                  height={440}
                  groups={THEME_GROUPS}
                  onExternalDrop={handleDrop}
                  ariaLabel="Soft Ops theme demo"
                />
              </div>
            </div>
            <DragPreview<SoftTemplate>
              render={(t) => <SoftChipOverlay template={t} />}
            />
          </div>
        </>
      );
    };
    return <Demo />;
  },
};
