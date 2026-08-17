# Route Map — mobile screen → web route

Status legend: **TODO** · **WIP** · **DONE**

Source of truth for params: `kaamasaan-mobile/src/types/navigation.types.ts`.
Route builders live in `src/constants/routes.ts` — always link through those, never hardcode a path.

Auth is enforced server-side in `src/proxy.ts` (Next.js 16 renamed `middleware.ts` → `proxy.ts`).
It is an **allowlist of protected routes**, mirroring mobile's two Protected wrappers:
`/`, `/my-system`, `/my-project`, `/profile`, `/book-survey`. Everything else — the
design wizard, smart tools, service screens, product detail — is public by design,
because mobile lets customers design a system before signing in. `/marketplace` is
public here for SEO (Phase 5 deviation).

| # | Mobile screen | Web route | Phase | Status |
|---|---|---|---|---|
| 1 | `Onboarding` | `/welcome` | 4 | **DONE** |
| 2 | `Login` | `/login` | 4 | **DONE** |
| 3 | `Signup` | `/signup` | 4 | **DONE** |
| 4 | `ForgotPassword` | `/forgot-password` | 4 | **DONE** |
| 5 | `MainTabs → Home` | `/` | 5 | **DONE** |
| 6 | `MainTabs → Marketplace` | `/marketplace` | 5 | **DONE** |
| 7 | `MainTabs → MySystem` | `/my-system` | 7 | **DONE** |
| 8 | `MainTabs → MyProject` | `/my-project` | 7 | **DONE** |
| 9 | `MainTabs → Profile` | `/profile` | 4 | **DONE** |
| 10 | `DesignFlow` | `/design/[step]` | 6 | **DONE** — all 8 steps |
| 11 | `MarketplaceFlow` | `/marketplace/[category]` | 5 | **DONE** |
| 12 | `ProductDetail` | `/marketplace/product/[productId]` | 5 | **DONE** |
| 13 | `SolarAccessories` | `/marketplace/accessories` | 5 | **DONE** — alias to `/marketplace/accessory` |
| 14 | `SystemSummary` | `/my-system/summary` | 7 | **DONE** |
| 15 | `CustomSystemSummary` | `/my-system/custom-summary` | 7 | **DONE** |
| 16 | `BookSurvey` | `/book-survey` | 8 | **DONE** — submission unverified |
| 17 | `SurveyConfirmation` | `/book-survey/confirmation/[bookingId]` | 8 | **DONE** |
| 18 | `MySolarJourney` | `/my-project/journey/[bookingId]` | 7 | **DONE** |
| 19 | `Complaint` | `/support/complaint` | 11 | **DONE** |
| 20 | `HelpCenter` | `/support/help` | 11 | **DONE** |
| 21 | `HowItWorks` | `/how-it-works` | 11 | **DONE** |
| 22 | `PreventiveMaintenance` | `/services/preventive-maintenance` | 9 | **DONE** |
| 23 | `CleaningServiceEstimator` | `/services/cleaning` | 9 | **DONE** |
| 24 | `InstallationService` | `/services/installation` | 9 | **DONE** |
| 25 | `ElectricalWorkServices` | `/services/electrical` | 9 | **DONE** |
| 26 | `ElectricalWorkBooking` | `/services/electrical/book` | 9 | **DONE** |
| 27 | `MaintenancePackages` | `/services/maintenance` | 9 | **DONE** |
| 28 | `MaintenancePlanDetails` | `/services/maintenance/[planId]` | 9 | **DONE** |
| 29 | `MaintenanceBooking` | `/services/maintenance/[planId]/book` | 9 | **DONE** |
| 30 | `MaintenanceBookingConfirmation` | `/services/maintenance/confirmation/[requestId]` | 9 | **DONE** |
| 31 | `PremiumCareProgress` | `/services/premium-care` | 9 | **DONE** |
| 32 | `LiveTracking` | `/services/tracking` | 9 | **DONE** |
| 33 | `PostServiceHealthReport` | `/services/health-report` | 9 | **DONE** |
| 34 | `SolarCareMembership` | `/services/solar-care` | 9 | **DONE** |
| 35 | `RoofSpaceTool` | `/tools/roof-space` | 10 | **DONE** |
| 36 | `ROICalculator` | `/tools/roi` | 10 | **DONE** |
| 37 | `ROIResult` | `/tools/roi/result` | 10 | **DONE** |
| 38 | `SolarSizeTool` | `/tools/solar-size` | 10 | **DONE** |
| 39 | `RecommendedSolarSize` | `/tools/solar-size/result` | 10 | **DONE** |
| 40 | `BatterySizeTool` | `/tools/battery-size` | 10 | **DONE** |
| 41 | `BatteryRunningLoad` | `/tools/battery-size/load` | 10 | **DONE** |
| 42 | `BatteryRecommendedSize` | `/tools/battery-size/result` | 10 | **DONE** |
| 43 | `Notifications` | `/notifications` | 11 | **DONE** |

## Web-only routes

| Route | Purpose | Status |
|---|---|---|
| `/auth/confirm` | Exchanges Supabase email-link tokens (confirmation, password reset) for a session cookie. No mobile counterpart — native uses deep links. | **DONE** |

## Rendering strategy

| Route | Rendering |
|---|---|
| `/marketplace`, `/marketplace/[category]`, `/marketplace/product/[productId]` | Server component, **dynamically rendered with the catalog query cached for 1h** via `unstable_cache` (see `src/features/marketplace/catalog.ts`). Full HTML for crawlers + per-product metadata and OG images. Not statically generated because the root layout reads the language cookie — see PORTING_LOG Phase 4. |
| Everything else, including `/how-it-works` | Client components under the authenticated shell. `/how-it-works` was originally slated as a Server Component (BUILD_PROMPT §7) but needed client state for the step-detail modal, so it stayed client-rendered like the rest — see PORTING_LOG Phase 11. |
