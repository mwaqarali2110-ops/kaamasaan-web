'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import { isDestinationActive, primaryDestinations } from './navigation';

/**
 * Desktop replacement for the mobile bottom tab bar (>= 1024px).
 * Same five destinations, amber tint on the active item.
 */
export const DesktopSidebar = () => {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav
      aria-label="Primary"
      className="hidden w-60 shrink-0 border-e border-kaam-line bg-kaam-card lg:flex lg:flex-col"
    >
      <div className="flex flex-col gap-1 p-4">
        {primaryDestinations.map(({ href, labelKey, icon: Icon }) => {
          const active = isDestinationActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-extrabold transition-colors',
                active
                  ? 'bg-kaam-yellow/15 text-kaam-amber'
                  : 'text-kaam-muted hover:bg-kaam-surface hover:text-kaam-navy'
              )}
            >
              <Icon size={19} aria-hidden />
              {t(labelKey)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
