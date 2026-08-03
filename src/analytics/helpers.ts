import { IS_BROWSER } from './constants';

/**
 * Generate a unique event_id. Falls back to a timestamp + random string if
 * crypto.randomUUID is unavailable.
 */
export const getEventId = (): string => {
  if (IS_BROWSER && typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch {
      /* fall through */
    }
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

/** Execute a function, swallowing any errors so analytics never crashes the app. */
export const withCatch = (fn: () => void): void => {
  try {
    fn();
  } catch {
    /* analytics failures are intentionally silent */
  }
};
