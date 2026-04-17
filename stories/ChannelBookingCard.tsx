import type { BaseEvent } from '../src';
import type { Sport } from './demo-data';

export interface ChannelBooking extends BaseEvent {
  gameId: string;
  channelId: string;
  matchup: string;
  tipOffTime: Date;
  sport: Sport;
}

const SPORT_EMOJI: Record<Sport, string> = {
  basketball: '🏀',
  hockey: '🏒',
  soccer: '⚽',
};

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

/** Compact event card for channels view — one booking per (game, channel) pair. */
export function ChannelBookingCard({ booking }: { booking: ChannelBooking }) {
  return (
    <div className="channel-booking">
      <span className="channel-booking__sport" aria-hidden="true">
        {SPORT_EMOJI[booking.sport]}
      </span>
      <span className="channel-booking__matchup">{booking.matchup}</span>
      <span className="channel-booking__time">{formatTime(booking.tipOffTime)}</span>
    </div>
  );
}
