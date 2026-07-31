import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Extra helper client with auto-confirm and admin capabilities to create secondary users (like kitchen staff)
// without logging out the currently logged in admin user.
export const createAdminHelperClient = (url: string, serviceRoleKey: string) => {
  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};
