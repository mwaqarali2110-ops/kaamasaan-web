import { designSystemSteps, type DesignSystemStep } from '@/store/useSystemStore';
import { designStepToSlug, slugToDesignStep, type DesignStepSlug } from '@/constants/routes';

/**
 * Wizard step metadata and the navigation rules ported from the `next()` /
 * `goToPreviousStep()` logic in
 * kaamasaan-mobile/src/mobile/screens/design-system/DesignSystemFlowScreen.tsx.
 *
 * Mobile holds the current step in component state; on web it is the URL, so
 * these rules are expressed as pure functions the route can use.
 */

export const STEP_TITLES: Record<DesignSystemStep, string> = {
  appliances: 'Select Appliances',
  solar: 'Your Solar Recommendation',
  roof: 'Roof Space Estimate',
  backupNeed: 'Need Backup Battery',
  backupAppliances: 'Select Appliances',
  backupPlan: 'Battery Backup Plan',
  recommended: 'Recommended Solar System',
  packages: 'Packages'
};

/** Short labels for the desktop step rail — a web-only affordance. */
export const STEP_RAIL_LABELS: Record<DesignSystemStep, string> = {
  appliances: 'Appliances',
  solar: 'Solar Size',
  roof: 'Roof Space',
  backupNeed: 'Backup',
  backupAppliances: 'Backup Load',
  backupPlan: 'Backup Plan',
  recommended: 'System',
  packages: 'Packages'
};

export const toSlug = (step: DesignSystemStep): DesignStepSlug => designStepToSlug[step];

export const toStep = (slug: string): DesignSystemStep | null =>
  slug in slugToDesignStep ? slugToDesignStep[slug as DesignStepSlug] : null;

export const stepIndex = (step: DesignSystemStep) => designSystemSteps.indexOf(step);

/**
 * The step before `step`, honouring the branch mobile takes when the customer
 * declines a battery: `recommended` goes back to `backupNeed`, skipping the two
 * backup steps that were never shown.
 */
export const previousStep = (
  step: DesignSystemStep,
  wantsBackup: boolean
): DesignSystemStep | null => {
  if (step === 'appliances') return null;
  if (step === 'recommended' && !wantsBackup) return 'backupNeed';
  return designSystemSteps[stepIndex(step) - 1] ?? null;
};

/**
 * The furthest step reachable given the current store state. Deep links beyond
 * this are redirected back, so a shared or bookmarked URL cannot drop someone
 * into a step whose inputs were never provided.
 */
export const furthestAllowedStep = ({
  lastDesignStep,
  designStarted
}: {
  lastDesignStep: DesignSystemStep;
  designStarted: boolean;
}): DesignSystemStep => (designStarted ? lastDesignStep : 'appliances');

export const isStepAllowed = (
  step: DesignSystemStep,
  progress: { lastDesignStep: DesignSystemStep; designStarted: boolean }
) => stepIndex(step) <= stepIndex(furthestAllowedStep(progress));

export { designSystemSteps };
export type { DesignSystemStep };

/**
 * Ported verbatim from `getInverterSizeKw` in
 * kaamasaan-mobile/.../DesignSystemFlowScreen.tsx (line 96). Used by the
 * recommended-system, backup-need and backup-appliances steps.
 */
export const getInverterSizeKw = (solarKw: number) =>
  solarKw > 0 ? Math.max(3, Math.ceil(solarKw)) : 0;
