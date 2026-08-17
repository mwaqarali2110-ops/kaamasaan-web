'use client';

import { useEffect, useState } from 'react';

/**
 * Replaces React Native's `useWindowDimensions` for the few places that need a
 * structural swap rather than a CSS one (bottom sheet vs centred dialog).
 *
 * Prefer Tailwind responsive classes. Reach for this hook only when the two
 * layouts cannot be expressed as the same DOM — see docs/BUILD_PROMPT.md §6.
 *
 * Breakpoints match §6: <768 mobile, 768-1279 tablet, >=1280 desktop.
 */
export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

const query = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1279px)',
  desktop: '(min-width: 1280px)'
} as const;

export const useBreakpoint = (): Breakpoint | null => {
  // null until mounted: the server cannot know the viewport, and guessing
  // causes a hydration mismatch.
  const [breakpoint, setBreakpoint] = useState<Breakpoint | null>(null);

  useEffect(() => {
    const lists = (Object.entries(query) as Array<[Breakpoint, string]>).map(
      ([name, media]) => [name, window.matchMedia(media)] as const
    );

    const sync = () => {
      const match = lists.find(([, list]) => list.matches);
      setBreakpoint(match ? match[0] : 'desktop');
    };

    sync();
    for (const [, list] of lists) list.addEventListener('change', sync);
    return () => {
      for (const [, list] of lists) list.removeEventListener('change', sync);
    };
  }, []);

  return breakpoint;
};

export const useIsMobile = () => useBreakpoint() === 'mobile';
