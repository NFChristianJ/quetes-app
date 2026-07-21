import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    "Supabase n'est pas configuré : crée un fichier .env à partir de .env.example"
  );
}

export const supabase = createClient(url || '', anonKey || '');
