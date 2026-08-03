// Analytics configuration in one place — edit this file to swap services.
// Environment variables are optional; production-safe defaults are provided.
const importMeta = (import.meta as unknown as { env?: Record<string, string | undefined> }) || {};
const env = importMeta.env || {};

export const IS_BROWSER = typeof window !== 'undefined' && typeof document !== 'undefined';
export const IS_PRODUCTION = env.MODE === 'production';

export const APP_URL = env.VITE_SITE_URL || 'https://joysparktoys.com';
export const CURRENCY: 'INR' = 'INR';
export const META_PIXEL_ID = env.VITE_META_PIXEL_ID || '2505782873168327';
export const META_TEST_EVENT_CODE = env.VITE_META_TEST_EVENT_CODE;
export const GA4_MEASUREMENT_ID = env.VITE_GA4_MEASUREMENT_ID || '';
export const MICROSOFT_CLARITY_ID = env.VITE_MICROSOFT_CLARITY_ID || '';
export const META_CAPI_ENABLED = env.VITE_META_CAPI_ENABLED === 'true';
