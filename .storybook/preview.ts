import type { Preview } from '@storybook/react';
import React from 'react';
import { DndContext } from '@dnd-kit/core';
import '../src/styles.css';
import '../stories/fonts.css';
import '../stories/demo.css';

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    backgrounds: {
      default: 'control-room',
      values: [
        { name: 'control-room', value: '#0b0b0e' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
  decorators: [
    // Every ResourceTimeline uses `useDndMonitor`, which requires a DndContext
    // ancestor. Wrapping every story globally keeps dev stories simple.
    (Story) => React.createElement(DndContext, null, React.createElement(Story)),
  ],
};

export default preview;
