import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { routes } from '@/constants/routes';

/**
 * Handles Supabase email links (signup confirmation, password recovery).
 *
 * This has no mobile counterpart: the native app sets `detectSessionInUrl: false`
 * and confirms via deep link. On the web the link opens a browser tab, so the
 * token has to be exchanged for a session cookie here.
 *
 * Set this URL as the redirect target in Supabase Auth → URL Configuration:
 *   <site>/auth/confirm
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') ?? routes.home();

  if (!tokenHash || !type) {
    return NextResponse.redirect(
      new URL(routes.login({ message: 'That link is invalid or has expired.' }), request.url)
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  if (error) {
    return NextResponse.redirect(new URL(routes.login({ message: error.message }), request.url));
  }

  // Only same-origin relative paths, so the link cannot be used as an open redirect.
  const destination = next.startsWith('/') ? next : routes.home();
  return NextResponse.redirect(new URL(destination, request.url));
}
