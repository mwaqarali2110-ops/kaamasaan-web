'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { I18nProvider } from '@/i18n/I18nProvider';
import type { AppLanguage } from '@/i18n/language';

/**
 * Client providers. Mirrors the provider stack in kaamasaan-mobile/App.tsx
 * (QueryClientProvider + I18nProvider).
 *
 * The QueryClient is created in state rather than at module scope so it is not
 * shared between requests on the server.
 */
export const Providers = ({
  children,
  language
}: {
  children: ReactNode;
  language: AppLanguage;
}) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Catalog data changes rarely; avoid refetching on every focus the
            // way a browser tab would otherwise trigger.
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider initialLanguage={language}>{children}</I18nProvider>
    </QueryClientProvider>
  );
};
