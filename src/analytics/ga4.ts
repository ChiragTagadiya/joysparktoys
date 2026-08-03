import { GA4_MEASUREMENT_ID, IS_BROWSER } from './constants';
import { withCatch } from './helpers';

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

let isGA4Initialized = false;

/** Lazy-load GA4 script only in the browser. */
export const initGA4 = (): void => {
  if (!IS_BROWSER || isGA4Initialized || !GA4_MEASUREMENT_ID) return;
  withCatch(() => {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer!.push(arguments);
    };
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
    document.head.appendChild(script);
    window.gtag('js', new Date());
    window.gtag('config', GA4_MEASUREMENT_ID, { send_page_view: false });
    isGA4Initialized = true;
  });
};

/** Track a GA4 event with the configured measurement ID. */
export const trackGA4 = (event: string, params: Record<string, any> = {}): void => {
  if (!IS_BROWSER) return;
  const gtag = window.gtag;
  if (!gtag) return;
  withCatch(() => {
    if (GA4_MEASUREMENT_ID) {
      params.send_to = GA4_MEASUREMENT_ID;
    }
    gtag('event', event, params);
  });
};
