'use client';

import Link from 'next/link';
import { ArrowRight, CalendarDays, PanelsTopLeft, Sun } from 'lucide-react';
import { useMySystemStatus } from '@/hooks/useMySystemStatus';
import { useSystemStore, type DesignSystemStep } from '@/store/useSystemStore';
import { useSystemStoreHydrated } from '@/hooks/useStoreHydrated';
import { formatSurveyReference, type SurveyJourneyBooking } from '@/services/journey.api';
import { Screen } from '@/components/ui/Screen';
import { routes } from '@/constants/routes';
import { designStepToSlug } from '@/constants/routes';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/my-system/MySystemScreen.tsx.
 *
 * Same three modes from the ported `useMySystemStatus` hook:
 *   confirmedSurvey -> booking summary + journey link
 *   activeDesign    -> progress card + continue
 *   empty           -> video hero + design CTA
 */
const stepProgress: Record<DesignSystemStep, number> = {
  appliances: 13,
  solar: 25,
  roof: 38,
  backupNeed: 50,
  backupAppliances: 63,
  backupPlan: 75,
  recommended: 88,
  packages: 96
};

const stepLabel: Record<DesignSystemStep, string> = {
  appliances: 'Appliances selected',
  solar: 'Solar recommendation',
  roof: 'Roof space estimate',
  backupNeed: 'Backup decision',
  backupAppliances: 'Backup appliances',
  backupPlan: 'Battery backup plan',
  recommended: 'Recommended system',
  packages: 'Package selection'
};

const EmptyState = () => (
  <div className="relative overflow-hidden rounded-xl2 border border-kaam-line">
    {/*
      Mobile plays this behind the empty state via expo-video with an error
      boundary and a static fallback. On web a plain <video> covers it: muted +
      playsInline so it autoplays everywhere, and `poster` is the fallback if it
      cannot load, which removes the need for the boundary.
    */}
    <video
      className="absolute inset-0 h-full w-full object-cover"
      src="/assets/my-system-background.mp4"
      poster="/assets/home/transparent-solar-house-hero-section.png"
      autoPlay
      muted
      loop
      playsInline
      aria-hidden
    />
    <div className="absolute inset-0 bg-kaam-navy/55" />

    <div className="relative flex min-h-[420px] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl2 bg-kaam-card/95 p-6 text-center backdrop-blur">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-kaam-yellow/20">
          <PanelsTopLeft size={30} className="text-kaam-amber" strokeWidth={2.4} aria-hidden />
        </span>
        <h1 className="mt-4 text-xl font-extrabold text-kaam-navy">No system yet</h1>
        <p className="mt-2 text-sm text-kaam-muted">
          Design your solar system and track your complete journey here.
        </p>
        <Link
          href={routes.design('appliances')}
          className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-kaam-yellow px-6 text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber"
        >
          <Sun size={21} strokeWidth={2.4} aria-hidden />
          Design your System!
          <ArrowRight size={20} strokeWidth={2.6} className="rtl:rotate-180" aria-hidden />
        </Link>
      </div>
    </div>
  </div>
);

const ActiveDesign = () => {
  const lastDesignStep = useSystemStore((state) => state.lastDesignStep);
  const progress = stepProgress[lastDesignStep] ?? 13;

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-6">
        <h1 className="text-xl font-extrabold text-kaam-navy">System design in progress</h1>
        <p className="mt-1 text-sm text-kaam-muted">
          {stepLabel[lastDesignStep]} is your latest saved step.
        </p>
      </section>

      <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-kaam-navy">Design Progress</h2>
          <span className="text-sm font-extrabold text-kaam-amber">{progress}%</span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-kaam-line">
          <div
            className="h-full rounded-full bg-kaam-amber transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      <Link
        href={routes.design(designStepToSlug[lastDesignStep])}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber sm:w-auto sm:px-8"
      >
        Continue Designing
        <ArrowRight size={18} strokeWidth={2.6} className="rtl:rotate-180" aria-hidden />
      </Link>
    </div>
  );
};

const ConfirmedSurvey = ({ booking }: { booking: SurveyJourneyBooking }) => (
  <div className="flex flex-col gap-5">
    <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-6">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ECFDF3] px-3 py-1 text-[11px] font-extrabold text-kaam-green">
        <CalendarDays size={13} aria-hidden />
        Survey booked
      </span>
      <h1 className="mt-3 text-xl font-extrabold text-kaam-navy">Your system is on the way</h1>
      <p className="mt-1 text-sm text-kaam-muted">
        Reference {formatSurveyReference(booking)}
      </p>
    </section>

    <Link
      href={routes.solarJourney(booking.id)}
      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber sm:w-auto sm:px-8"
    >
      View Progress
      <ArrowRight size={18} strokeWidth={2.6} className="rtl:rotate-180" aria-hidden />
    </Link>
  </div>
);

export const MySystemScreen = () => {
  const hydrated = useSystemStoreHydrated();
  const status = useMySystemStatus();

  if (!hydrated || status.isLoadingSurvey) {
    return (
      <Screen>
        <div className="h-64 animate-pulse rounded-xl2 border border-kaam-line bg-kaam-card" />
      </Screen>
    );
  }

  return (
    <Screen>
      {status.mode === 'confirmedSurvey' && status.activeSurvey ? (
        <ConfirmedSurvey booking={status.activeSurvey} />
      ) : status.mode === 'activeDesign' ? (
        <ActiveDesign />
      ) : (
        <EmptyState />
      )}
    </Screen>
  );
};
