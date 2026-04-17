import { useTimeboardDraggable } from '../src';
import type { Channel } from './demo-data';

export function ChannelChip({ channel, index }: { channel: Channel; index: number }) {
  const { setNodeRef, attributes, listeners, isDragging, dragStyle } = useTimeboardDraggable({
    id: `channel-${channel.id}`,
    data: channel,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="channel-chip"
      style={{
        ...dragStyle,
        ['--i' as string]: index,
        ['--chip-brand' as string]: channel.brandColor,
        opacity: isDragging ? 0.4 : 1,
      }}
    >
      <span className="channel-chip__color" aria-hidden="true" />
      <span className="channel-chip__label">{channel.label}</span>
      <span className="channel-chip__id">CH&nbsp;{channel.id.toUpperCase()}</span>
    </div>
  );
}
