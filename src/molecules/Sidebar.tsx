import * as React from 'react';
import { ResourceLabel } from '../atoms';
import type { BaseResource } from '../types';

export interface SidebarProps<TResource extends BaseResource> {
  resources: TResource[];
  /** Parallel to `resources`; pixel height per row. */
  rowHeights: number[];
  renderResource?: (resource: TResource) => React.ReactNode;
}

function SidebarImpl<TResource extends BaseResource>({
  resources,
  rowHeights,
  renderResource,
}: SidebarProps<TResource>) {
  return (
    <div
      className="rtb-sidebar"
      style={{
        display: 'grid',
        gridTemplateRows: rowHeights.map((h) => `${h}px`).join(' '),
      }}
    >
      {resources.map((resource, i) => (
        <ResourceLabel key={resource.id} resourceId={resource.id} rowIndex={i}>
          {renderResource ? renderResource(resource) : resource.label}
        </ResourceLabel>
      ))}
    </div>
  );
}

// React.memo erases the generic; cast preserves the signature.
export const Sidebar = React.memo(SidebarImpl) as typeof SidebarImpl;
