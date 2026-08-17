'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSystemStore } from '@/store/useSystemStore';
import { useSystemStoreHydrated } from '@/hooks/useStoreHydrated';
import { routes } from '@/constants/routes';
import {
  isStepAllowed,
  previousStep,
  toSlug,
  type DesignSystemStep
} from './wizard';
import { AppliancesStep } from './steps/AppliancesStep';
import { SolarStep } from './steps/SolarStep';
import { RoofStep } from './steps/RoofStep';
import { BackupNeedStep } from './steps/BackupNeedStep';
import { BackupAppliancesStep } from './steps/BackupAppliancesStep';
import { BackupPlanStep } from './steps/BackupPlanStep';
import { RecommendedStep } from './steps/RecommendedStep';
import { PackagesStep } from './steps/PackagesStep';

/**
 * Wizard host — the web equivalent of `DesignSystemFlowScreen`'s `next()` and
 * `goToPreviousStep()`.
 *
 * Mobile keeps the current step in component state. Here it is the URL, which
 * makes every step linkable and the browser back button work naturally. Two
 * consequences that mobile does not have to handle:
 *
 *  1. **Hydration.** `useSystemStore` persists to localStorage, invisible to the
 *     server, so the step guard has to wait for rehydration or it would bounce
 *     a returning customer back to step 1 on first paint.
 *  2. **Deep links.** A URL can point at any step, so `isStepAllowed` redirects
 *     anything beyond the furthest legitimately reached step.
 */
const STEP_COMPONENTS: Record<
  DesignSystemStep,
  (props: { onContinue: () => void; onBack: () => void }) => React.ReactElement
> = {
  appliances: AppliancesStep,
  solar: SolarStep,
  roof: RoofStep,
  backupNeed: BackupNeedStep,
  backupAppliances: BackupAppliancesStep,
  backupPlan: BackupPlanStep,
  recommended: RecommendedStep,
  packages: PackagesStep
};

export const DesignWizard = ({ step }: { step: DesignSystemStep }) => {
  const router = useRouter();
  const hydrated = useSystemStoreHydrated();

  const lastDesignStep = useSystemStore((state) => state.lastDesignStep);
  const designStarted = useSystemStore((state) => state.designStarted);
  const setDesignProgress = useSystemStore((state) => state.setDesignProgress);

  const allowed = isStepAllowed(step, { lastDesignStep, designStarted });

  // Mirrors mobile's `useEffect(() => setDesignProgress(step), [step])`.
  useEffect(() => {
    if (hydrated && allowed) setDesignProgress(step);
  }, [allowed, hydrated, setDesignProgress, step]);

  useEffect(() => {
    if (hydrated && !allowed) {
      router.replace(routes.design(toSlug(designStarted ? lastDesignStep : 'appliances')));
    }
  }, [allowed, designStarted, hydrated, lastDesignStep, router]);

  if (!hydrated) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="h-64 animate-pulse rounded-xl2 border border-kaam-line bg-kaam-card" />
      </div>
    );
  }

  if (!allowed) return null;

  /**
   * Record progress *before* navigating.
   *
   * The deep-link guard compares the requested step against `lastDesignStep`,
   * which the destination only updates once it renders — so pushing first meant
   * the guard rejected the new step and bounced straight back. Mobile has no
   * equivalent problem because its step lives in component state with no guard.
   */
  const goTo = (next: DesignSystemStep) => {
    useSystemStore.getState().setDesignProgress(next);
    router.push(routes.design(toSlug(next)));
  };

  /**
   * Forward transitions, ported from mobile's `next()`. Reads through
   * `getState()` because a step may have just written its decision in the same
   * tick (the backup yes/no branch).
   */
  const onContinue = () => {
    const store = useSystemStore.getState();

    switch (step) {
      case 'appliances': {
        const selected = store.appliances.reduce(
          (total, item) => total + Math.max(0, Number(item.quantity) || 0),
          0
        );
        if (selected <= 0) return;
        store.calculateRecommendation();
        goTo('solar');
        return;
      }
      case 'solar': {
        store.setRecommendedSolarKw(
          Math.min(20, Math.max(1, Math.round(Number(store.recommendedSolarKw || 3))))
        );
        goTo('roof');
        return;
      }
      case 'roof':
        goTo('backupNeed');
        return;
      case 'backupNeed':
        goTo(store.backupDecision === 'yes' ? 'backupAppliances' : 'recommended');
        return;
      case 'backupAppliances': {
        const selected = store.backupAppliances.reduce(
          (total, item) => total + Math.max(0, Number(item.quantity) || 0),
          0
        );
        if (selected <= 0) return;
        goTo('backupPlan');
        return;
      }
      case 'backupPlan':
        goTo('recommended');
        return;
      case 'recommended':
        goTo('packages');
        return;
      case 'packages':
        if (store.selectedRecommendedPackageId) {
          router.push(routes.systemSummary({ packageId: store.selectedRecommendedPackageId }));
        }
    }
  };

  const onBack = () => {
    const wantsBackup = useSystemStore.getState().backupDecision === 'yes';
    const previous = previousStep(step, wantsBackup);
    if (previous) router.push(routes.design(toSlug(previous)));
    else router.push(routes.home());
  };

  const StepComponent = STEP_COMPONENTS[step];
  return <StepComponent onContinue={onContinue} onBack={onBack} />;
};
