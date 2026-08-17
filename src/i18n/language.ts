/**
 * Language primitives with **no react-i18next import**, so Server Components
 * can use them.
 *
 * `src/i18n/index.ts` pulls in `initReactI18next`, which calls
 * `React.createContext` at module scope — a client-only API. Importing it from
 * `app/layout.tsx` (a Server Component) crashes the build with
 * "createContext is not a function". Everything the server needs to pick a
 * language and set `<html lang dir>` lives here instead.
 */
export type AppLanguage = 'en' | 'ur';

export const LANGUAGE_STORAGE_KEY = 'kaamasaan.language';

export const LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const languages: Array<{
  code: AppLanguage;
  labelKey: string;
  nativeLabel: string;
  isRTL: boolean;
}> = [
  { code: 'en', labelKey: 'profile.english', nativeLabel: 'English', isRTL: false },
  { code: 'ur', labelKey: 'profile.urdu', nativeLabel: 'اردو', isRTL: true }
];

export const normalizeLanguage = (value?: string | null): AppLanguage =>
  value === 'ur' ? 'ur' : 'en';

export const isRTL = (language: string) => language.startsWith('ur');
