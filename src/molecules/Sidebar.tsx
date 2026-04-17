import * as React from 'react';
import { ResourceLabel, GroupHeader } from '../atoms';
import type { RowPlanItem } from '../lib/grouping';
import type { BaseResource, ResourceGroup } from '../types';

export interface SidebarProps<TResource extends BaseResource> {
  /** Row-plan items from `buildRowPlan`. Group headers and resources in render order. */
  rows: RowPlanItem<TResource>[];
  /** Parallel to `rows`; pixel height per row. */
  rowHeights: number[];
  renderResource?: (resource: TResource) => React.ReactNode;
  renderGroupHeader?: (group: ResourceGroup, isExpanded: boolean) => React.ReactNode;
  /** Fired when the user activates a group header's chevron. */
  onGroupToggle: (groupId: string) => void;
}

function SidebarImpl<TResource extends BaseResource>({
  rows,
  rowHeights,
  renderResource,
  renderGroupHeader,
  onGroupToggle,
}: SidebarProps<TResource>) {
  return (
    <div
      className="rtb-sidebar"
      style={{
        display: 'grid',
        gridTemplateRows: rowHeights.map((h) => `${h}px`).join(' '),
      }}
    >
      {rows.map((row) => {
        if (row.kind === 'group-header') {
          const customContent = renderGroupHeader
            ? renderGroupHeader(row.group, row.isExpanded)
            : undefined;
          return (
            <GroupHeader
              key={`group-${row.group.id}`}
              groupId={row.group.id}
              label={row.group.label}
              isExpanded={row.isExpanded}
              onToggle={() => onGroupToggle(row.group.id)}
            >
              {customContent}
            </GroupHeader>
          );
        }
        return (
          <ResourceLabel
            key={row.resource.id}
            resourceId={row.resource.id}
            rowIndex={row.rowIndex}
          >
            {renderResource ? renderResource(row.resource) : row.resource.label}
          </ResourceLabel>
        );
      })}
    </div>
  );
}

export const Sidebar = React.memo(SidebarImpl) as typeof SidebarImpl;
