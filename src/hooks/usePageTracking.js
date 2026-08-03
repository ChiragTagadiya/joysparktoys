import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../analytics/events';

/**
 * Track a PageView on every React Router route change.
 * Prevents duplicate PageViews on re-renders (e.g. StrictMode).
 */
const usePageTracking = () => {
  const { pathname } = useLocation();
  const lastPath = useRef('');

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    trackPageView();
  }, [pathname]);
};

export default usePageTracking;
