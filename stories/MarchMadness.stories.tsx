import type { Meta, StoryObj } from '@storybook/react';
import { MarchMadnessDemo } from './MarchMadnessDemo';

const meta: Meta<typeof MarchMadnessDemo> = {
  title: 'ResourceTimeline/MarchMadnessBroadcast',
  component: MarchMadnessDemo,
  argTypes: {
    allowOverlappingChannelAssignments: {
      control: 'boolean',
      description:
        'When enabled, a single channel can be assigned to multiple games whose time ranges overlap. When disabled (default), overlapping assignments are rejected with a toast.',
    },
  },
  args: {
    allowOverlappingChannelAssignments: false,
  },
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const Default: StoryObj<typeof MarchMadnessDemo> = {};

export const AllowOverlappingAssignments: StoryObj<typeof MarchMadnessDemo> = {
  args: {
    allowOverlappingChannelAssignments: true,
  },
};
