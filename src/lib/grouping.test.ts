import { describe, it, expect } from 'vitest';
import { buildRowPlan } from './grouping';
import type { BaseResource, ResourceGroup } from '../types';

const r = (id: string, groupId?: string): BaseResource => ({
  id,
  label: id.toUpperCase(),
  ...(groupId ? { groupId } : {}),
});

describe('buildRowPlan', () => {
  it('returns empty rows for empty resources with no groups', () => {
    const plan = buildRowPlan([], undefined, new Set());
    expect(plan.rows).toHaveLength(0);
    expect(plan.visibleResources).toHaveLength(0);
  });

  it('renders all resources ungrouped when groups is undefined', () => {
    const plan = buildRowPlan([r('a'), r('b')], undefined, new Set());
    expect(plan.rows).toHaveLength(2);
    expect(plan.rows.every((row) => row.kind === 'resource')).toBe(true);
    expect(plan.visibleResources.map((res) => res.id)).toEqual(['a', 'b']);
  });

  it('renders all resources ungrouped when groups is an empty array', () => {
    const plan = buildRowPlan([r('a'), r('b')], [], new Set());
    expect(plan.rows).toHaveLength(2);
    expect(plan.visibleResources.map((res) => res.id)).toEqual(['a', 'b']);
  });

  it('emits header + members when the group is expanded', () => {
    const groups: ResourceGroup[] = [{ id: 'g1', label: 'Group 1' }];
    const plan = buildRowPlan([r('a', 'g1'), r('b', 'g1')], groups, new Set(['g1']));
    expect(plan.rows).toHaveLength(3);
    expect(plan.rows[0]!.kind).toBe('group-header');
    expect(plan.rows[1]!.kind).toBe('resource');
    expect(plan.rows[2]!.kind).toBe('resource');
    expect(plan.visibleResources.map((res) => res.id)).toEqual(['a', 'b']);
  });

  it('emits header only when the group is collapsed', () => {
    const groups: ResourceGroup[] = [{ id: 'g1', label: 'Group 1' }];
    const plan = buildRowPlan([r('a', 'g1'), r('b', 'g1')], groups, new Set());
    expect(plan.rows).toHaveLength(1);
    expect(plan.rows[0]!.kind).toBe('group-header');
    if (plan.rows[0]!.kind === 'group-header') {
      expect(plan.rows[0]!.isExpanded).toBe(false);
    }
    expect(plan.visibleResources).toHaveLength(0);
  });

  it('emits ungrouped resources before any group headers', () => {
    const groups: ResourceGroup[] = [{ id: 'g1', label: 'G1' }];
    const plan = buildRowPlan(
      [r('grouped', 'g1'), r('ungrouped')],
      groups,
      new Set(['g1']),
    );
    expect(plan.rows[0]!.kind).toBe('resource');
    if (plan.rows[0]!.kind === 'resource') {
      expect(plan.rows[0]!.resource.id).toBe('ungrouped');
    }
    expect(plan.rows[1]!.kind).toBe('group-header');
  });

  it('treats a resource with a groupId not in groups as ungrouped', () => {
    const groups: ResourceGroup[] = [{ id: 'g1', label: 'G1' }];
    const plan = buildRowPlan([r('stray', 'unknown')], groups, new Set(['g1']));
    // 1 ungrouped row + 1 group header for g1 = 2 rows.
    expect(plan.rows).toHaveLength(2);
    expect(plan.rows[0]!.kind).toBe('resource');
    if (plan.rows[0]!.kind === 'resource') {
      expect(plan.rows[0]!.resource.id).toBe('stray');
    }
    expect(plan.rows[1]!.kind).toBe('group-header');
  });

  it('preserves the order of groups as given', () => {
    const groups: ResourceGroup[] = [
      { id: 'z', label: 'Zulu' },
      { id: 'a', label: 'Alpha' },
    ];
    const plan = buildRowPlan<BaseResource>([], groups, new Set());
    const ids = plan.rows.map((row) => {
      if (row.kind === 'group-header') return row.group.id;
      return row.resource.id;
    });
    expect(ids).toEqual(['z', 'a']);
  });

  it('preserves resource order within a group', () => {
    const groups: ResourceGroup[] = [{ id: 'g1', label: 'G1' }];
    const plan = buildRowPlan(
      [r('z', 'g1'), r('m', 'g1'), r('a', 'g1')],
      groups,
      new Set(['g1']),
    );
    expect(plan.visibleResources.map((res) => res.id)).toEqual(['z', 'm', 'a']);
  });

  it('always emits a header row for an empty group', () => {
    const groups: ResourceGroup[] = [{ id: 'g1', label: 'Empty' }];
    const plan = buildRowPlan([], groups, new Set(['g1']));
    expect(plan.rows).toHaveLength(1);
    expect(plan.rows[0]!.kind).toBe('group-header');
  });

  it('mixes ungrouped + expanded + collapsed into one ordered plan', () => {
    const groups: ResourceGroup[] = [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
    ];
    const plan = buildRowPlan(
      [r('u1'), r('a1', 'a'), r('a2', 'a'), r('b1', 'b'), r('b2', 'b')],
      groups,
      new Set(['a']),
    );
    // Expected: ungrouped u1, header A, a1, a2, header B (collapsed). Total 5.
    expect(plan.rows).toHaveLength(5);
    expect(plan.visibleResources.map((res) => res.id)).toEqual(['u1', 'a1', 'a2']);
  });

  it('assigns sequential rowIndex values', () => {
    const groups: ResourceGroup[] = [{ id: 'g1', label: 'G1' }];
    const plan = buildRowPlan(
      [r('u1'), r('a', 'g1'), r('b', 'g1')],
      groups,
      new Set(['g1']),
    );
    expect(plan.rows.map((row) => row.rowIndex)).toEqual([0, 1, 2, 3]);
  });
});
