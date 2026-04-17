import type { BroadcastGame, Channel } from './demo-data';

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function GameEventCard({
  game,
  channels,
  onUnassign,
}: {
  game: BroadcastGame;
  channels: Channel[];
  onUnassign: (channelId: string) => void;
}) {
  const isUnassigned = game.assignedChannels.length === 0;
  const assigned = game.assignedChannels
    .map((id) => channels.find((c) => c.id === id))
    .filter((c): c is Channel => c !== undefined);
  const cardClass = isUnassigned
    ? 'game-card game-card--unassigned'
    : 'game-card game-card--assigned';

  return (
    <div className={cardClass}>
      <div className="game-card__header">
        <div className="game-card__matchup">
          {game.awayTeam} <span aria-hidden="true">·</span> {game.homeTeam}
        </div>
        <div className="game-card__time">{formatTime(game.tipOffTime)} ET</div>
      </div>
      {assigned.length > 0 && (
        <div className="game-card__chips">
          {assigned.map((ch) => (
            <div
              key={ch.id}
              className="game-card__chip"
              style={{ ['--chip-brand' as string]: ch.brandColor }}
            >
              <span className="game-card__chip-label">{ch.label}</span>
              <button
                type="button"
                className="game-card__chip-remove"
                aria-label={`Unassign ${ch.label}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onUnassign(ch.id);
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
