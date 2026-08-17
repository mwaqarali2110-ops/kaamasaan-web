import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ur from './locales/ur.json';
import {
  LANGUAGE_COOKIE_MAX_AGE,
  LANGUAGE_STORAGE_KEY,
  isRTL as isRTLFor,
  normalizeLanguage,
  type AppLanguage
} from './language';

/**
 * i18n singleton. Ported from kaamasaan-mobile/src/i18n/index.ts.
 *
 * Initialised synchronously at import so modules that call `i18n.t()` outside
 * React (stores, services, schema factories) get real strings rather than raw
 * keys — mobile relied on `initI18n()` being awaited before render, which SSR
 * cannot promise.
 *
 * ⚠️ This module imports `initReactI18next`, which calls `React.createContext`
 * at module scope. **Server Components must import from './language' instead.**
 *
 * Storage differs from mobile: the preference lives in a **cookie**, not
 * AsyncStorage, so the server can read it while rendering and emit the correct
 * `<html lang dir>` on the first byte. A localStorage mirror is kept for
 * environments where cookies are blocked.
 */
export {
  LANGUAGE_STORAGE_KEY,
  languages,
  normalizeLanguage,
  type AppLanguage
} from './language';

export const isRTL = (language: string = i18n.language) => isRTLFor(language);

/** Reads the stored preference in the browser (cookie first, then localStorage). */
export const getStoredLanguage = (): AppLanguage | null => {
  if (typeof document === 'undefined') return null;

  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${LANGUAGE_STORAGE_KEY}=`))
    ?.split('=')[1];
  if (cookie === 'ur' || cookie === 'en') return cookie;

  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'ur' || stored === 'en') return stored;
  } catch {
    // Storage can be blocked; fall through to the device suggestion.
  }
  return null;
};

/** Mirrors mobile's expo-localization device check. */
export const getDeviceSuggestion = (): AppLanguage => {
  if (typeof navigator === 'undefined') return 'en';
  const locales = [navigator.language, ...(navigator.languages ?? [])];
  return locales.some((locale) => locale?.toLowerCase().startsWith('ur')) ? 'ur' : 'en';
};

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    resources: {
      en: { translation: en },
      ur: { translation: ur }
    },
    returnNull: false,
    // No Suspense: schemas and stores read translations outside the React tree.
    react: { useSuspense: false }
  });
}

/**
 * Applies a language everywhere it matters: i18next, both storages, and the
 * document direction.
 *
 * Unlike mobile — where `I18nManager.forceRTL` needs an app restart, hence
 * `profile.restartRequired` — the web switch is instant.
 */
export const changeLanguage = async (language: AppLanguage) => {
  await i18n.changeLanguage(language);

  if (typeof document !== 'undefined') {
    document.cookie = `${LANGUAGE_STORAGE_KEY}=${language}; path=/; max-age=${LANGUAGE_COOKIE_MAX_AGE}; SameSite=Lax`;
    document.documentElement.lang = language;
    document.documentElement.dir = isRTLFor(language) ? 'rtl' : 'ltr';
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // The cookie already holds the preference.
    }
  }

  // Mobile returns { needsRTLRestart }. The web never needs one.
  return { needsRTLRestart: false };
};

export const currentLanguage = () => normalizeLanguage(i18n.language);

/** Narrow translate signature used by schema factories, so they stay testable. */
export type Translate = (key: string) => string;

export const t: Translate = (key) => i18n.t(key);

export default i18n;
