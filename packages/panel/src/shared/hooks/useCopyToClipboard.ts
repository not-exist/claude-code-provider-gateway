import { useCallback, useEffect, useRef, useState } from "react";

export function useCopyToClipboard(resetMs = 1800) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const copy = useCallback(
    (key: string, text: string) => {
      void navigator.clipboard.writeText(text);
      setCopiedKey(key);
      if (timer.current !== null) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopiedKey(null), resetMs);
    },
    [resetMs],
  );

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  return { copiedKey, copy };
}
