import appConfig from '../config/app.config';

export const formatPrice = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: appConfig.currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDiscount = (original, sale) => {
  if (!original || !sale || original <= sale) return 0;
  return Math.round(((original - sale) / original) * 100);
};

export const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatOrderId = (id) => `LJ${String(id).padStart(8, '0')}`;

export const displayOrderNumber = (orderNumber, id) =>
  orderNumber || `JST${String(id || '').slice(-8).toUpperCase()}`;

export const truncateText = (text, maxLength = 60) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

export const slugify = (text) =>
  text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

export const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map((n) => n[0].toUpperCase()).join('');
};
