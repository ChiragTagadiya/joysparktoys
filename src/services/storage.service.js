import { supabase } from '../lib/supabase';

const BUCKET = 'assets';

export const StorageService = {
  uploadImage: async (file, folder = 'products') => {
    const ext = file.name.split('.').pop().toLowerCase();
    const safeName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(safeName, file, { cacheControl: '3600', upsert: false });

    if (uploadError) return { url: null, path: null, error: uploadError };

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(safeName);
    return { url: data.publicUrl, path: safeName, error: null };
  },

  deleteFile: async (path) => {
    const { error } = await supabase.storage.from(BUCKET).remove([path]);
    return { error };
  },

  getPublicUrl: (path) => {
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  },
};
