'use client';

import { Languages } from 'lucide-react';
import { useAppLanguage } from '@/i18n/I18nProvider';
import { languages } from '@/i18n';

/**
 * EN / اردو toggle for the top bar.
 *
 * Mobile only offers this inside Profile because switching there required an
 * app restart to flip RTL. On the web the change is instant, so it belongs in
 * the chrome as well — Profile keeps its switcher too.
 */
export const LanguageSwitcher = () => {
  const { language, setLanguage } = useAppLanguage();
  const next = languages.find((option) => option.code !== language) ?? languages[0];

  return (
    <button
      type="button"
      onClick={() => void setLanguage(next.code)}
      aria-label={`Switch to ${next.nativeLabel}`}
      className="flex h-10 items-center gap-1.5 rounded-full px-3 text-xs font-extrabold text-kaam-navy transition-colors hover:bg-kaam-surface"
    >
      <Languages size={17} aria-hidden />
      {next.nativeLabel}
    </button>
  );
};
