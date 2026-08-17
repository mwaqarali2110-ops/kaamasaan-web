import type { Metadata } from 'next';
import { LoginForm } from '@/features/auth/LoginForm';

export const metadata: Metadata = { title: 'Sign in' };

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/auth/LoginScreen.tsx.
 *
 * `route.params.redirectTo` / `route.params.message` become search params —
 * `src/proxy.ts` sets `redirectTo` when it turns an unauthenticated visitor
 * away, and signup sets `message` after account creation.
 */
export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const params = await searchParams;
  const redirectTo = typeof params.redirectTo === 'string' ? params.redirectTo : undefined;
  const message = typeof params.message === 'string' ? params.message : undefined;

  return <LoginForm redirectTo={redirectTo} message={message} />;
}
