import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../analytics/events';

let lastTrackedPath = '';
let lastTrackedAt = 0;
const DEDUP_MS = 500;

/**
 * Track a PageView on every React Router route change.
 * Prevents duplicate PageViews on re-renders (e.g. StrictMode).
 */
const usePageTracking = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const now = Date.now();
    if (pathname === lastTrackedPath && now - lastTrackedAt < DEDUP_MS) return;
    lastTrackedPath = pathname;
    lastTrackedAt = now;
    trackPageView();
  }, [pathname]);
};

export default usePageTracking;
