import { useCallback, useState } from 'react';
import { ResourceTimeline } from '../src';
import type { BaseResource } from '../src';
import {
  CHANNELS,
  DEMO_TIME_RANGE,
  INITIAL_GAMES,
  SPORT_GROUPS,
} from './demo-data';
import type { BroadcastGame, Channel } from './demo-data';
import { ChannelSidebar } from './ChannelSidebar';
import { GameEventCard } from './GameEventCard';
import { StatusBar } from './StatusBar';
import { Toast } from './Toast';
import { useConflictToast } from './useConflictToast';

function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export interface MarchMadnessDemoProps {
  /**
   * When `true`, a channel can be assigned to multiple games whose time ranges
   * overlap. When `false` (default), overlapping assignments are rejected with
   * a toast.
   *
   * This is a demo-level concern — the library itself has no opinion on
   * conflict semantics; consumers implement the rules they need inside their
   * own `onExternalDrop` handler.
   */
  allowOverlappingChannelAssignments?: boolean;
}

export function MarchMadnessDemo({
  allowOverlappingChannelAssignments = false,
}: MarchMadnessDemoProps) {
  const [games, setGames] = useState<BroadcastGame[]>(INITIAL_GAMES);
  const { toast, showToast } = useConflictToast();

  const handleDrop = useCallback(
    (item: unknown, resourceId: string, _date: Date) => {
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
    [allowOverlappingChannelAssignments, showToast],
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

  // Games are both resources and events. resourceId === game.id === event.id.
  const resources: BaseResource[] = games.map((g) => ({
    id: g.id,
    label: `${g.awayTeam} @ ${g.homeTeam}`,
    groupId: g.sport,
  }));
  const events = games;
  const unassignedCount = games.filter((g) => g.assignedChannels.length === 0).length;

  return (
    <div className="demo-root">
      <ChannelSidebar channels={CHANNELS} unassignedCount={unassignedCount} />
      <div className="demo-stage">
        <StatusBar unassignedCount={unassignedCount} totalCount={games.length} />
        <div className="demo-timeline">
          <ResourceTimeline<BroadcastGame, BaseResource>
            resources={resources}
            events={events}
            groups={SPORT_GROUPS}
            defaultExpandedGroupIds={SPORT_GROUPS.map((g) => g.id)}
            timeRange={DEMO_TIME_RANGE}
            interval="hourly"
            height="calc(100vh - 56px)"
            laneHeight={136}
            rowPadding={6}
            groupHeaderHeight={44}
            onExternalDrop={handleDrop}
            renderEvent={(event) => (
              <GameEventCard
                game={event}
                channels={CHANNELS}
                onUnassign={(channelId) => handleUnassign(event.id, channelId)}
              />
            )}
            ariaLabel="March Madness broadcast schedule"
          />
        </div>
      </div>
      {toast && <Toast message={toast} />}
    </div>
  );
}
