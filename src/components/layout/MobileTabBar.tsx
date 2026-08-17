'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import { isDestinationActive, primaryDestinations } from './navigation';

/**
 * Faithful port of the mobile bottom tab bar (< 1024px):
 * 64px tall, white card background, kaam-line top border, amber active tint,
 * 10px extrabold labels — matching the tabBarStyle in RootNavigator.tsx.
 */
export const MobileTabBar = () => {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 h-16 border-t border-kaam-line bg-kaam-card lg:hidden"
    >
      <ul className="flex h-full items-stretch">
        {primaryDestinations.map(({ href, labelKey, icon: Icon }) => {
          const active = isDestinationActive(pathname, href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-full flex-col items-center justify-center gap-1 text-[10px] font-extrabold transition-colors',
                  active ? 'text-kaam-amber' : 'text-kaam-muted'
                )}
              >
                <Icon size={19} aria-hidden />
                {t(labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
