import { useCallback, useEffect, useState } from "react";

/**
 * Like useState, but persists the value to sessionStorage under `key` so it
 * survives client-side navigation and re-mounts within the same tab/session.
 * Reads happen on mount (after hydration) to avoid SSR hydration mismatches.
 */
export function useSessionState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [value, setValueState] = useState<T>(defaultValue);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(key);
      if (stored !== null) setValueState(JSON.parse(stored) as T);
    } catch {
      // Ignore unavailable/parse errors and fall back to the default.
    }
  }, [key]);

  const setValue = useCallback(
    (next: T) => {
      setValueState(next);
      try {
        sessionStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Ignore write failures (e.g. storage disabled).
      }
    },
    [key],
  );

  return [value, setValue];
}
