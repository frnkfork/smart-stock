import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Cliente de Supabase para el navegador (Client Components).
 * Se usa para autenticación y persistencia de datos en la nube.
 */
export const supabase = createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
);
