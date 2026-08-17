'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { useActiveSurveyJourney, useLatestSurveyJourney } from '@/hooks/useSurveyJourney';
import { useAuthStore } from '@/store/useAuthStore';
import { useAppStore } from '@/store/useAppStore';
import { getPrimaryActiveProject } from '@/utils/activeProject';
import { useMaintenanceLifecycle } from '@/hooks/useMaintenanceLifecycle';
import { PremiumCareProgress } from '@/features/services/PremiumCareProgress';
import { Screen } from '@/components/ui/Screen';
import { routes } from '@/constants/routes';
import { SolarJourneyView } from './SolarJourneyView';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/my-project/MyProjectScreen.tsx.
 *
 * Mobile delegates to one of three screens depending on what is active:
 * the solar journey, Premium Care progress, or an empty / cancelled-survey
 * prompt. Which one wins is decided by `getPrimaryActiveProject` — the ported
 * engine covered by 8 scenarios in Phase 2.
 *
 * The Premium Care branch (deferred in Phase 7) is now wired: an active
 * maintenance plan renders the progress screen, matching mobile's precedence of
 * solar journey first, then maintenance, then the empty/cancelled prompts.
 */
export const MyProjectScreen = () => {
  const { t } = useTranslation();
  const userId = useAuthStore((state) => state.session?.user.id);
  const appHasHydrated = useAppStore((state) => state.hasHydrated);
  const dismissedCancelledSurveyIds = useAppStore((state) => state.dismissedCancelledSurveyIds);
  const dismissCancelledSurveyPrompt = useAppStore(
    (state) => state.dismissCancelledSurveyPrompt
  );

  const activeJourney = useActiveSurveyJourney();
  const latestJourney = useLatestSurveyJourney();
  // Realtime off here: this is a routing decision, not a live view.
  const activeMaintenancePlan = useMaintenanceLifecycle({ activeUserId: userId }, { realtime: false });

  const primaryProject = useMemo(
    () =>
      getPrimaryActiveProject({
        solarProjects: activeJourney.data ? [activeJourney.data] : [],
        maintenanceRequests: [],
        userId
      }),
    [activeJourney.data, userId]
  );

  const showCancelledPrompt =
    !primaryProject &&
    !activeMaintenancePlan.data &&
    appHasHydrated &&
    latestJourney.data?.status === 'cancelled' &&
    !dismissedCancelledSurveyIds.includes(latestJourney.data.id);

  if (
    activeJourney.isLoading ||
    latestJourney.isLoading ||
    activeMaintenancePlan.isLoading ||
    !appHasHydrated
  ) {
    return (
      <Screen>
        <div className="h-64 animate-pulse rounded-xl2 border border-kaam-line bg-kaam-card" />
      </Screen>
    );
  }

  if (primaryProject?.type === 'solar_survey') {
    return <SolarJourneyView bookingId={primaryProject.project.id} />;
  }

  if (activeMaintenancePlan.data) {
    return (
      <PremiumCareProgress
        planId={activeMaintenancePlan.data.plan.id}
        requestId={activeMaintenancePlan.data.request?.id}
      />
    );
  }

  if (showCancelledPrompt && latestJourney.data) {
    return (
      <Screen width="narrow">
        <div className="relative rounded-xl2 border border-kaam-line bg-kaam-card p-6">
          <button
            type="button"
            onClick={() => dismissCancelledSurveyPrompt(latestJourney.data!.id)}
            aria-label="Dismiss"
            className="absolute end-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-kaam-muted hover:bg-kaam-surface"
          >
            <X size={16} aria-hidden />
          </button>
          <h1 className="text-xl font-extrabold text-kaam-navy">{t('project.title')}</h1>
          <p className="mt-2 text-sm text-kaam-muted">
            Your last survey was cancelled. Ready to pick things back up?
          </p>
          <Link
            href={routes.bookSurvey()}
            className="mt-5 inline-flex h-12 items-center rounded-2xl bg-kaam-yellow px-6 text-sm font-extrabold text-kaam-navy hover:bg-kaam-amber"
          >
            Book a New Survey
          </Link>
        </div>
      </Screen>
    );
  }

  return (
    <Screen width="narrow">
      <div className="rounded-xl2 border border-kaam-line bg-kaam-card p-8 text-center">
        <h1 className="text-xl font-extrabold text-kaam-navy">
          Ready to Start Your Solar Journey?
        </h1>
        <p className="mt-2 text-sm text-kaam-muted">
          Design a system or explore the marketplace to get going.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={routes.design()}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-kaam-yellow px-6 text-sm font-extrabold text-kaam-navy hover:bg-kaam-amber"
          >
            Design your System
          </Link>
          <Link
            href={routes.marketplace()}
            className="inline-flex h-12 items-center justify-center rounded-2xl border border-kaam-line bg-white px-6 text-sm font-extrabold text-kaam-navy hover:border-kaam-amber"
          >
            Explore Marketplace
          </Link>
        </div>
      </div>
    </Screen>
  );
};
