/**
 * Mobile reads EXPO_PUBLIC_SUPABASE_*; web reads NEXT_PUBLIC_SUPABASE_*.
 * Both must point at the SAME Supabase project — see docs/BUILD_PROMPT.md §4.
 *
 * These must be referenced as full literals (not process.env[key]) so Next can
 * inline them into the client bundle at build time.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? '';
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

/**
 * Mirrors the mobile app's `isSupabaseConfigured` guard. Services fall back to
 * the static catalog in src/constants/products.ts when this is false, so a
 * missing env var degrades gracefully instead of crashing the app.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
