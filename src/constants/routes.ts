import type { ProductCategory } from '@/types/product.types';

/**
 * Web route builders. One entry per mobile screen in
 * kaamasaan-mobile/src/mobile/navigation/RootNavigator.tsx.
 *
 * Route params from kaamasaan-mobile/src/types/navigation.types.ts are preserved
 * here as function arguments — path segments where the value identifies the
 * resource, search params where it is optional context.
 *
 * See docs/ROUTE_MAP.md for the full screen -> route table and port status.
 */

export type BookingContext =
  | 'general'
  | 'solar_package'
  | 'custom_system'
  | 'cleaning'
  | 'installation'
  | 'electrical';

export type BookSurveySource =
  | 'cleaning_estimator'
  | 'installation_service'
  | 'solar_package'
  | 'custom_system'
  | 'electrical_service'
  | 'general';

export type ElectricalServiceType =
  | 'load_distribution'
  | 'single_phase_to_3_phase_wiring'
  | 'diagnostic_services';

export const designSteps = [
  'appliances',
  'solar',
  'roof',
  'backup-need',
  'backup-appliances',
  'backup-plan',
  'recommended',
  'packages'
] as const;

export type DesignStepSlug = (typeof designSteps)[number];

/** Mobile `DesignSystemStep` union <-> web URL slug. */
export const designStepToSlug = {
  appliances: 'appliances',
  solar: 'solar',
  roof: 'roof',
  backupNeed: 'backup-need',
  backupAppliances: 'backup-appliances',
  backupPlan: 'backup-plan',
  recommended: 'recommended',
  packages: 'packages'
} as const;

export const slugToDesignStep = {
  appliances: 'appliances',
  solar: 'solar',
  roof: 'roof',
  'backup-need': 'backupNeed',
  'backup-appliances': 'backupAppliances',
  'backup-plan': 'backupPlan',
  recommended: 'recommended',
  packages: 'packages'
} as const;

const qs = (params: Record<string, string | number | boolean | undefined | null>) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const serialized = search.toString();
  return serialized ? `?${serialized}` : '';
};

export const routes = {
  // Public / auth
  welcome: () => '/welcome',
  login: (params?: { redirectTo?: string; message?: string }) => `/login${qs({ ...params })}`,
  signup: (params?: { redirectTo?: string }) => `/signup${qs({ ...params })}`,
  forgotPassword: () => '/forgot-password',
  howItWorks: () => '/how-it-works',

  // Primary destinations (the five mobile tabs)
  // '/' now belongs to the public marketing homepage (kaamasaan-marketing-site
  // ported in) — the authenticated dashboard moved to /home. See PORTING_LOG
  // "Marketing redesign — shell" for the reasoning.
  home: () => '/home',
  marketplace: () => '/marketplace',
  mySystem: () => '/my-system',
  myProject: () => '/my-project',
  profile: () => '/profile',

  // Design system wizard
  design: (step: DesignStepSlug = 'appliances', params?: { packageNotice?: string }) =>
    `/design/${step}${qs({ ...params })}`,

  // Marketplace
  marketplaceCategory: (category: ProductCategory) => `/marketplace/${category}`,
  productDetail: (
    productId: string,
    params?: { customBuilderEdit?: 'panel' | 'inverter' | 'battery'; returnToCustomSummary?: boolean }
  ) => `/marketplace/product/${productId}${qs({ ...params })}`,
  solarAccessories: () => '/marketplace/accessories',

  // My system
  systemSummary: (params?: {
    packageId?: string;
    mode?: 'recommended' | 'custom';
    totalBackupWatts?: number;
    runningLoadKw?: number;
    backupHours?: number;
    rawEnergyKwh?: number;
    recommendedBatteryKwh?: number;
  }) => `/my-system/summary${qs({ ...params })}`,
  customSystemSummary: () => '/my-system/custom-summary',

  // Survey booking
  bookSurvey: (params?: {
    packageId?: string;
    bookingContext?: BookingContext;
    source?: BookSurveySource;
    selectedServiceType?: ElectricalServiceType;
    selectedServiceTitle?: string;
  }) => `/book-survey${qs({ ...params })}`,
  surveyConfirmation: (bookingId: string) => `/book-survey/confirmation/${bookingId}`,
  solarJourney: (bookingId: string) => `/my-project/journey/${bookingId}`,

  // Support
  complaint: () => '/support/complaint',
  helpCenter: () => '/support/help',

  // Services
  preventiveMaintenance: () => '/services/preventive-maintenance',
  cleaningEstimator: () => '/services/cleaning',
  installationService: () => '/services/installation',
  electricalServices: () => '/services/electrical',
  electricalBooking: (params: { selectedService: ElectricalServiceType }) =>
    `/services/electrical/book${qs({ ...params })}`,
  maintenancePackages: () => '/services/maintenance',
  maintenancePlanDetails: (planId: string) => `/services/maintenance/${planId}`,
  maintenanceBooking: (planId: string, params?: { renewalFromPlanId?: string }) =>
    `/services/maintenance/${planId}/book${qs({ ...params })}`,
  maintenanceBookingConfirmation: (requestId: string) => `/services/maintenance/confirmation/${requestId}`,
  premiumCareProgress: (params?: { planId?: string; requestId?: string; visitId?: string }) =>
    `/services/premium-care${qs({ ...params })}`,
  liveTracking: () => '/services/tracking',
  postServiceHealthReport: () => '/services/health-report',
  solarCareMembership: () => '/services/solar-care',

  // Smart tools
  roofSpaceTool: () => '/tools/roof-space',
  roiCalculator: () => '/tools/roi',
  roiResult: (params: {
    systemSize: number;
    batterySize: number;
    totalCost: number;
    estimatedMonthlySavings?: number;
  }) => `/tools/roi/result${qs({ ...params })}`,
  solarSizeTool: () => '/tools/solar-size',
  recommendedSolarSize: (params: { loadKw: number; systemKw: number }) =>
    `/tools/solar-size/result${qs({ ...params })}`,
  batterySizeTool: () => '/tools/battery-size',
  batteryRunningLoad: () => '/tools/battery-size/load',
  batteryRecommendedSize: () => '/tools/battery-size/result',

  // Misc
  notifications: () => '/notifications'
} as const;

/**
 * Routes that require a session, mirroring the two Protected wrappers in
 * kaamasaan-mobile's RootNavigator. Enforced in src/proxy.ts — see the note
 * there on why this is an allowlist rather than a blocklist.
 */
export const protectedRoutes = ['/home', '/my-system', '/my-project', '/profile', '/book-survey'] as const;
