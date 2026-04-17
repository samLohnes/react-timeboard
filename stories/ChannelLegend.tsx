import type { BroadcastGame, Channel } from './demo-data';

/** Read-only sidebar shown in channels view — no drag, just stats. */
export function ChannelLegend({
  channels,
  games,
}: {
  channels: Channel[];
  games: BroadcastGame[];
}) {
  return (
    <aside className="channel-sidebar">
      <header className="channel-sidebar__header">
        <h2 className="channel-sidebar__title">Coverage</h2>
        <p className="channel-sidebar__counter">View by channel · read only</p>
      </header>
      <div className="channel-sidebar__list">
        {channels.map((ch) => {
          const count = games.filter((g) => g.assignedChannels.includes(ch.id)).length;
          return (
            <div
              key={ch.id}
              className="channel-legend-item"
              style={{ ['--chip-brand' as string]: ch.brandColor }}
            >
              <span className="channel-chip__color" aria-hidden="true" />
              <span className="channel-legend-item__label">{ch.label}</span>
              <span className="channel-legend-item__count" aria-label={`${count} games`}>
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
