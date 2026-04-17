import { ChannelChip } from './ChannelChip';
import type { Channel } from './demo-data';

export function ChannelSidebar({
  channels,
  unassignedCount,
}: {
  channels: Channel[];
  unassignedCount: number;
}) {
  return (
    <aside className="channel-sidebar">
      <header className="channel-sidebar__header">
        <h2 className="channel-sidebar__title">Channels</h2>
        <p className="channel-sidebar__counter">
          Drag onto the board · {unassignedCount} unassigned
        </p>
      </header>
      <div className="channel-sidebar__list">
        {channels.map((ch, i) => (
          <ChannelChip key={ch.id} channel={ch} index={i} />
        ))}
      </div>
    </aside>
  );
}
