import { useCallback, useEffect, useRef, useState } from "react";

export function useSaveFeedback(resetMs = 2500) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const timer = useRef<number | null>(null);

  const wrap = useCallback(
    async <T>(action: () => Promise<T>): Promise<T | undefined> => {
      setSaving(true);
      try {
        const result = await action();
        setSaved(true);
        if (timer.current !== null) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setSaved(false), resetMs);
        return result;
      } finally {
        setSaving(false);
      }
    },
    [resetMs],
  );

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  return { saving, saved, wrap };
}
