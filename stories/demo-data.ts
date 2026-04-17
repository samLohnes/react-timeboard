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

export const CHANNELS: Channel[] = [
  { id: 'espn', label: 'ESPN', network: 'ESPN', brandColor: '#CC0000' },
  { id: 'espn2', label: 'ESPN2', network: 'ESPN', brandColor: '#7B0000' },
  { id: 'tbs', label: 'TBS', network: 'Turner', brandColor: '#003865' },
  { id: 'tnt', label: 'TNT', network: 'Turner', brandColor: '#E30613' },
  { id: 'cbs', label: 'CBS', network: 'CBS', brandColor: '#003399' },
  { id: 'trutv', label: 'truTV', network: 'Turner', brandColor: '#00A651' },
];

export const SPORT_GROUPS: ResourceGroup[] = [
  { id: 'basketball', label: '🏀 Basketball' },
  { id: 'hockey', label: '🏒 Hockey' },
  { id: 'soccer', label: '⚽ Soccer' },
];

/** Network groups used when the demo is flipped to a channels-per-row view. */
export const NETWORK_GROUPS: ResourceGroup[] = [
  { id: 'ESPN', label: '📡 ESPN' },
  { id: 'Turner', label: '📡 Turner Sports' },
  { id: 'CBS', label: '📡 CBS' },
];

function makeTime(hour: number, minute = 0): Date {
  return new Date(2024, 2, 15, hour, minute);
}

export const INITIAL_GAMES: BroadcastGame[] = [
  {
    id: 'g1',
    resourceId: 'g1',
    sport: 'basketball',
    homeTeam: 'Duke',
    awayTeam: 'Kansas',
    tipOffTime: makeTime(12, 30),
    start: makeTime(12, 30),
    end: makeTime(14, 30),
    assignedChannels: ['espn'],
  },
  {
    id: 'g2',
    resourceId: 'g2',
    sport: 'basketball',
    homeTeam: 'UNC',
    awayTeam: 'Gonzaga',
    tipOffTime: makeTime(14, 0),
    start: makeTime(14, 0),
    end: makeTime(16, 0),
    assignedChannels: [],
  },
  {
    id: 'g3',
    resourceId: 'g3',
    sport: 'basketball',
    homeTeam: 'UCLA',
    awayTeam: 'Arizona',
    tipOffTime: makeTime(15, 30),
    start: makeTime(15, 30),
    end: makeTime(17, 30),
    assignedChannels: ['tbs'],
  },
  {
    id: 'g4',
    resourceId: 'g4',
    sport: 'basketball',
    homeTeam: 'Kentucky',
    awayTeam: 'Purdue',
    tipOffTime: makeTime(17, 0),
    start: makeTime(17, 0),
    end: makeTime(19, 0),
    assignedChannels: [],
  },
  {
    id: 'g5',
    resourceId: 'g5',
    sport: 'hockey',
    homeTeam: 'Rangers',
    awayTeam: 'Bruins',
    tipOffTime: makeTime(13, 0),
    start: makeTime(13, 0),
    end: makeTime(15, 30),
    assignedChannels: [],
  },
  {
    id: 'g6',
    resourceId: 'g6',
    sport: 'hockey',
    homeTeam: 'Maple Leafs',
    awayTeam: 'Canadiens',
    tipOffTime: makeTime(19, 0),
    start: makeTime(19, 0),
    end: makeTime(21, 30),
    assignedChannels: ['tnt'],
  },
  {
    id: 'g7',
    resourceId: 'g7',
    sport: 'soccer',
    homeTeam: 'LAFC',
    awayTeam: 'Seattle',
    tipOffTime: makeTime(15, 0),
    start: makeTime(15, 0),
    end: makeTime(17, 0),
    assignedChannels: [],
  },
  {
    id: 'g8',
    resourceId: 'g8',
    sport: 'soccer',
    homeTeam: 'NYCFC',
    awayTeam: 'Atlanta',
    tipOffTime: makeTime(18, 0),
    start: makeTime(18, 0),
    end: makeTime(20, 0),
    assignedChannels: [],
  },
  {
    id: 'g9',
    resourceId: 'g9',
    sport: 'soccer',
    homeTeam: 'Portland',
    awayTeam: 'San Jose',
    tipOffTime: makeTime(20, 30),
    start: makeTime(20, 30),
    end: makeTime(22, 30),
    assignedChannels: [],
  },
];

export const DEMO_TIME_RANGE = { start: makeTime(12), end: makeTime(24) };
