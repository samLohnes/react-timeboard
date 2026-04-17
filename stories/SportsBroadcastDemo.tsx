import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ResourceTimeline } from '../src';
import type { BaseEvent, BaseResource, ResourceGroup } from '../src';
import {
  CHANNELS,
  DEMO_TIME_RANGE,
  INITIAL_GAMES,
  NETWORK_GROUPS,
  SPORT_GROUPS,
} from './demo-data';
import type { BroadcastGame, Channel } from './demo-data';
import { ChannelBookingCard, type ChannelBooking } from './ChannelBookingCard';
import { ChannelChipOverlay } from './ChannelChip';
import { ChannelLegend } from './ChannelLegend';
import { ChannelSidebar } from './ChannelSidebar';
import { DragPreview } from './DragPreview';
import { GameEventCard } from './GameEventCard';
import { StatusBar } from './StatusBar';
import { Toast } from './Toast';
import { useConflictToast } from './useConflictToast';
import { ViewToggle, type ViewMode } from './ViewToggle';

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export interface SportsBroadcastDemoProps {
  /**
   * Games view only. When `true`, a channel can be assigned to multiple games
   * whose time ranges overlap. When `false` (default), overlapping assignments
   * are rejected with a toast. This is a demo-level concern — the library
   * itself has no opinion on conflict semantics.
   */
  allowOverlappingChannelAssignments?: boolean;
}

interface GamesViewConfig {
  mode: 'games';
  resources: BaseResource[];
  events: BroadcastGame[];
  groups: ResourceGroup[];
  laneHeight: number;
  renderEvent: (event: BroadcastGame) => ReactNode;
}

interface ChannelsViewConfig {
  mode: 'channels';
  resources: BaseResource[];
  events: ChannelBooking[];
  groups: ResourceGroup[];
  laneHeight: number;
  renderEvent: (event: ChannelBooking) => ReactNode;
}

type ViewConfig = GamesViewConfig | ChannelsViewConfig;

export function SportsBroadcastDemo({
  allowOverlappingChannelAssignments = false,
}: SportsBroadcastDemoProps) {
  const [games, setGames] = useState<BroadcastGame[]>(INITIAL_GAMES);
  const [view, setView] = useState<ViewMode>('games');
  const { toast, showToast } = useConflictToast();

  const handleDrop = useCallback(
    (item: unknown, resourceId: string, _date: Date) => {
      // Channels view is read-only — never mutate from a drop there. The drag
      // chips aren't rendered either, so this is defense in depth.
      if (view === 'channels') return;

      const channel = item as Channel | null;
      if (!channel || typeof channel.id !== 'string') return;

      setGames((prev) => {
        const target = prev.find((g) => g.id === resourceId);
        if (!target) return prev;
        if (target.assignedChannels.includes(channel.id)) return prev;

        if (!allowOverlappingChannelAssignments) {
          const conflict = prev.find(
            (g) =>
              g.id !== target.id &&
              g.assignedChannels.includes(channel.id) &&
              g.start < target.end &&
              target.start < g.end,
          );
          if (conflict) {
            showToast(
              `${channel.label} is already broadcasting ${conflict.awayTeam} @ ${conflict.homeTeam} (${formatTime(conflict.start)}–${formatTime(conflict.end)}).`,
            );
            return prev;
          }
        }

        return prev.map((g) =>
          g.id === target.id
            ? { ...g, assignedChannels: [...g.assignedChannels, channel.id] }
            : g,
        );
      });
    },
    [allowOverlappingChannelAssignments, showToast, view],
  );

  const handleUnassign = useCallback((gameId: string, channelId: string) => {
    setGames((prev) =>
      prev.map((g) =>
        g.id === gameId
          ? {
              ...g,
              assignedChannels: g.assignedChannels.filter((id) => id !== channelId),
            }
          : g,
      ),
    );
  }, []);

  // Derive resources, events, groups, and lane height from the current view.
  // The library itself never knows the view changed — it just sees different props.
  const viewConfig = useMemo<ViewConfig>(() => {
    if (view === 'games') {
      const resources: BaseResource[] = games.map((g) => ({
        id: g.id,
        label: `${g.awayTeam} @ ${g.homeTeam}`,
        groupId: g.sport,
      }));
      return {
        mode: 'games',
        resources,
        events: games,
        groups: SPORT_GROUPS,
        laneHeight: 136,
        renderEvent: (event) => (
          <GameEventCard
            game={event}
            channels={CHANNELS}
            onUnassign={(channelId) => handleUnassign(event.id, channelId)}
          />
        ),
      };
    }

    const resources: BaseResource[] = CHANNELS.map((c) => ({
      id: c.id,
      label: c.label,
      groupId: c.network,
    }));
    const bookings: ChannelBooking[] = games.flatMap((g) =>
      g.assignedChannels.map((cid) => ({
        id: `${g.id}-on-${cid}`,
        resourceId: cid,
        start: g.start,
        end: g.end,
        gameId: g.id,
        channelId: cid,
        matchup: `${g.awayTeam} · ${g.homeTeam}`,
        tipOffTime: g.tipOffTime,
        sport: g.sport,
      })),
    );
    return {
      mode: 'channels',
      resources,
      events: bookings,
      groups: NETWORK_GROUPS,
      laneHeight: 56,
      renderEvent: (event) => <ChannelBookingCard booking={event} />,
    };
  }, [view, games, handleUnassign]);

  const unassignedCount = games.filter((g) => g.assignedChannels.length === 0).length;

  const timelineStyle =
    viewConfig.mode === 'channels'
      ? ({ ['--rtb-event-lane-height' as string]: `${viewConfig.laneHeight}px` } as React.CSSProperties)
      : undefined;

  return (
    <div className="demo-root">
      {viewConfig.mode === 'games' ? (
        <ChannelSidebar channels={CHANNELS} unassignedCount={unassignedCount} />
      ) : (
        <ChannelLegend channels={CHANNELS} games={games} />
      )}
      <div className="demo-stage">
        <StatusBar unassignedCount={unassignedCount} totalCount={games.length}>
          <ViewToggle view={view} onChange={setView} />
        </StatusBar>
        <div className="demo-timeline" style={timelineStyle}>
          <ResourceTimeline<BaseEvent, BaseResource>
            resources={viewConfig.resources}
            events={viewConfig.events}
            groups={viewConfig.groups}
            defaultExpandedGroupIds={viewConfig.groups.map((g) => g.id)}
            timeRange={DEMO_TIME_RANGE}
            interval="hourly"
            height="calc(100vh - 56px)"
            laneHeight={viewConfig.laneHeight}
            rowPadding={6}
            groupHeaderHeight={44}
            onExternalDrop={viewConfig.mode === 'games' ? handleDrop : undefined}
            renderEvent={viewConfig.renderEvent as (event: BaseEvent) => ReactNode}
            ariaLabel={
              viewConfig.mode === 'games'
                ? 'Sports broadcast schedule, by game'
                : 'Sports broadcast schedule, by channel'
            }
          />
        </div>
      </div>
      {toast && <Toast message={toast} />}
      <DragPreview<Channel> render={(ch) => <ChannelChipOverlay channel={ch} />} />
    </div>
  );
}
