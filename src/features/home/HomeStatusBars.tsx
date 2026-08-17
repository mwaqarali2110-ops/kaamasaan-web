'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useActiveSurveyJourney } from '@/hooks/useSurveyJourney';
import { useSystemStore } from '@/store/useSystemStore';
import { useSystemStoreHydrated } from '@/hooks/useStoreHydrated';
import { calculateLoadKw } from '@/utils/calculations';
import { designStepToSlug, routes } from '@/constants/routes';
import { CONTINUE_PLAN_DISMISS_KEY } from './homeContent';
import localStore from '@/lib/localStore';

/**
 * The continue-plan and active-journey bars from
 * kaamasaan-mobile/src/mobile/screens/home/HomeScreen.tsx, deferred from
 * Phase 5 until their data hooks were needed by My System / My Project.
 *
 * Mobile pins these above the tab bar. On web they sit inline at the top of
 * Home, where there is room and no bar to overlap — a fixed overlay would also
 * fight the desktop sidebar.
 *
 * The design-progress percentages match `stepProgress` in MySystemScreen, and
 * the savings figure uses mobile's `recommendedSolarKw * 4836` per month.
 */
const stepCompletion: Record<string, number> = {
  appliances: 13,
  solar: 25,
  roof: 38,
  backupNeed: 50,
  backupAppliances: 63,
  backupPlan: 75,
  recommended: 88,
  packages: 96
};

const ActiveJourneyBar = () => {
  const { t } = useTranslation();
  const activeJourney = useActiveSurveyJourney();
  const booking = activeJourney.data;
  if (!booking) return null;

  return (
    <Link
      href={routes.solarJourney(booking.id)}
      className="mb-5 flex items-center justify-between gap-4 rounded-xl2 border border-kaam-line bg-kaam-card p-4 transition-colors hover:border-kaam-amber"
    >
      <span className="min-w-0">
        <span className="block text-[11px] font-bold uppercase tracking-wide text-kaam-amber">
          {t('home.surveyPending')}
        </span>
        <span className="block truncate text-sm font-extrabold text-kaam-navy">
          {t('home.viewProgress')}
        </span>
      </span>
      <ArrowRight size={18} className="shrink-0 text-kaam-navy rtl:rotate-180" aria-hidden />
    </Link>
  );
};

const ContinuePlanBar = () => {
  const { t } = useTranslation();
  const designStarted = useSystemStore((state) => state.designStarted);
  const lastDesignStep = useSystemStore((state) => state.lastDesignStep);
  const recommendedSolarKw = useSystemStore((state) => state.recommendedSolarKw);
  const appliances = useSystemStore((state) => state.appliances);
  const [dismissed, setDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    void localStore.getItem(CONTINUE_PLAN_DISMISS_KEY).then((value) => {
      setDismissed(value === 'true');
    });
  }, []);

  const completionPercent = stepCompletion[lastDesignStep] ?? 13;
  const completed = lastDesignStep === 'packages';
  const hasLoad = calculateLoadKw(appliances) > 0;

  if (dismissed !== false || !designStarted || completed || !hasLoad) return null;

  const monthlySavings = Math.round(recommendedSolarKw * 4836);

  const dismiss = () => {
    setDismissed(true);
    void localStore.setItem(CONTINUE_PLAN_DISMISS_KEY, 'true');
  };

  return (
    <div className="mb-5 flex items-center gap-4 rounded-xl2 border border-kaam-line bg-kaam-card p-4">
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wide text-kaam-amber">
          {t('home.continuePlan', { percent: completionPercent })}
        </p>
        <p className="truncate text-sm font-extrabold text-kaam-navy">
          {t('home.systemSavings', {
            kw: recommendedSolarKw,
            amount: monthlySavings.toLocaleString()
          })}
        </p>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-kaam-line">
          <div
            className="h-full rounded-full bg-kaam-amber"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      <Link
        href={routes.design(designStepToSlug[lastDesignStep])}
        className="shrink-0 rounded-xl bg-kaam-yellow px-4 py-2 text-xs font-extrabold text-kaam-navy hover:bg-kaam-amber"
      >
        {t('common.continue')}
      </Link>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-kaam-muted hover:bg-kaam-surface"
      >
        <X size={15} aria-hidden />
      </button>
    </div>
  );
};

export const HomeStatusBars = () => {
  const hydrated = useSystemStoreHydrated();
  if (!hydrated) return null;

  return (
    <>
      <ActiveJourneyBar />
      <ContinuePlanBar />
    </>
  );
};
