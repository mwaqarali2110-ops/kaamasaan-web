import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Web port of kaamasaan-mobile/src/components/ui/AppText.tsx.
 * Variant classes are identical; `as` lets a variant render the correct
 * semantic element (headings, paragraphs) which mobile's <Text> could not.
 */
export type AppTextVariant = 'title' | 'subtitle' | 'body' | 'caption' | 'label';

const variants: Record<AppTextVariant, string> = {
  title: 'text-3xl font-extrabold text-kaam-navy',
  subtitle: 'text-base font-semibold text-kaam-muted',
  body: 'text-sm text-kaam-navy',
  caption: 'text-xs text-kaam-muted',
  label: 'text-xs font-bold uppercase tracking-wide text-kaam-muted'
};

const defaultElement: Record<AppTextVariant, ElementType> = {
  title: 'h1',
  subtitle: 'p',
  body: 'p',
  caption: 'span',
  label: 'span'
};

type AppTextProps = {
  variant?: AppTextVariant;
  as?: ElementType;
  className?: string;
  children?: ReactNode;
};

export const AppText = ({ variant = 'body', as, className, children, ...props }: AppTextProps) => {
  const Component = as ?? defaultElement[variant];
  return (
    <Component className={cn(variants[variant], className)} {...props}>
      {children}
    </Component>
  );
};
