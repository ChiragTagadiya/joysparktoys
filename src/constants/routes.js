export const ROUTES = {
  HOME: '/',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  PROFILE: '/profile',
  ADMIN: '/admin',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_DISCOUNTS: '/admin/discounts',
  REFUND_RETURN_POLICY: '/refund-return-policy',
  PRIVACY_POLICY: '/privacy-policy',
  TERMS_CONDITIONS: '/terms-and-conditions',
  SHIPPING_POLICY: '/shipping-policy',
  CANCELLATION_POLICY: '/cancellation-policy',
};

export const getProductRoute = (id) => `/products/${id}`;
