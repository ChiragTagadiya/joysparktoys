import { supabase } from '../lib/supabase';

export const AnnouncementsService = {
  getActive: async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    return { data: data || [], error };
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('sort_order', { ascending: true });
    return { data: data || [], error };
  },

  create: async (announcement) => {
    const { data, error } = await supabase
      .from('announcements')
      .insert([{ ...announcement, updated_at: new Date().toISOString() }])
      .select()
      .single();
    return { data, error };
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('announcements')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  delete: async (id) => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    return { error };
  },

  toggleActive: async (id, active) => {
    const { data, error } = await supabase
      .from('announcements')
      .update({ active, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },
};
