import { useTimeboardDraggable } from '../src';
import type { Channel } from './demo-data';

function ChannelChipContent({ channel }: { channel: Channel }) {
  return (
    <>
      <span className="channel-chip__color" aria-hidden="true" />
      <span className="channel-chip__label">{channel.label}</span>
      <span className="channel-chip__id">CH&nbsp;{channel.id.toUpperCase()}</span>
    </>
  );
}

export function ChannelChip({ channel, index }: { channel: Channel; index: number }) {
  const { setNodeRef, attributes, listeners, isDragging } = useTimeboardDraggable({
    id: `channel-${channel.id}`,
    data: channel,
  });
  // No inline transform — DragOverlay handles motion. The source chip stays
  // in place and fades, leaving a visible "slot" while dragging.
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="channel-chip"
      style={{
        ['--i' as string]: index,
        ['--chip-brand' as string]: channel.brandColor,
        opacity: isDragging ? 0.3 : 1,
      }}
    >
      <ChannelChipContent channel={channel} />
    </div>
  );
}

/**
 * Presentation-only chip rendered inside `<DragOverlay>` so the preview
 * follows the cursor above all other content.
 */
export function ChannelChipOverlay({ channel }: { channel: Channel }) {
  return (
    <div
      className="channel-chip channel-chip--dragging"
      style={{ ['--chip-brand' as string]: channel.brandColor }}
    >
      <ChannelChipContent channel={channel} />
    </div>
  );
}
