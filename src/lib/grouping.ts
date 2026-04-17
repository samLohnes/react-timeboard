import type { BaseResource, ResourceGroup } from '../types';

/** A single row in the rendered grid — either a resource row or a group header row. */
export type RowPlanItem<TResource extends BaseResource> =
  | { kind: 'resource'; resource: TResource; rowIndex: number }
  | { kind: 'group-header'; group: ResourceGroup; isExpanded: boolean; rowIndex: number };

export interface RowPlan<TResource extends BaseResource> {
  /** All rows to render in top-to-bottom order. */
  rows: RowPlanItem<TResource>[];
  /** The subset of resources currently visible (ungrouped + members of expanded groups). */
  visibleResources: TResource[];
}

/**
 * Given resources, groups, and the current expansion state, produces the ordered
 * list of rows to render.
 *
 * Ordering rules:
 * 1. Ungrouped resources (no groupId, or a groupId not in `groups`) appear FIRST in array order.
 * 2. Groups appear in the order given by `groups`.
 * 3. Resources within a group appear in the order they occur in `resources`.
 * 4. A group's header row is always present (even when collapsed or empty).
 * 5. Members of collapsed groups are omitted from both `rows` and `visibleResources`.
 *
 * `buildRowPlan` is pure; consumer-side memoization (the organism) is responsible
 * for skipping recomputation when inputs are unchanged.
 */
export function buildRowPlan<TResource extends BaseResource>(
  resources: TResource[],
  groups: ResourceGroup[] | undefined,
  expandedGroupIds: Set<string>,
): RowPlan<TResource> {
  const rows: RowPlanItem<TResource>[] = [];
  const visibleResources: TResource[] = [];

  if (!groups || groups.length === 0) {
    for (const resource of resources) {
      rows.push({ kind: 'resource', resource, rowIndex: rows.length });
      visibleResources.push(resource);
    }
    return { rows, visibleResources };
  }

  const groupIdSet = new Set(groups.map((g) => g.id));
  const ungrouped: TResource[] = [];
  const byGroup = new Map<string, TResource[]>();

  for (const resource of resources) {
    if (resource.groupId && groupIdSet.has(resource.groupId)) {
      const list = byGroup.get(resource.groupId);
      if (list) {
        list.push(resource);
      } else {
        byGroup.set(resource.groupId, [resource]);
      }
    } else {
      ungrouped.push(resource);
    }
  }

  for (const resource of ungrouped) {
    rows.push({ kind: 'resource', resource, rowIndex: rows.length });
    visibleResources.push(resource);
  }

  for (const group of groups) {
    const isExpanded = expandedGroupIds.has(group.id);
    rows.push({ kind: 'group-header', group, isExpanded, rowIndex: rows.length });
    if (isExpanded) {
      const members = byGroup.get(group.id) ?? [];
      for (const resource of members) {
        rows.push({ kind: 'resource', resource, rowIndex: rows.length });
        visibleResources.push(resource);
      }
    }
  }

  return { rows, visibleResources };
}
