import type { Meta, StoryObj } from '@storybook/react';
import { ResourceTimeline } from '../../src';
import {
  THEME_EVENTS,
  THEME_GROUPS,
  THEME_RESOURCES,
  THEME_TIME_RANGE,
} from './shared-data';

/**
 * Soft Ops — warm pastel palette (mint + cream + amber), generous
 * rounded corners, a playful contrast to the Editorial theme.
 * Good fit for consumer-facing apps: wellness, education, lifestyle,
 * internal team tools that want to feel friendly rather than enterprise.
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
  --rtb-cell-hover-bg: rgba(76, 167, 130, 0.12);

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

  /* Subtle paper-card effect around the whole grid. */
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

/* Second-lane events on soft get an amber accent so overlapping work is
   color-coded at a glance. Demonstrates per-event accent overrides. */
.theme-soft .rtb-event:nth-of-type(2n) {
  --rtb-event-accent: #e89a42;
}
`;

const meta: Meta = {
  title: 'Themes/Soft Ops',
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'light', values: [{ name: 'light', value: '#fbf7ee' }] },
  },
};
export default meta;

export const Default: StoryObj = {
  render: () => (
    <>
      <style>{THEME_STYLES}</style>
      <div className="theme-soft-stage">
        <h1 className="theme-soft-heading">This week</h1>
        <p className="theme-soft-subhead">2 groups · 5 teammates · 9 blocks</p>
        <div className="theme-soft">
          <ResourceTimeline
            resources={THEME_RESOURCES}
            events={THEME_EVENTS}
            timeRange={THEME_TIME_RANGE}
            interval="hourly"
            height={400}
            groups={THEME_GROUPS}
            ariaLabel="Soft Ops theme demo"
          />
        </div>
      </div>
    </>
  ),
};
