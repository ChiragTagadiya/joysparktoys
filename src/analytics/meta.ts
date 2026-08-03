import { IS_BROWSER, IS_PRODUCTION, META_PIXEL_ID, META_TEST_EVENT_CODE } from './constants';
import { withCatch } from './helpers';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: (...args: any[]) => void;
  }
}

let isInitialized = false;

const loadScript = (): void => {
  if (!IS_BROWSER || document.getElementById('meta-pixel-script')) return;
  withCatch(() => {
    const script = document.createElement('script');
    script.id = 'meta-pixel-script';
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    const first = document.getElementsByTagName('script')[0];
    first?.parentNode?.insertBefore(script, first);
  });
};

/** Initialize the Meta Pixel once and prevent duplicate loads. */
export const initMetaPixel = (): void => {
  if (!IS_BROWSER || isInitialized) return;
  withCatch(() => {
    const w = window as any;
    if (typeof w.fbq !== 'function') {
      w.fbq = function (...args: any[]) {
        if (w.fbq.callMethod) {
          w.fbq.callMethod.apply(w.fbq, args);
        } else {
          w.fbq.queue.push(args);
        }
      };
      if (!w._fbq) w._fbq = w.fbq;
      w.fbq.push = w.fbq;
      w.fbq.loaded = true;
      w.fbq.version = '2.0';
      w.fbq.queue = [];
    }
    loadScript();
    w.fbq('init', META_PIXEL_ID);
    isInitialized = true;
  });
};

/**
 * Track a Meta Pixel event. The event name is sent as-is after capitalizing
 * the first letter (e.g. "PageView", "AddToCart").
 */
export const trackMeta = (
  eventName: string,
  data: Record<string, any> = {},
  eventId: string
): string => {
  if (!IS_BROWSER) return eventId;
  withCatch(() => {
    const w = window as any;
    if (typeof w.fbq !== 'function') return;
    const options: Record<string, any> = { eventID: eventId };
    if (!IS_PRODUCTION && META_TEST_EVENT_CODE) {
      options.test_event_code = META_TEST_EVENT_CODE;
    }
    const normalized = eventName.charAt(0).toUpperCase() + eventName.slice(1);
    w.fbq('track', normalized, data, options);
  });
  return eventId;
};
