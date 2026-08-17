import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from '@/lib/env';

/**
 * Server-side Supabase client for Server Components, Route Handlers and Server
 * Actions. Always uses the anon key so every query runs under the signed-in
 * customer's RLS policies — never introduce a service-role client here.
 *
 * `cookies()` is async in Next.js 16, so this factory is async too.
 */
export const createClient = async () => {
  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component, which cannot write cookies.
            // src/proxy.ts refreshes the session on every request, so this is safe to ignore.
          }
        }
      }
    }
  );
};

export { isSupabaseConfigured };
