'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { ReactNode } from 'react';
import { AppText } from './AppText';

/**
 * Web port of kaamasaan-mobile/src/components/ui/Header.tsx — the in-page
 * header used by pushed screens. Same prop API; `onBack` defaults to
 * router.back() so ported screens can simply omit it.
 *
 * The back arrow is direction-aware: it flips for Urdu (RTL).
 */
type HeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: ReactNode;
};

export const Header = ({ title, subtitle, onBack, right }: HeaderProps) => {
  const router = useRouter();

  return (
    <div className="flex flex-row items-center gap-3 px-4 py-3">
      <button
        type="button"
        aria-label="Go back"
        onClick={onBack ?? (() => router.back())}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white transition-colors hover:bg-kaam-surface"
      >
        <ArrowLeft size={19} className="text-kaam-navy rtl:rotate-180" />
      </button>
      <div className="flex-1">
        <AppText as="h1" variant="body" className="text-base font-extrabold">
          {title}
        </AppText>
        {subtitle ? <AppText variant="caption">{subtitle}</AppText> : null}
      </div>
      {right}
    </div>
  );
};
