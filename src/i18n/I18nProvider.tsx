'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import i18n, {
  changeLanguage,
  currentLanguage,
  getStoredLanguage,
  isRTL,
  normalizeLanguage,
  type AppLanguage
} from './index';

/**
 * Ported from kaamasaan-mobile/src/i18n/I18nProvider.tsx.
 *
 * Deviations:
 *  - No loading screen. Mobile blocks render until `initI18n()` resolves; here
 *    the server already picked the language from the cookie and i18next is
 *    initialised at import, so there is nothing to wait for.
 *  - `restartRequired` is gone. It existed only because RN's
 *    `I18nManager.forceRTL` needs an app restart; the web flips `dir` live.
 */
type LanguageContextValue = {
  language: AppLanguage;
  rtl: boolean;
  setLanguage: (language: AppLanguage) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export const I18nProvider = ({
  children,
  initialLanguage
}: {
  children: ReactNode;
  /** Resolved server-side from the cookie so the first paint matches. */
  initialLanguage: AppLanguage;
}) => {
  const [language, setLanguageState] = useState<AppLanguage>(initialLanguage);

  // Align the i18next instance with the server's choice before first paint.
  if (currentLanguage() !== initialLanguage) {
    void i18n.changeLanguage(initialLanguage);
  }

  useEffect(() => {
    // A localStorage-only preference (cookie blocked or cleared) still wins.
    const stored = getStoredLanguage();
    if (stored && stored !== language) {
      void changeLanguage(stored).then(() => setLanguageState(stored));
    }
  }, [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      rtl: isRTL(language),
      setLanguage: async (nextLanguage) => {
        await changeLanguage(nextLanguage);
        setLanguageState(normalizeLanguage(nextLanguage));
      }
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useAppLanguage = () => {
  const value = useContext(LanguageContext);
  if (!value) throw new Error('useAppLanguage must be used inside I18nProvider');
  return value;
};
