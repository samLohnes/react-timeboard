import type { Meta, StoryObj } from '@storybook/react';
import { ResourceTimeline } from '../../src';
import {
  THEME_EVENTS,
  THEME_GROUPS,
  THEME_RESOURCES,
  THEME_TIME_RANGE,
} from './shared-data';

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
  --rtb-cell-hover-bg: rgba(196, 72, 24, 0.08);

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

const meta: Meta = {
  title: 'Themes/Editorial Technical',
  parameters: {
    layout: 'fullscreen',
    backgrounds: { default: 'light', values: [{ name: 'light', value: '#fbf8f3' }] },
  },
};
export default meta;

export const Default: StoryObj = {
  render: () => (
    <>
      <style>{THEME_STYLES}</style>
      <div className="theme-editorial-stage">
        <h1 className="theme-editorial-heading">The Schedule</h1>
        <p className="theme-editorial-subhead">March 15, 2024 · Engineering &amp; Design</p>
        <div className="theme-editorial">
          <ResourceTimeline
            resources={THEME_RESOURCES}
            events={THEME_EVENTS}
            timeRange={THEME_TIME_RANGE}
            interval="hourly"
            height={380}
            groups={THEME_GROUPS}
            ariaLabel="Editorial Technical theme demo"
          />
        </div>
      </div>
    </>
  ),
};
