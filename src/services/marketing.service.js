import { supabase } from '../lib/supabase';

// DB (snake_case) → JS (camelCase)
const fromDb = (row) => ({
  id: row.id,
  type: row.type,
  src: row.src,
  poster: row.poster,
  title: row.title,
  subtitle: row.subtitle,
  cta: row.cta,
  link: row.link,
  displayOrder: row.display_order,
  isActive: row.is_active,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// JS (camelCase) → DB (snake_case)
const toDb = (p) => ({
  type: p.type,
  src: p.src,
  poster: p.poster || null,
  title: p.title,
  subtitle: p.subtitle || '',
  cta: p.cta || 'Shop Now',
  link: p.link || '/products',
  display_order: Number(p.displayOrder) || 0,
  is_active: p.isActive !== false,
});

export const MarketingService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('marketing_carousel')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    return { data: (data || []).map(fromDb), error };
  },

  getAdminAll: async () => {
    const { data, error } = await supabase
      .from('marketing_carousel')
      .select('*')
      .order('display_order', { ascending: true });
    return { data: (data || []).map(fromDb), error };
  },

  create: async (item) => {
    const { data, error } = await supabase
      .from('marketing_carousel')
      .insert([toDb(item)])
      .select()
      .single();
    return { data: fromDb(data), error };
  },

  update: async (id, item) => {
    const { data, error } = await supabase
      .from('marketing_carousel')
      .update({ ...toDb(item), updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data: fromDb(data), error };
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('marketing_carousel')
      .delete()
      .eq('id', id);
    return { error };
  },
};
