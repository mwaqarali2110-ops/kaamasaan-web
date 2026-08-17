'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Hydrates the client-side auth store once per session.
 *
 * Mobile calls `initializeAuth()` in RootNavigator and gates the whole tree on
 * it, because there the store IS the source of truth for route access. On web
 * `src/proxy.ts` has already validated the session server-side before this
 * renders, so the store is only a client-side mirror used for profile data and
 * sign-out — nothing needs to block on it, and there is no loading gate.
 *
 * `bindSupabaseAutoRefresh` has no equivalent: it hooked React Native's
 * AppState, and the browser client refreshes on its own.
 */
export const AuthBootstrap = () => {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return null;
};
