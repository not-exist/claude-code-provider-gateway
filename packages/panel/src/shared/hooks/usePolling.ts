import { useEffect, useRef } from "react";

export function usePolling(
  callback: () => void | Promise<void>,
  intervalMs: number,
  enabled = true,
) {
  const cb = useRef(callback);
  cb.current = callback;

  useEffect(() => {
    if (!enabled) return;
    void cb.current();
    const id = window.setInterval(() => void cb.current(), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, enabled]);
}
