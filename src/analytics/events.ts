import { supabase } from '../lib/supabase';
import { CURRENCY, IS_BROWSER, META_CAPI_ENABLED } from './constants';
import { trackGA4 } from './ga4';
import { getEventId, withCatch } from './helpers';
import { trackMeta } from './meta';
import type { CartItemLike, OrderLike, ProductLike } from './types';

const toMetaContents = (items: CartItemLike[]) =>
  items.map((it) => ({
    id: it.id,
    quantity: it.quantity || 1,
    item_price: it.price,
  }));

const toGA4Items = (items: CartItemLike[]) =>
  items.map((it) => ({
    item_id: it.id,
    item_name: it.name,
    item_category: it.category,
    item_brand: it.brand,
    price: it.price,
    quantity: it.quantity || 1,
  }));

const getContentIds = (items: CartItemLike[]) => items.map((it) => it.id);

const getNumItems = (items: CartItemLike[]) =>
  items.reduce((sum, it) => sum + (it.quantity || 1), 0);

const getCartValue = (items: CartItemLike[]) =>
  items.reduce((sum, it) => sum + it.price * (it.quantity || 1), 0);

/** Send a server-side copy of the event to the Supabase Conversion API Edge Function. */
const sendCapi = async (
  eventName: string,
  eventId: string,
  user: Record<string, any> = {},
  customData: Record<string, any> = {}
) => {
  if (!IS_BROWSER || !META_CAPI_ENABLED) return;
  try {
    await supabase.functions.invoke('meta-conversion-api', {
      body: {
        event_name: eventName,
        event_id: eventId,
        user,
        custom_data: {
          ...customData,
          event_source_url: window.location.href,
        },
      },
    });
  } catch {
    /* Conversion API is best-effort; failures are ignored. */
  }
};

/** Track a page view on every React Router route change. */
export const trackPageView = (): string => {
  const eventId = getEventId();
  if (!IS_BROWSER) return eventId;
  withCatch(() => {
    trackMeta('PageView', {}, eventId);
    trackGA4('page_view', {
      page_location: window.location.href,
      page_title: document.title,
    });
    sendCapi('PageView', eventId, {}, {});
  });
  return eventId;
};

/** Track viewing a product detail page. */
export const trackViewContent = (product: ProductLike): string => {
  const eventId = getEventId();
  if (!product) return eventId;
  const data = {
    content_ids: [product.id],
    content_type: 'product',
    content_name: product.name,
    content_category: product.category,
    currency: CURRENCY,
    value: product.price,
    contents: [{ id: product.id, quantity: 1, item_price: product.price }],
    num_items: 1,
  };
  withCatch(() => {
    trackMeta('ViewContent', data, eventId);
    trackGA4('view_item', {
      currency: CURRENCY,
      value: product.price,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          item_brand: product.brand,
          price: product.price,
          quantity: 1,
        },
      ],
    });
    sendCapi('ViewContent', eventId, {}, data);
  });
  return eventId;
};

/** Track a search query. */
export const trackSearch = (searchTerm: string): string => {
  const eventId = getEventId();
  const data = {
    search_string: searchTerm,
    currency: CURRENCY,
    value: 0,
    content_ids: [],
    content_type: 'product',
    num_items: 0,
  };
  withCatch(() => {
    trackMeta('Search', data, eventId);
    trackGA4('search', { search_term: searchTerm });
    sendCapi('Search', eventId, {}, data);
  });
  return eventId;
};

/** Track adding an item to the wishlist. */
export const trackAddToWishlist = (product: ProductLike): string => {
  const eventId = getEventId();
  if (!product) return eventId;
  const data = {
    content_ids: [product.id],
    content_type: 'product',
    content_name: product.name,
    content_category: product.category,
    currency: CURRENCY,
    value: product.price,
    contents: [{ id: product.id, quantity: 1, item_price: product.price }],
    num_items: 1,
  };
  withCatch(() => {
    trackMeta('AddToWishlist', data, eventId);
    sendCapi('AddToWishlist', eventId, {}, data);
  });
  return eventId;
};

/** Track adding an item to the cart. */
export const trackAddToCart = (product: ProductLike, quantity = 1): string => {
  const eventId = getEventId();
  if (!product) return eventId;
  const qty = Math.max(1, quantity);
  const data = {
    content_ids: [product.id],
    content_type: 'product',
    content_name: product.name,
    content_category: product.category,
    currency: CURRENCY,
    value: product.price * qty,
    contents: [{ id: product.id, quantity: qty, item_price: product.price }],
    num_items: qty,
  };
  withCatch(() => {
    trackMeta('AddToCart', data, eventId);
    trackGA4('add_to_cart', {
      currency: CURRENCY,
      value: product.price * qty,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          item_brand: product.brand,
          price: product.price,
          quantity: qty,
        },
      ],
    });
    sendCapi('AddToCart', eventId, {}, data);
  });
  return eventId;
};

/** Track opening the cart drawer. */
export const trackViewCart = (cart: CartItemLike[]): string => {
  const eventId = getEventId();
  const items = cart || [];
  const value = getCartValue(items);
  const data = {
    content_ids: getContentIds(items),
    content_type: 'product',
    content_name: items.length ? items[0].name : 'Cart',
    currency: CURRENCY,
    value,
    contents: toMetaContents(items),
    num_items: getNumItems(items),
  };
  withCatch(() => {
    trackMeta('ViewCart', data, eventId);
    sendCapi('ViewCart', eventId, {}, data);
  });
  return eventId;
};

/** Track proceeding to checkout. */
export const trackInitiateCheckout = (
  cart: CartItemLike[],
  value?: number
): string => {
  const eventId = getEventId();
  const items = cart || [];
  const total = value !== undefined ? value : getCartValue(items);
  const data = {
    content_ids: getContentIds(items),
    content_type: 'product',
    content_name: items.length ? items[0].name : 'Checkout',
    currency: CURRENCY,
    value: total,
    contents: toMetaContents(items),
    num_items: getNumItems(items),
  };
  withCatch(() => {
    trackMeta('InitiateCheckout', data, eventId);
    trackGA4('begin_checkout', {
      currency: CURRENCY,
      value: total,
      items: toGA4Items(items),
    });
    sendCapi('InitiateCheckout', eventId, {}, data);
  });
  return eventId;
};

/** Track payment information being added. */
export const trackAddPaymentInfo = (order: OrderLike): string => {
  const eventId = getEventId();
  const items = order?.items || [];
  const data = {
    content_ids: getContentIds(items),
    content_type: 'product',
    content_name: items.length ? items[0].name : 'Payment',
    currency: CURRENCY,
    value: order?.total ?? getCartValue(items),
    contents: toMetaContents(items),
    num_items: getNumItems(items),
    payment_method: order?.paymentMethod || order?.payment_method,
  };
  withCatch(() => {
    trackMeta('AddPaymentInfo', data, eventId);
    sendCapi('AddPaymentInfo', eventId, { email: order?.address?.email, phone: order?.address?.phone }, data);
  });
  return eventId;
};

/** Track a completed purchase. */
export const trackPurchase = (order: OrderLike): string => {
  const eventId = getEventId();
  const items = order?.items || [];
  const value = order?.total ?? getCartValue(items);
  const data = {
    content_ids: getContentIds(items),
    content_type: 'product',
    content_name: items.length ? items[0].name : 'Purchase',
    currency: CURRENCY,
    value,
    contents: toMetaContents(items),
    num_items: getNumItems(items),
    order_id: order?.order_number || order?.id,
  };
  withCatch(() => {
    trackMeta('Purchase', data, eventId);
    trackGA4('purchase', {
      transaction_id: order?.order_number || order?.id,
      currency: CURRENCY,
      value,
      tax: 0,
      shipping: order?.shipping ?? 0,
      items: toGA4Items(items),
    });
    sendCapi('Purchase', eventId, { email: order?.address?.email, phone: order?.address?.phone }, data);
  });
  return eventId;
};
