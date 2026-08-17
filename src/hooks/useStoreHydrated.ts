'use client';

import { useSyncExternalStore } from 'react';
import { useSystemStore } from '@/store/useSystemStore';

/**
 * True once `useSystemStore` has rehydrated from localStorage.
 *
 * The server cannot read localStorage, so the first render always sees the
 * store's initial state. Any UI derived from persisted values must wait for
 * this or React reports a hydration mismatch — the web-specific hazard flagged
 * in BUILD_PROMPT §9.
 *
 * `useSyncExternalStore` is the right primitive here: hydration status *is*
 * external store state, and the server snapshot is always `false`, which is
 * exactly what the server should render.
 *
 * `useAppStore` already exposes its own `hasHydrated` flag (ported from mobile);
 * `useSystemStore` does not, so this reads the persist API rather than changing
 * the ported store's shape.
 */
const subscribe = (onStoreChange: () => void) =>
  useSystemStore.persist.onFinishHydration(onStoreChange);

const getSnapshot = () => useSystemStore.persist.hasHydrated();

const getServerSnapshot = () => false;

export const useSystemStoreHydrated = () =>
  useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
