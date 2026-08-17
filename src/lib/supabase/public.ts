import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { supabaseAnonKey, supabaseUrl } from '@/lib/env';

/**
 * Cookie-less anonymous client for **public catalog data** (products, brands,
 * families, package templates).
 *
 * Why this exists alongside `server.ts`:
 *  - `server.ts` binds to the request's cookies so queries run as the signed-in
 *    customer. That is required for user data, but it makes the call a dynamic,
 *    uncacheable data source — `unstable_cache` explicitly forbids reading
 *    `cookies()` inside a cache scope.
 *  - The catalog is identical for every visitor and readable by `anon` under
 *    RLS, so binding it to a session buys nothing and blocks caching.
 *
 * Still the anon key — this is not a privilege escalation, just a session-free
 * client. Never use it for anything user-scoped.
 */
export const createPublicClient = () =>
  createSupabaseClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key',
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
