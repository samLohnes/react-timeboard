import type { Meta, StoryObj } from '@storybook/react';
import { SportsBroadcastDemo } from './SportsBroadcastDemo';

const meta: Meta<typeof SportsBroadcastDemo> = {
  title: 'ResourceTimeline/SportsBroadcast',
  component: SportsBroadcastDemo,
  argTypes: {
    allowOverlappingChannelAssignments: {
      control: 'boolean',
      description:
        'When enabled, a single channel can be assigned to multiple games whose time ranges overlap. When disabled (default), overlapping assignments are rejected with a toast. Games view only — channels view is read-only.',
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

export const Default: StoryObj<typeof SportsBroadcastDemo> = {};

export const AllowOverlappingAssignments: StoryObj<typeof SportsBroadcastDemo> = {
  args: {
    allowOverlappingChannelAssignments: true,
  },
};
