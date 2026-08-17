import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';
import { isSupabaseConfigured } from '@/lib/env';

/**
 * Route guard. In Next.js 16 this file is `proxy.ts`, not `middleware.ts`, and
 * the exported function must be named `proxy` (runtime is nodejs, not edge).
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * This is an **allowlist of protected routes**, not a blocklist of public ones.
 *
 * kaamasaan-mobile/src/mobile/navigation/RootNavigator.tsx wraps exactly two
 * things in an auth check — `ProtectedMainTabs` and `ProtectedBookSurveyScreen`.
 * Everything else in the root stack (the design wizard, the smart tools, the
 * service screens, product detail) is reachable without a session on purpose:
 * customers design a system first and are only asked to sign in when they book.
 *
 * Guarding by default inverted that funnel, so the protected set is now listed
 * explicitly and mirrors mobile:
 *   MainTabs  -> /home, /my-system, /my-project, /profile
 *   BookSurvey -> /book-survey
 *
 * `/` itself is the public marketing homepage (ported from
 * kaamasaan-marketing-site) — the authenticated dashboard that mobile calls
 * "Home" now lives at /home instead, so it doesn't collide with the marketing
 * root. `routes.home()` returns /home; nothing here hardcodes the old path.
 *
 * `/marketplace` is a mobile tab but stays public here — it is the app's main
 * SEO surface (documented deviation, PORTING_LOG Phase 5).
 *
 * Note this guard is UX, not security: RLS is what protects data. Public pages
 * that read user-scoped tables simply return nothing when signed out, exactly
 * as they do on mobile.
 */
/**
 * Exact paths, not prefixes.
 *
 * Mobile protects the five tab screens and `BookSurvey` — nothing else. The
 * sub-routes that *look* like they belong to a tab are separate root-stack
 * screens there and are reachable without a session: `/my-system/summary`
 * renders a design held in local state, and `/my-project/journey/[id]` is a
 * pushed screen. Prefix matching would have guarded both, which would block
 * someone from seeing the system they just designed.
 */
const protectedPaths = ['/home', '/my-system', '/my-project', '/profile', '/book-survey'];

const isProtectedPath = (pathname: string) => protectedPaths.includes(pathname);

/** Signed-in users have no reason to see these. */
const authOnlyPaths = ['/login', '/signup', '/welcome'];

export async function proxy(request: NextRequest) {
  // Without Supabase env vars there is no session to check; let the app render
  // its static-catalog fallback rather than redirect-looping to /login.
  if (!isSupabaseConfigured) return NextResponse.next({ request });

  const { response, user } = await updateSession(request);
  const { pathname, search } = request.nextUrl;

  if (!user && isProtectedPath(pathname)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (user && authOnlyPaths.includes(pathname)) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except Next internals and static assets. Image files are
     * excluded so the guard does not run on every asset request.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|ico)$).*)'
  ]
};
