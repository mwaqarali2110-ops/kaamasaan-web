import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { supabaseAnonKey, supabaseUrl } from '@/lib/env';

/**
 * Refreshes the Supabase auth session on every request and returns both the
 * response carrying updated cookies and the current user.
 *
 * Used by src/proxy.ts. Kept separate so the proxy file stays a thin router.
 */
export const updateSession = async (request: NextRequest) => {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        }
      }
    }
  );

  // Do not remove: getUser() revalidates the token with Supabase. Reading the
  // session from cookies alone is spoofable and must not be trusted for auth.
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return { response, user };
};
