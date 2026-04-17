import { useCallback, useEffect, useRef, useState } from 'react';

const TOAST_DURATION_MS = 4000;

/** Non-blocking toast that auto-dismisses. One at a time; a new call replaces the pending one. */
export function useConflictToast() {
  const [toast, setToast] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { toast, showToast };
}
