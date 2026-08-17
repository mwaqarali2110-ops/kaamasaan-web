'use client';

import { createBrowserClient } from '@supabase/ssr';
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from '@/lib/env';

/**
 * Browser-side Supabase client. Replaces kaamasaan-mobile/src/lib/supabase.ts.
 *
 * Differences from mobile:
 *  - Session lives in cookies (via @supabase/ssr) instead of AsyncStorage, so
 *    src/proxy.ts can guard protected routes server-side without a client flash.
 *  - `detectSessionInUrl` is true so Supabase email links (password reset,
 *    email confirmation) resolve on the web. Mobile has this off.
 *  - No AppState auto-refresh binding; the browser client refreshes on its own.
 */
let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export const createClient = () => {
  if (browserClient) return browserClient;

  browserClient = createBrowserClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key'
  );

  return browserClient;
};

export { isSupabaseConfigured };
