import { IS_BROWSER, IS_PRODUCTION, MICROSOFT_CLARITY_ID } from './constants';
import { withCatch } from './helpers';

let isClarityLoaded = false;

/** Load Microsoft Clarity only in production. */
export const initClarity = (): void => {
  if (!IS_BROWSER || isClarityLoaded || !MICROSOFT_CLARITY_ID || !IS_PRODUCTION) return;
  withCatch(() => {
    const w = window as any;
    w.clarity =
      w.clarity ||
      function () {
        (w.clarity.q = w.clarity.q || []).push(arguments);
      };
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.clarity.ms/tag/${MICROSOFT_CLARITY_ID}`;
    document.head.appendChild(script);
    isClarityLoaded = true;
  });
};
