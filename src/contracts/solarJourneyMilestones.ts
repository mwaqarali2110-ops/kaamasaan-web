/*
 * Vendored from backend-development/supabase/contracts/solarJourneyMilestones.ts.
 *
 * kaamasaan-mobile imports this file directly via a relative path that escapes
 * its own project root ('../../../backend-development/...'). That happens to
 * resolve in this monorepo-ish layout, but it means the app cannot be built or
 * deployed on its own — the sibling folder has to be present.
 *
 * The web port keeps a copy inside src/ instead. It is a shared contract with
 * the database, so if the backend version changes this must be re-copied;
 * milestoneContract.test.ts fails if the two drift.
 */
export const SOLAR_JOURNEY_MILESTONES = [
  {
    key: 'request_received',
    order: 1,
    progressNumber: 1,
    label: 'Survey Request Received',
    customerDescription: 'Your solar survey request has been received.',
    notificationMessage: null,
  },
  {
    key: 'survey_scheduled',
    order: 2,
    progressNumber: 2,
    label: 'Survey Scheduled',
    customerDescription: 'Your site survey date and time have been confirmed.',
    notificationMessage: 'Your site survey has been scheduled.',
  },
  {
    key: 'survey_completed',
    order: 3,
    progressNumber: 3,
    label: 'Site Survey Completed',
    customerDescription: 'Our team has completed your site assessment.',
    notificationMessage: 'Your site survey has been completed.',
  },
  {
    key: 'quotation_shared',
    order: 4,
    progressNumber: 4,
    label: 'Quotation Shared',
    customerDescription: 'Your recommended system and quotation are ready.',
    notificationMessage: 'Your solar quotation is ready.',
  },
  {
    key: 'installation_completed',
    order: 5,
    progressNumber: 5,
    label: 'Installation Completed',
    customerDescription: 'Your solar installation has been completed.',
    notificationMessage: 'Your solar installation has been completed.',
  },
] as const;

export type SolarJourneyMilestone = typeof SOLAR_JOURNEY_MILESTONES[number]['key'];
export type SolarJourneyLifecycle = 'active' | 'on_hold' | 'cancelled';
export type SolarJourneyState = SolarJourneyMilestone | Exclude<SolarJourneyLifecycle, 'active'>;
export type SolarJourneyStepState = 'completed' | 'active' | 'pending';

export const SOLAR_JOURNEY_MILESTONE_KEYS = SOLAR_JOURNEY_MILESTONES.map(({ key }) => key) as SolarJourneyMilestone[];

export const SOLAR_JOURNEY_LEGACY_MAP: Readonly<Record<string, SolarJourneyMilestone>> = {
  representative_call: 'request_received',
  survey_requested: 'request_received',
  survey_booked: 'request_received',
  survey_pending: 'request_received',
  pending: 'request_received',
  survey_confirmed: 'survey_scheduled',
  team_assigned: 'survey_scheduled',
  survey_in_progress: 'survey_scheduled',
  confirmed: 'survey_scheduled',
  assigned: 'survey_scheduled',
  scheduled: 'survey_scheduled',
  site_visit_scheduled: 'survey_scheduled',
  site_survey_scheduled: 'survey_scheduled',
  survey_scheduled: 'survey_scheduled',
  site_survey: 'survey_completed',
  survey_completed: 'survey_completed',
  proposal_preparation: 'survey_completed',
  design_in_progress: 'survey_completed',
  quotation_pending: 'survey_completed',
  quotation_shared: 'quotation_shared',
  quotation_ready: 'quotation_shared',
  installation_planning: 'quotation_shared',
  installation_completed: 'installation_completed',
  installed: 'installation_completed',
  system_active: 'installation_completed',
  project_completed: 'installation_completed',
  completed: 'installation_completed',
};

export const resolveSolarJourneyMilestone = (
  milestone?: string | null,
  legacyStatus?: string | null,
): SolarJourneyMilestone => milestone && SOLAR_JOURNEY_MILESTONE_KEYS.includes(milestone as SolarJourneyMilestone)
  ? milestone as SolarJourneyMilestone
  : SOLAR_JOURNEY_LEGACY_MAP[String(milestone ?? '')]
    ?? SOLAR_JOURNEY_LEGACY_MAP[String(legacyStatus ?? '')]
    ?? 'request_received';

export const resolveSolarJourneyLifecycle = (
  journeyStatus?: SolarJourneyLifecycle | null,
  milestone?: string | null,
  legacyStatus?: string | null,
): SolarJourneyLifecycle => legacyStatus === 'cancelled' || journeyStatus === 'cancelled' || milestone === 'cancelled'
  ? 'cancelled'
  : journeyStatus === 'on_hold' || milestone === 'on_hold'
    ? 'on_hold'
    : 'active';

export const getSolarJourneyStepState = (
  currentMilestone: SolarJourneyMilestone,
  lifecycle: SolarJourneyLifecycle,
  stepIndex: number,
): SolarJourneyStepState => {
  const currentIndex = SOLAR_JOURNEY_MILESTONE_KEYS.indexOf(currentMilestone);
  if (stepIndex <= currentIndex) return 'completed';
  if (lifecycle === 'active' && stepIndex === currentIndex + 1) return 'active';
  return 'pending';
};
