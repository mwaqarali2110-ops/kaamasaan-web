import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Web port of kaamasaan-mobile/src/components/ui/Screen.tsx.
 *
 * Mobile wrapped every screen in SafeAreaView + ScrollView with px-4 pb-8.
 * On web the page scrolls natively and safe-area insets do not exist, so this
 * is a width-constrained content container instead: phone-width padding below
 * 768px, a centred max-width column above it.
 */
type ScreenProps = {
  children: ReactNode;
  className?: string;
  /** `wide` for grid-heavy pages (marketplace), `narrow` for forms and wizard steps. */
  width?: 'default' | 'wide' | 'narrow';
};

const widths = {
  default: 'max-w-5xl',
  wide: 'max-w-7xl',
  narrow: 'max-w-3xl'
} as const;

export const Screen = ({ children, className, width = 'default' }: ScreenProps) => (
  <div className={cn('mx-auto w-full px-4 pb-8 md:px-6 lg:px-8', widths[width], className)}>
    {children}
  </div>
);
