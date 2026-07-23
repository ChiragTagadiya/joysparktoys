import { supabase } from '../lib/supabase';

const generateOrderNumber = () => {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `JST-${ts}-${rand}`;
};

export const OrdersService = {
  create: async ({ userId, items, address, paymentMethod, subtotal, shipping = 0, total }) => {
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        user_id: userId,
        order_number: generateOrderNumber(),
        items,
        address,
        payment_method: paymentMethod || 'cod',
        status: 'confirmed',
        subtotal,
        shipping,
        total,
      }])
      .select()
      .single();
    return { data, error };
  },

  getByUser: async (userId) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  },

  getAll: async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data || [], error };
  },

  updateStatus: async (id, status) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  updateExpectedDelivery: async (id, expectedDelivery) => {
    const { data, error } = await supabase
      .from('orders')
      .update({ expected_delivery_date: expectedDelivery, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  update: async (id, updates) => {
    const safe = {};
    if (updates?.status !== undefined) safe.status = updates.status;
    if (updates?.expected_delivery_date !== undefined) safe.expected_delivery_date = updates.expected_delivery_date;
    if (updates?.expectedDeliveryDate !== undefined) safe.expected_delivery_date = updates.expectedDeliveryDate;

    const { data, error } = await supabase
      .from('orders')
      .update({ ...safe, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },
};
