import type { BaseEvent, BaseResource, ResourceGroup } from '../../src';

/**
 * Shared mock data for the theme demo stories. Same grid, different skins —
 * so side-by-side comparisons show what changes across themes.
 */

export const THEME_TIME_RANGE = {
  start: new Date(2024, 2, 15, 9),
  end: new Date(2024, 2, 15, 18),
};

export const THEME_GROUPS: ResourceGroup[] = [
  { id: 'eng', label: 'Engineering' },
  { id: 'design', label: 'Design' },
];

export const THEME_RESOURCES: BaseResource[] = [
  { id: 'alice', label: 'Alice Chen', groupId: 'eng' },
  { id: 'bob', label: 'Bob Okafor', groupId: 'eng' },
  { id: 'carol', label: 'Carol Park', groupId: 'eng' },
  { id: 'dana', label: 'Dana Reid', groupId: 'design' },
  { id: 'elena', label: 'Elena Ruiz', groupId: 'design' },
];

export const THEME_EVENTS: BaseEvent[] = [
  {
    id: 'Sprint planning',
    resourceId: 'alice',
    start: new Date(2024, 2, 15, 9),
    end: new Date(2024, 2, 15, 11),
  },
  {
    id: 'API review',
    resourceId: 'alice',
    start: new Date(2024, 2, 15, 13),
    end: new Date(2024, 2, 15, 15),
  },
  {
    id: 'Pair w/ Carol',
    resourceId: 'bob',
    start: new Date(2024, 2, 15, 10),
    end: new Date(2024, 2, 15, 12),
  },
  {
    id: 'Pair w/ Bob',
    resourceId: 'carol',
    start: new Date(2024, 2, 15, 10),
    end: new Date(2024, 2, 15, 12),
  },
  {
    id: 'Deep work',
    resourceId: 'carol',
    start: new Date(2024, 2, 15, 14),
    end: new Date(2024, 2, 15, 17),
  },
  {
    id: 'Design review',
    resourceId: 'dana',
    start: new Date(2024, 2, 15, 11),
    end: new Date(2024, 2, 15, 13),
  },
  {
    id: 'Critique',
    resourceId: 'dana',
    start: new Date(2024, 2, 15, 14),
    end: new Date(2024, 2, 15, 15, 30),
  },
  {
    id: 'User research',
    resourceId: 'elena',
    start: new Date(2024, 2, 15, 9, 30),
    end: new Date(2024, 2, 15, 12),
  },
  {
    id: 'Wireframes',
    resourceId: 'elena',
    start: new Date(2024, 2, 15, 13),
    end: new Date(2024, 2, 15, 16),
  },
];
