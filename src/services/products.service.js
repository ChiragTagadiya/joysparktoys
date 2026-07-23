import { supabase } from '../lib/supabase';

// DB (snake_case) → JS (camelCase)
const fromDb = (row) => {
  if (!row) return null;
  return {
    ...row,
    originalPrice: row.original_price,
    ageGroup: row.age_group,
    reviewCount: row.review_count,
    bestSeller: row.best_seller,
    newArrival: row.new_arrival,
    discountStart: row.discount_start,
    discountEnd: row.discount_end,
    discountLabel: row.discount_label,
  };
};

// JS (camelCase) → DB (snake_case)
const toDb = (p) => ({
  name: p.name,
  description: p.description || '',
  price: Number(p.price),
  original_price: p.originalPrice ? Number(p.originalPrice) : null,
  category: p.category,
  brand: p.brand || null,
  age_group: p.ageGroup || null,
  stock: Number(p.stock) || 0,
  images: Array.isArray(p.images)
    ? p.images
    : String(p.images || '').split(',').map((s) => s.trim()).filter(Boolean),
  tags: Array.isArray(p.tags)
    ? p.tags
    : String(p.tags || '').split(',').map((s) => s.trim()).filter(Boolean),
  featured: Boolean(p.featured),
  best_seller: Boolean(p.bestSeller),
  new_arrival: Boolean(p.newArrival),
  discount_start: p.discountStart || null,
  discount_end: p.discountEnd || null,
  discount_label: p.discountLabel || null,
});

// Utility: is product currently within its scheduled sale window?
export const isOnSale = (product) => {
  if (!product?.discountStart || !product?.discountEnd) return false;
  const now = Date.now();
  return now >= new Date(product.discountStart).getTime() && now <= new Date(product.discountEnd).getTime();
};

export const ProductsService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: (data || []).map(fromDb), error };
  },

  getById: async (id) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    return { data: fromDb(data), error };
  },

  create: async (product) => {
    const { data, error } = await supabase
      .from('products')
      .insert([toDb(product)])
      .select()
      .single();
    return { data: fromDb(data), error };
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('products')
      .update({ ...toDb(updates), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data: fromDb(data), error };
  },

  delete: async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    return { error };
  },

  bulkUpdateDiscount: async (ids, { discountPct, discountLabel, discountStart, discountEnd }) => {
    const results = await Promise.all(
      ids.map(async (id) => {
        const { data: current } = await supabase
          .from('products').select('original_price, price').eq('id', id).single();
        const base = current?.original_price || current?.price || 0;
        const newPrice = discountPct > 0 ? Math.round(base * (1 - discountPct / 100)) : undefined;
        const updates = {
          discount_label: discountLabel || null,
          discount_start: discountStart || null,
          discount_end: discountEnd || null,
          updated_at: new Date().toISOString(),
          ...(newPrice !== undefined ? { price: newPrice } : {}),
        };
        return supabase.from('products').update(updates).eq('id', id);
      })
    );
    const error = results.find((r) => r.error)?.error || null;
    return { error };
  },

  clearDiscount: async (id) => {
    const { data: current } = await supabase
      .from('products').select('original_price').eq('id', id).single();
    const updates = {
      discount_label: null,
      discount_start: null,
      discount_end: null,
      updated_at: new Date().toISOString(),
      ...(current?.original_price ? { price: current.original_price } : {}),
    };
    const { error } = await supabase.from('products').update(updates).eq('id', id);
    return { error };
  },
};
