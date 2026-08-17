'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { DesktopSidebar } from './DesktopSidebar';
import { MobileTabBar } from './MobileTabBar';
import { TopBar } from './TopBar';

/**
 * The authenticated app chrome.
 *
 * Desktop (>= 1024px): persistent left sidebar + top bar.
 * Mobile  (<  1024px): top bar + fixed bottom tab bar, with bottom padding so
 * content is never hidden behind the bar.
 *
 * This is the single shell — screens must not fork into desktop/mobile
 * variants (docs/BUILD_PROMPT.md §6).
 *
 * Three exceptions render with no app chrome at all, each with its own
 * full-bleed visual:
 *  - `/` — the public marketing homepage (ported from kaamasaan-marketing-site).
 *  - `/design/*` — the design wizard, redesigned as a focused, distraction-free
 *    flow (full-bleed home photo + glass card, no sidebar/tab-bar) per the
 *    "classy home + glass card" brief. See WizardShell.tsx.
 *  - `/my-system/summary` — the screen the wizard lands on right after
 *    Packages. It reuses the same full-bleed home photo (see
 *    SystemSummaryView's `SummaryBackdrop`) so the flow doesn't visually
 *    "break" back into the normal sidebar shell at the very last step.
 * Everything else under the (app) group — including public pages like
 * /marketplace — keeps the normal shell.
 */
export const AppShell = ({ children }: { children: ReactNode }) => {
  const pathname = usePathname();
  const chromeless =
    pathname === '/' || pathname.startsWith('/design') || pathname.startsWith('/my-system/summary');
  if (chromeless) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col bg-kaam-cream">
      <TopBar />
      <div className="flex flex-1">
        <DesktopSidebar />
        <main className="min-w-0 flex-1 pb-16 pt-4 lg:pb-8">{children}</main>
      </div>
      <MobileTabBar />
    </div>
  );
};
