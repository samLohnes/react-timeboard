import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GroupHeader } from './GroupHeader';

describe('GroupHeader', () => {
  it('fires onToggle when the chevron button is clicked', async () => {
    const onToggle = vi.fn();
    render(
      <GroupHeader groupId="g1" label="Basketball" isExpanded onToggle={onToggle} />,
    );
    const button = screen.getByRole('button', { name: 'Collapse Basketball' });
    await userEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('does NOT fire onToggle when the label area is clicked', async () => {
    const onToggle = vi.fn();
    render(
      <GroupHeader
        groupId="g1"
        label="Basketball"
        isExpanded={false}
        onToggle={onToggle}
      />,
    );
    const label = screen.getByText('Basketball');
    await userEvent.click(label);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('swaps the chevron aria-label between Expand and Collapse based on isExpanded', () => {
    const { rerender } = render(
      <GroupHeader groupId="g1" label="Basketball" isExpanded={false} onToggle={() => {}} />,
    );
    expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Expand Basketball');

    rerender(
      <GroupHeader groupId="g1" label="Basketball" isExpanded onToggle={() => {}} />,
    );
    expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Collapse Basketball');
  });

  it('sets aria-expanded on the row and on the chevron button', () => {
    render(
      <GroupHeader groupId="g1" label="Basketball" isExpanded onToggle={() => {}} />,
    );
    expect(screen.getByRole('row').getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('true');
  });

  it('renders custom children inside the label span instead of the default label', () => {
    render(
      <GroupHeader groupId="g1" label="Basketball" isExpanded onToggle={() => {}}>
        <strong>Custom Heading</strong>
      </GroupHeader>,
    );
    expect(screen.getByText('Custom Heading')).toBeTruthy();
    expect(screen.queryByText('Basketball')).toBeNull();
    // Chevron button with aria-label referencing `label` is still present.
    expect(screen.getByRole('button', { name: 'Collapse Basketball' })).toBeTruthy();
  });

  it('activates the chevron via keyboard (Enter/Space) through native button semantics', async () => {
    const onToggle = vi.fn();
    render(
      <GroupHeader groupId="g1" label="Basketball" isExpanded onToggle={onToggle} />,
    );
    const button = screen.getByRole('button');
    button.focus();
    await userEvent.keyboard('{Enter}');
    expect(onToggle).toHaveBeenCalledTimes(1);
    await userEvent.keyboard(' ');
    expect(onToggle).toHaveBeenCalledTimes(2);
  });
});
