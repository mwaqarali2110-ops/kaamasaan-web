'use client';

import Link from 'next/link';
import { Bell, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { routes } from '@/constants/routes';
import { LanguageSwitcher } from './LanguageSwitcher';

/**
 * Desktop/tablet top bar: logo, marketplace search, language switcher,
 * notification bell, account menu.
 *
 * Search and the unread badge are wired up in Phases 5 and 11.
 */
export const TopBar = () => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 border-b border-kaam-line bg-kaam-card/95 backdrop-blur">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        <Link href={routes.home()} className="text-lg font-extrabold text-kaam-navy">
          {t('common.appName')}
        </Link>

        <div className="hidden flex-1 md:block">
          <div className="relative max-w-md">
            <Search
              size={16}
              className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-kaam-muted"
              aria-hidden
            />
            {/* TODO(Phase 5): wire to marketplace search. */}
            <input
              type="search"
              aria-label={t('marketplace.searchPlaceholder')}
              placeholder={t('marketplace.searchPlaceholder')}
              className="h-10 w-full rounded-2xl border border-kaam-line bg-kaam-surface ps-9 pe-3 text-sm text-kaam-navy placeholder:text-kaam-muted"
            />
          </div>
        </div>

        <div className="ms-auto flex items-center gap-1">
          <LanguageSwitcher />
          {/* TODO(Phase 11): unread count badge. */}
          <Link
            href={routes.notifications()}
            aria-label={t('notifications.title')}
            className="flex h-10 w-10 items-center justify-center rounded-full text-kaam-navy transition-colors hover:bg-kaam-surface"
          >
            <Bell size={19} aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  );
};
