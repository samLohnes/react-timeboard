import { useCallback, useState } from 'react';
import type { BaseEvent } from '../../src';
import { THEME_EVENTS } from './shared-data';

export interface DraggedTemplate {
  id: string;
  label: string;
  durationHours: number;
}

/** Shared state + drop handler for the theme stories. */
export function useThemeDemoState() {
  const [events, setEvents] = useState<BaseEvent[]>(THEME_EVENTS);

  const handleDrop = useCallback(
    (item: unknown, resourceId: string, date: Date) => {
      const template = item as DraggedTemplate | null;
      if (!template || typeof template.label !== 'string') return;
      const start = date;
      const end = new Date(date.getTime() + template.durationHours * 3_600_000);
      const newId = `${template.label}-${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
      setEvents((prev) => [...prev, { id: newId, resourceId, start, end }]);
    },
    [],
  );

  const reset = useCallback(() => setEvents(THEME_EVENTS), []);

  return { events, handleDrop, reset };
}
