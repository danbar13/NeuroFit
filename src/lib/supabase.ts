import { createClient } from '@supabase/supabase-js';

// Safe fallback for local development or demo environments
const env =
  typeof import.meta !== 'undefined' && import.meta.env
    ? import.meta.env
    : (globalThis as any)?.process?.env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return (
    !!env.VITE_SUPABASE_URL &&
    env.VITE_SUPABASE_URL !== 'https://placeholder-project.supabase.co'
  );
};
