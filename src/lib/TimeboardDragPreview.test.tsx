import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DndContext } from '@dnd-kit/core';
import { TimeboardDragPreview } from './TimeboardDragPreview';

describe('TimeboardDragPreview', () => {
  it('renders no preview content when nothing is being dragged', () => {
    render(
      <DndContext>
        <TimeboardDragPreview<string>
          render={(s) => <div data-testid="preview">preview: {s}</div>}
        />
      </DndContext>,
    );
    expect(screen.queryByTestId('preview')).toBeNull();
  });
});
