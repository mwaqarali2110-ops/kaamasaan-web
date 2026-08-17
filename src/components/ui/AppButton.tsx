import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Web port of kaamasaan-mobile/src/components/ui/AppButton.tsx.
 *
 * Same `tone` API and the same class values. Renders an <a> when `href` is
 * given and a <button> otherwise, so navigation is a real link (middle-click,
 * open-in-new-tab, prefetch) rather than a click handler.
 *
 * The prop surface is deliberately explicit rather than extending
 * ButtonHTMLAttributes — mobile's version only accepted PressableProps, and
 * keeping it narrow avoids invalid attributes leaking onto the anchor branch.
 */
export type AppButtonTone = 'primary' | 'secondary' | 'dark' | 'ghost';

const tones: Record<AppButtonTone, string> = {
  primary: 'bg-kaam-yellow hover:bg-kaam-amber text-kaam-navy',
  secondary: 'bg-white border border-kaam-line hover:border-kaam-amber text-kaam-navy',
  dark: 'bg-kaam-navy hover:bg-kaam-navy/90 text-white',
  ghost: 'bg-transparent hover:bg-kaam-surface text-kaam-navy'
};

const base =
  'inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-extrabold transition-colors disabled:opacity-50 disabled:pointer-events-none';

type AppButtonProps = {
  title: string;
  tone?: AppButtonTone;
  className?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /** Present -> renders a next/link anchor instead of a button. */
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  'aria-label'?: string;
};

export const AppButton = ({
  title,
  tone = 'primary',
  className,
  leadingIcon,
  trailingIcon,
  href,
  onClick,
  type = 'button',
  disabled,
  ...rest
}: AppButtonProps) => {
  const classes = cn(base, tones[tone], className);
  const content = (
    <>
      {leadingIcon}
      {title}
      {trailingIcon}
    </>
  );

  if (href !== undefined) {
    return (
      <Link href={href} className={classes} onClick={onClick} {...rest}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} {...rest}>
      {content}
    </button>
  );
};
