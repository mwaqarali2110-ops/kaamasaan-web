'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Check, ChevronRight, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import { BRAND_LOGOS } from './homeContent';

/**
 * Home page sections, split out of the 1,299-line
 * kaamasaan-mobile/src/mobile/screens/home/HomeScreen.tsx.
 *
 * Mobile lays every horizontal strip out with a nested horizontal ScrollView.
 * On desktop those become responsive grids (BUILD_PROMPT §6); below `md` they
 * revert to a snap-scrolling row so the phone experience is unchanged.
 */

export const SectionHeader = ({
  title,
  action,
  href
}: {
  title: string;
  action?: string;
  href?: string;
}) => (
  <div className="mt-8 mb-3 flex items-center justify-between gap-3">
    <h2 className="text-base font-extrabold text-kaam-navy">{title}</h2>
    {action && href ? (
      <Link
        href={href}
        className="flex items-center gap-1 text-xs font-extrabold text-kaam-amber hover:underline"
      >
        {action}
        <ChevronRight size={14} className="rtl:rotate-180" aria-hidden />
      </Link>
    ) : null}
  </div>
);

/** Horizontal strip on mobile, grid on desktop. */
export const CardTrack = ({
  children,
  columns
}: {
  children: React.ReactNode;
  columns: string;
}) => (
  <div
    className={cn(
      'flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2',
      'md:grid md:overflow-visible md:pb-0',
      columns
    )}
  >
    {children}
  </div>
);

export const CategoryCard = ({
  item
}: {
  item: { labelKey: string; subtitleKey: string; image: string; href: string };
}) => {
  const { t } = useTranslation();
  return (
    <Link
      href={item.href}
      className="group w-[190px] shrink-0 snap-start overflow-hidden rounded-xl2 border border-kaam-line bg-kaam-card transition-all hover:-translate-y-0.5 hover:border-kaam-amber hover:shadow-md md:w-auto"
    >
      <div className="relative h-28 w-full overflow-hidden bg-kaam-surface">
        <Image
          src={item.image}
          alt=""
          fill
          sizes="(max-width: 768px) 190px, 300px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="p-3">
        <p className="text-sm font-extrabold text-kaam-navy">{t(item.labelKey)}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-kaam-muted">{t(item.subtitleKey)}</p>
      </div>
    </Link>
  );
};

const BrandLogoCard = ({ brand }: { brand: (typeof BRAND_LOGOS)[number] }) => (
  <div className="flex h-16 w-32 shrink-0 items-center justify-center rounded-2xl border border-kaam-line bg-kaam-card px-4">
    {brand.image ? (
      <Image
        src={brand.image}
        alt={brand.label}
        width={96}
        height={36}
        className="h-9 w-auto object-contain"
      />
    ) : (
      <span className="text-xs font-extrabold text-kaam-muted">{brand.label}</span>
    )}
  </div>
);

/**
 * Trusted-brands marquee. Mobile animates it with Reanimated; here it is a CSS
 * keyframe on a duplicated track, paused on hover and disabled entirely under
 * `prefers-reduced-motion` (handled globally in globals.css).
 */
export const BrandMarquee = () => (
  <div className="group relative mt-6 overflow-hidden">
    <div className="flex w-max animate-[marquee_32s_linear_infinite] gap-3 group-hover:[animation-play-state:paused]">
      {[...BRAND_LOGOS, ...BRAND_LOGOS].map((brand, index) => (
        <BrandLogoCard key={`${brand.label}-${index}`} brand={brand} />
      ))}
    </div>
    {/* Fade the strip into the cream background at both ends. */}
    <div className="pointer-events-none absolute inset-y-0 start-0 w-12 bg-gradient-to-r from-kaam-cream to-transparent" />
    <div className="pointer-events-none absolute inset-y-0 end-0 w-12 bg-gradient-to-l from-kaam-cream to-transparent" />
  </div>
);

export const ExpertBenefitRow = ({ label }: { label: string }) => (
  <li className="flex items-center gap-2.5">
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-kaam-green/10">
      <Check size={12} className="text-kaam-green" strokeWidth={3} aria-hidden />
    </span>
    <span className="text-sm font-semibold text-kaam-navy">{label}</span>
  </li>
);

/**
 * The Design System CTA. Mobile wraps it in `PremiumShimmerSweep` (Reanimated);
 * this is the CSS equivalent — a gradient sweep across the button.
 */
export const DesignSystemCta = ({ href }: { href: string }) => {
  const { t } = useTranslation();
  return (
    <Link
      href={href}
      className="relative inline-flex h-12 items-center gap-2.5 overflow-hidden rounded-2xl bg-kaam-yellow px-5 text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber"
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2.8s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/55 to-transparent" />
      <span className="relative">{t('home.designSystem')}</span>
      <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-white/60">
        <Zap size={12} className="text-[#B07800]" fill="#B07800" aria-hidden />
      </span>
    </Link>
  );
};
