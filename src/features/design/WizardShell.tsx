'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Check, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { routes } from '@/constants/routes';
import { cn } from '@/lib/cn';
import {
  STEP_RAIL_LABELS,
  designSystemSteps,
  stepIndex,
  type DesignSystemStep
} from './wizard';

/**
 * Chrome shared by all eight wizard steps.
 *
 * Redesigned per the "classy home + glass card" brief: no sidebar/tab-bar
 * (AppShell skips its chrome for the whole /design tree — see AppShell.tsx),
 * a full-bleed home photo behind everything, and the step content sitting in
 * a translucent glass card on top. Every step's own markup (AppliancesStep,
 * SolarStep, RoofStep, ...) is untouched — they just render inside `children`
 * exactly as before, so this is a pure visual change with zero logic risk.
 *
 * Mobile gives each step its own full-screen SafeAreaView with a top bar and a
 * fixed bottom CTA panel. On desktop BUILD_PROMPT §6 asks for a horizontal step
 * rail with the step content in a centred card and the live summary as a sticky
 * sidebar; below `lg` it collapses back to the mobile single column with a
 * sticky bottom bar.
 */
export const WizardShell = ({
  step,
  title,
  eyebrow = 'Design Your System',
  onBack,
  children,
  summary,
  footer
}: {
  step: DesignSystemStep;
  title: string;
  eyebrow?: string;
  onBack?: () => void;
  children: ReactNode;
  /** Sticky sidebar on desktop, rendered above the CTA on mobile. */
  summary?: ReactNode;
  /** Primary action row — sticks to the bottom on mobile. */
  footer?: ReactNode;
}) => {
  const currentIndex = stepIndex(step);

  return (
    <div className="relative min-h-screen">
      {/* Full-bleed home backdrop — fixed so it holds still while the glass
          card content scrolls over it. A warm cream scrim (matching the
          app's own background colour, not a cold navy tint) keeps the top
          bar and step rail text readable against any part of the photo. */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/marketing/imagery/kaamasaan-daylight-home.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-kaam-cream/80 via-kaam-cream/50 to-kaam-cream/85" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 md:px-6 lg:px-8 lg:pb-12">
        {/* Top bar — navy text/glass controls over the photo, matching the
            rest of the app's cream + navy palette */}
        <div className="flex items-center gap-3 py-2">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-kaam-line bg-white/80 text-kaam-navy backdrop-blur-md transition-colors hover:border-kaam-amber hover:text-kaam-amber"
            >
              <ArrowLeft size={15} strokeWidth={2.4} className="rtl:rotate-180" aria-hidden />
            </button>
          ) : (
            <Link
              href={routes.home()}
              aria-label="Back"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-kaam-line bg-white/80 text-kaam-navy backdrop-blur-md transition-colors hover:border-kaam-amber hover:text-kaam-amber"
            >
              <ArrowLeft size={15} strokeWidth={2.4} className="rtl:rotate-180" aria-hidden />
            </Link>
          )}
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wide text-kaam-navy/60">{eyebrow}</p>
            <h1 className="text-base font-extrabold text-kaam-navy">{title}</h1>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-kaam-line bg-white/80 backdrop-blur-md">
            <Zap size={15} className="text-kaam-amber" strokeWidth={2.3} aria-hidden />
          </span>
        </div>

        {/* Desktop step rail */}
        <ol className="mb-6 mt-4 hidden items-center gap-1 lg:flex" aria-label="Progress">
          {designSystemSteps.map((entry, index) => {
            const done = index < currentIndex;
            const active = index === currentIndex;
            return (
              <li key={entry} className="flex flex-1 items-center gap-1">
                <div className={cn('flex w-full flex-col gap-1.5', !done && !active && 'opacity-60')}>
                  <span
                    className={cn(
                      'h-1 w-full rounded-full',
                      done ? 'bg-kaam-green' : active ? 'bg-kaam-yellow' : 'bg-kaam-navy/15'
                    )}
                  />
                  <span
                    className={cn(
                      'flex items-center gap-1 text-[10px] font-extrabold',
                      done ? 'text-kaam-green' : active ? 'text-kaam-navy' : 'text-kaam-muted'
                    )}
                  >
                    {done ? <Check size={11} strokeWidth={3} aria-hidden /> : null}
                    {STEP_RAIL_LABELS[entry]}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Mobile progress bar */}
        <div className="mb-5 mt-3 lg:hidden">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-kaam-navy/15">
            <div
              className="h-full rounded-full bg-kaam-yellow transition-[width] duration-300"
              style={{ width: `${((currentIndex + 1) / designSystemSteps.length) * 100}%` }}
            />
          </div>
          <p className="mt-1.5 text-[10px] font-bold text-kaam-muted">
            Step {currentIndex + 1} of {designSystemSteps.length} · {STEP_RAIL_LABELS[step]}
          </p>
        </div>

        {/* Glass card — the actual step content sits here, solidly readable
            against the photo behind it. */}
        <div className="rounded-3xl border border-kaam-line bg-white/95 p-4 shadow-2xl backdrop-blur-xl sm:p-6 lg:p-8">
          <div className={cn(Boolean(summary) && 'lg:grid lg:grid-cols-[1fr_320px] lg:items-start lg:gap-8')}>
            <div className="min-w-0">{children}</div>

            {summary ? (
              <aside className="mt-6 lg:sticky lg:top-24 lg:mt-0">{summary}</aside>
            ) : null}
          </div>

          {footer ? <div className="mt-8 hidden lg:block">{footer}</div> : null}
        </div>
      </div>

      {footer ? (
        // Sticky CTA on mobile, floating over the photo below the glass card.
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-kaam-line bg-kaam-cream/95 p-4 backdrop-blur-lg lg:hidden">
          {footer}
        </div>
      ) : null}
    </div>
  );
};

/** Shared step wrapper so every step's card styling matches. */
export const StepCard = ({
  title,
  children,
  className
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) => (
  <section className={cn('rounded-xl2 border border-kaam-line bg-kaam-card p-5', className)}>
    {title ? (
      <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-kaam-muted">{title}</h2>
    ) : null}
    {children}
  </section>
);
