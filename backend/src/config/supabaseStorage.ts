import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseStorage: SupabaseClient | null =
  url && serviceKey ? createClient(url, serviceKey) : null;

export const ensureProductBucket = async () => {
  if (!supabaseStorage) return;
  const { error } = await supabaseStorage.storage.createBucket('product-files', { public: false });
  if (error && !/already exists/i.test(error.message)) {
    console.error('Could not ensure product-files bucket:', error.message);
  }
};
