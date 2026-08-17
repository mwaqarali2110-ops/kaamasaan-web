import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import './globals.css';
import { Providers } from './providers';
// Server-safe subset — importing '@/i18n' here would pull in react-i18next,
// whose module-scope React.createContext call breaks Server Components.
import { LANGUAGE_STORAGE_KEY, isRTL, normalizeLanguage } from '@/i18n/language';

/*
 * No web font is loaded on purpose: kaamasaan-mobile/tailwind.config.js sets
 * fontFamily.sans to 'System', so the web port uses the system stack too
 * (declared in globals.css). This also keeps Urdu rendering on the platform's
 * own Nastaliq/Naskh font rather than a Latin-only webfont.
 */

export const metadata: Metadata = {
  title: {
    default: 'KaamAsaan — Solar made simple',
    template: '%s | KaamAsaan'
  },
  description:
    'Design your solar system, compare inverters, panels and batteries, and book installation and maintenance across Pakistan.'
};

export const viewport: Viewport = {
  themeColor: '#FFF7E6'
};

export default async function RootLayout({ children }: LayoutProps<'/'>) {
  // Reading the preference here — rather than in an effect — means Urdu renders
  // right-to-left on the very first paint, with no flash of LTR layout.
  const cookieStore = await cookies();
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_STORAGE_KEY)?.value);

  return (
    <html lang={language} dir={isRTL(language) ? 'rtl' : 'ltr'} className="h-full">
      <body className="flex min-h-full flex-col">
        <Providers language={language}>{children}</Providers>
      </body>
    </html>
  );
}
