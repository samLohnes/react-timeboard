import type { BaseEvent, BaseResource, ResourceGroup } from '../src';

export type Sport = 'basketball' | 'hockey' | 'soccer';

export interface BroadcastGame extends BaseEvent {
  homeTeam: string;
  awayTeam: string;
  tipOffTime: Date;
  assignedChannels: string[];
  sport: Sport;
}

export interface Channel extends BaseResource {
  network: string;
  brandColor: string;
}

// Fictional channels + networks — no trademarks. Networks become row groups
// in channels view; brandColor drives the chip accent in both views.
export const CHANNELS: Channel[] = [
  { id: 'atlas', label: 'Atlas Sport', network: 'Atlas Media', brandColor: '#CC0033' },
  { id: 'atlas2', label: 'Atlas 2', network: 'Atlas Media', brandColor: '#8B0020' },
  { id: 'prime', label: 'Prime Arena', network: 'Prime Sports', brandColor: '#003865' },
  { id: 'meridian', label: 'Meridian', network: 'Prime Sports', brandColor: '#E30613' },
  { id: 'skyline', label: 'Skyline', network: 'Skyline Broadcasting', brandColor: '#1A3A8A' },
  { id: 'vanguard', label: 'Vanguard', network: 'Prime Sports', brandColor: '#00A651' },
];

export const SPORT_GROUPS: ResourceGroup[] = [
  { id: 'basketball', label: '🏀 Basketball' },
  { id: 'hockey', label: '🏒 Hockey' },
  { id: 'soccer', label: '⚽ Soccer' },
];

/** Network groups used when the demo is flipped to a channels-per-row view. */
export const NETWORK_GROUPS: ResourceGroup[] = [
  { id: 'Atlas Media', label: '📡 Atlas Media' },
  { id: 'Prime Sports', label: '📡 Prime Sports' },
  { id: 'Skyline Broadcasting', label: '📡 Skyline Broadcasting' },
];

function makeTime(hour: number, minute = 0): Date {
  return new Date(2024, 2, 15, hour, minute);
}

// Fictional matchups — no real teams. Kept short so cards don't overflow.
export const INITIAL_GAMES: BroadcastGame[] = [
  {
    id: 'g1',
    resourceId: 'g1',
    sport: 'basketball',
    homeTeam: 'Ridgewood',
    awayTeam: 'Ashford',
    tipOffTime: makeTime(12, 30),
    start: makeTime(12, 30),
    end: makeTime(14, 30),
    assignedChannels: ['atlas'],
  },
  {
    id: 'g2',
    resourceId: 'g2',
    sport: 'basketball',
    homeTeam: 'Kingsbridge',
    awayTeam: 'Belmont',
    tipOffTime: makeTime(14, 0),
    start: makeTime(14, 0),
    end: makeTime(16, 0),
    assignedChannels: [],
  },
  {
    id: 'g3',
    resourceId: 'g3',
    sport: 'basketball',
    homeTeam: 'Westhaven',
    awayTeam: 'Clearwater',
    tipOffTime: makeTime(15, 30),
    start: makeTime(15, 30),
    end: makeTime(17, 30),
    assignedChannels: ['prime'],
  },
  {
    id: 'g4',
    resourceId: 'g4',
    sport: 'basketball',
    homeTeam: 'Foxcrest',
    awayTeam: 'Norcross',
    tipOffTime: makeTime(17, 0),
    start: makeTime(17, 0),
    end: makeTime(19, 0),
    assignedChannels: [],
  },
  {
    id: 'g5',
    resourceId: 'g5',
    sport: 'hockey',
    homeTeam: 'Ironport',
    awayTeam: 'Blackburn',
    tipOffTime: makeTime(13, 0),
    start: makeTime(13, 0),
    end: makeTime(15, 30),
    assignedChannels: [],
  },
  {
    id: 'g6',
    resourceId: 'g6',
    sport: 'hockey',
    homeTeam: 'Frostpeak',
    awayTeam: 'Silvermoor',
    tipOffTime: makeTime(19, 0),
    start: makeTime(19, 0),
    end: makeTime(21, 30),
    assignedChannels: ['meridian'],
  },
  {
    id: 'g7',
    resourceId: 'g7',
    sport: 'soccer',
    homeTeam: 'Harborlight',
    awayTeam: 'Crestvale',
    tipOffTime: makeTime(15, 0),
    start: makeTime(15, 0),
    end: makeTime(17, 0),
    assignedChannels: [],
  },
  {
    id: 'g8',
    resourceId: 'g8',
    sport: 'soccer',
    homeTeam: 'Stonewall',
    awayTeam: 'Redleaf',
    tipOffTime: makeTime(18, 0),
    start: makeTime(18, 0),
    end: makeTime(20, 0),
    assignedChannels: [],
  },
  {
    id: 'g9',
    resourceId: 'g9',
    sport: 'soccer',
    homeTeam: 'Sunvale',
    awayTeam: 'Gulfport',
    tipOffTime: makeTime(20, 30),
    start: makeTime(20, 30),
    end: makeTime(22, 30),
    assignedChannels: [],
  },
];

export const DEMO_TIME_RANGE = { start: makeTime(12), end: makeTime(24) };
