import { initClarity } from './clarity';
import { initGA4 } from './ga4';
import { initMetaPixel } from './meta';

export {
  trackAddPaymentInfo,
  trackAddToCart,
  trackAddToWishlist,
  trackInitiateCheckout,
  trackPageView,
  trackPurchase,
  trackSearch,
  trackViewCart,
  trackViewContent,
} from './events';
export type { CartItemLike, OrderLike, ProductLike } from './types';

/** Initialize all analytics scripts once. Call this in main.jsx. */
export const initializeAnalytics = (): void => {
  initMetaPixel();
  initGA4();
  initClarity();
};
