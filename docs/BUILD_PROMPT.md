# KaamAsaan Web — Build Prompt

> Paste this as the opening instruction for the agent/session that builds `kaamasaan-web`.
> It is written to be executed incrementally, phase by phase. Do not attempt the whole thing in one pass.

---

## 1. Mission

Build **KaamAsaan Web** — a responsive, browser-first web application that is a **feature-complete port of the existing KaamAsaan React Native (Expo) mobile app**, sharing the same Supabase backend, the same business logic, and the same visual identity.

This is a **port, not a redesign**. Every screen, calculation, price, copy string, colour and flow that exists on mobile must exist on web and produce **identical outputs for identical inputs**. What changes is the *layout* (desktop-first responsive instead of a 390px phone) and the *platform primitives* (DOM instead of React Native).

**Critical rule: the mobile app is the specification.** When in doubt about behaviour, open the mobile source file and match it. Never invent business rules, prices, thresholds, copy, or product data.

---

## 2. Source of truth — read these before writing code

All paths are relative to `C:\Users\TECHNIFI\.gemini\antigravity\scratch\KaamAsaan\`.

| What | Where |
|---|---|
| **Mobile app (the spec)** | `kaamasaan-mobile/` — Expo + React Native + NativeWind + Zustand + Supabase |
| Mobile screens (39 screens) | `kaamasaan-mobile/src/mobile/screens/**` |
| Mobile navigation + full route map | `kaamasaan-mobile/src/mobile/navigation/RootNavigator.tsx` |
| Route params (the contract per screen) | `kaamasaan-mobile/src/types/navigation.types.ts` |
| Zustand stores | `kaamasaan-mobile/src/store/**` |
| Supabase data services | `kaamasaan-mobile/src/services/**` |
| **Calculation engines (port verbatim)** | `kaamasaan-mobile/src/utils/**` |
| Zod schemas | `kaamasaan-mobile/src/schemas/**` |
| i18n EN/UR + RTL handling | `kaamasaan-mobile/src/i18n/**` |
| Theme tokens | `kaamasaan-mobile/src/constants/colors.ts`, `kaamasaan-mobile/tailwind.config.js` |
| Static catalog/constants | `kaamasaan-mobile/src/constants/**`, `kaamasaan-mobile/src/data/**` |
| Generated DB types | `kaamasaan-mobile/src/types/supabase.generated.ts` |
| **Backend** | `backend-development/` |
| DB schema doc | `backend-development/database-schema.md` |
| Query/service plan | `backend-development/api-structure.md` |
| RLS policies | `backend-development/rls-policies.md` |
| Base SQL schema | `backend-development/supabase-sql-schema.sql` |
| Migrations (authoritative, newer than docs) | `backend-development/supabase/migrations/**`, `backend-development/migrations/**` |
| Seed data | `backend-development/seed-data.sql`, `backend-development/seed-products-market-rates.sql` |
| Package generation rules | `backend-development/package-generation.md` |
| **Visual reference screenshots** | `kaamasaan-mobile/KaamAsaan Screens/*.jpeg` (10 screens) |
| Existing legacy web SPA (older, do NOT copy structure) | `src/` at repo root — reference only for ROI/marketing copy |

**Read order for the first session:** `RootNavigator.tsx` → `navigation.types.ts` → `useSystemStore.ts` → `constants/colors.ts` + `tailwind.config.js` → `services/marketplace.api.ts` → `utils/packageEngine.ts` → `utils/commercialRecommendation.ts` → the 10 screenshots.

---

## 3. Stack (decided — do not substitute)

| Concern | Choice |
|---|---|
| Framework | **Next.js (App Router)**, latest stable, TypeScript strict |
| Runtime | React 19 |
| Styling | **Tailwind CSS v4** with the KaamAsaan token set below |
| State | **Zustand** (+ `persist` middleware, `localStorage`) — ported 1:1 from mobile |
| Server state / caching | **TanStack Query v5** (mobile already uses it) |
| Backend | **Supabase** — same project, same tables, same RLS. `@supabase/supabase-js` + `@supabase/ssr` |
| Forms | **react-hook-form** + `@hookform/resolvers` + **Zod** (reuse mobile schemas) |
| Icons | **lucide-react** (mobile uses `lucide-react-native` — same icon names, so imports map 1:1) |
| i18n | **i18next + react-i18next**, EN + UR with RTL |
| Charts/visuals | Plain SVG/CSS. No chart library unless a mobile screen genuinely needs one |
| PDF export | `@react-pdf/renderer` **or** print-to-PDF via a styled print stylesheet (ROI report) |
| Animation | CSS transitions / `framer-motion` only where the mobile app used Reanimated (shimmer sweep, marquee) |
| Package manager | npm |

**Do not add:** Redux, MUI, Chakra, shadcn wholesale, styled-components, axios, moment. Keep the dependency list close to mobile's.

---

## 4. Project setup

Working directory: `C:\Users\TECHNIFI\.gemini\antigravity\scratch\KaamAsaan\kaamasaan-web\`

```
kaamasaan-web/
├─ docs/
│  ├─ BUILD_PROMPT.md          # this file
│  ├─ PORTING_LOG.md           # running log: screen → route, status, deviations
│  └─ ROUTE_MAP.md             # generated in Phase 1
├─ public/
│  └─ assets/                  # copied from kaamasaan-mobile/src/assets + root images
├─ src/
│  ├─ app/                     # Next.js App Router routes (see §7)
│  │  ├─ (marketing)/          # onboarding / landing, public
│  │  ├─ (auth)/               # login, signup, forgot-password
│  │  └─ (app)/                # authenticated shell: home, marketplace, my-system, my-project, profile, tools, services
│  ├─ components/
│  │  ├─ ui/                   # AppButton, AppText, Card, Header, Screen, SafeImage, BrandLogo, Stepper, Modal, Sheet
│  │  ├─ layout/               # AppShell, DesktopSidebar, TopBar, MobileTabBar, PageContainer
│  │  ├─ cards/                # ProductCard, InfoCard, PackageCard
│  │  ├─ marketplace/
│  │  ├─ solar-tools/          # PanelLayoutVisualizer, QuantityStepper
│  │  ├─ notifications/        # NotificationCard, TopNotificationBanner
│  │  └─ promo/                # PromoCodeCard
│  ├─ features/                # one folder per mobile screen group (design-system, marketplace, my-system, services, solar-tools, survey, support, notifications, profile)
│  ├─ store/                   # ported Zustand stores
│  ├─ services/                # ported Supabase services
│  ├─ hooks/                   # ported hooks
│  ├─ utils/                   # ported calculation engines (+ their tests)
│  ├─ schemas/                 # ported Zod schemas
│  ├─ types/                   # ported types + supabase.generated.ts
│  ├─ constants/               # colors, products, routes, support
│  ├─ data/                    # maintenancePlans etc.
│  ├─ config/                  # packageCustomization
│  ├─ i18n/                    # provider + en.json + ur.json (copied, then extended)
│  └─ lib/                     # supabase client (browser + server), formatters
├─ .env.local.example
└─ package.json
```

Environment variables (rename from Expo's `EXPO_PUBLIC_*`):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Point these at the **same Supabase project** the mobile app uses (see `kaamasaan-mobile/.env.local`). Do not create a new backend, do not write new migrations, do not modify existing tables. If web needs a schema change, stop and flag it.

---

## 5. Design system — exact tokens, non-negotiable

Ported from `kaamasaan-mobile/src/constants/colors.ts` and `tailwind.config.js`. The brand is a **warm cream + navy + yellow** palette — light theme only. (Note: the older legacy web SPA at repo root uses a dark theme — **ignore it entirely**, the mobile app's light cream theme is the current brand.)

```js
colors: {
  kaam: {
    cream:   '#FFF7E6',  // app background
    surface: '#F8F1E5',  // secondary surface
    card:    '#FFFFFF',  // cards, tab bar, elevated
    navy:    '#10243C',  // primary text, dark buttons
    muted:   '#6B7280',  // secondary text, inactive icons
    line:    '#E9DEC9',  // borders, dividers
    yellow:  '#FACC15',  // primary CTA background
    amber:   '#F59E0B',  // active/accent, active tab tint
    green:   '#128A3E',  // success, savings
    red:     '#E11D48',  // error, destructive
  }
}
borderRadius: { xl2: '22px' }
```

Component conventions carried over from mobile:

- **Primary button** — `bg-kaam-yellow`, `text-kaam-navy`, `font-extrabold`, `h-12`, `rounded-2xl`, `px-5`. Disabled → `opacity-50`.
- **Secondary button** — `bg-white border border-kaam-line`, navy text.
- **Dark button** — `bg-kaam-navy`, white text.
- **Ghost button** — transparent, navy text.
- **Cards** — white, `rounded-2xl`/`rounded-xl2`, `border border-kaam-line`, generous padding, soft shadow.
- **Typography** — heavy weights are the signature: titles `font-extrabold`, labels `font-extrabold text-[10px]–text-xs`. Body 13–15px, captions 11–12px in `kaam-muted`.
- **Page background** is always `kaam-cream`; content sits on white cards.
- **Currency** — always `PKR` with `en-PK`/`en-US` grouping. Reuse `utils/formatters.ts` verbatim.

Recreate `AppButton`, `AppText`, `Header`, `Screen`, `SafeImage`, `BrandLogo`, `PremiumShimmerSweep` as web components with the same prop APIs (`tone`, `variant`, `title`, `subtitle`, `onBack`, `right`) so ported screen code changes as little as possible.

Cross-check every screen against the screenshots in `kaamasaan-mobile/KaamAsaan Screens/`.

---

## 6. Responsive strategy — desktop-first, mobile-faithful

The web app must feel like a **real web app on desktop**, and like the mobile app on phones.

**Breakpoints:** `< 768px` = mobile, `768–1279px` = tablet, `>= 1280px` = desktop.

### Desktop (>= 1024px)
- **Persistent left sidebar** replaces the bottom tab bar: Home, Marketplace, My System, My Project, Profile — same five destinations, same lucide icons (`Home`, `ShoppingBag`, `PanelsTopLeft`, `ClipboardList`, `User`), active item tinted `kaam-amber`.
- **Top bar**: KaamAsaan logo, global search (marketplace), language switcher (EN/اردو), notification bell with unread badge, account menu.
- **Content max-width** ~1280px, centered, generous whitespace on cream.
- **Marketplace**: 3–4 column product grid with a left filter rail (category, brand, capacity, price) — mobile's filter sheet becomes a persistent sidebar.
- **Product detail**: two-column — gallery left, sticky buy/spec panel right; tabs/accordions below.
- **Design wizard (8 steps)**: horizontal step rail across the top; each step is a centered ~800px card. Two-column where it helps (appliance picker left, live load summary right — the summary is a sticky sidebar instead of a mobile footer bar).
- **System summary / package comparison**: side-by-side package cards rather than a horizontal carousel.
- **Modals** are real centered dialogs, not bottom sheets.

### Mobile (< 768px)
- **Bottom tab bar** identical to mobile app (5 tabs, 64px, `kaam-card` bg, `kaam-line` top border, amber active).
- Single-column, full-bleed cards, bottom sheets for filters and pickers, sticky bottom CTA bars — matching the mobile screens exactly.

### Rules
- Same components, responsive variants — **never fork a screen into `HomeMobile` + `HomeDesktop`**. Use Tailwind responsive classes and at most one `useBreakpoint()` hook for structural swaps (sheet vs dialog).
- Every interactive element must be keyboard-accessible and have a visible focus ring. Hover states are new on web — add them tastefully (card lift, border → amber).
- Touch targets stay >= 44px on mobile.

---

## 7. Route map — port all 39 screens

Convert React Navigation routes to Next.js App Router paths. **Route params become path segments or search params** — read `navigation.types.ts` for the exact param contract of each screen and preserve it.

| Mobile screen | Web route | Notes |
|---|---|---|
| `Onboarding` | `/welcome` | public; redirect to `/` once `hasSeenOnboarding` |
| `Login` | `/login` | supports `?redirectTo=book-survey&message=` |
| `Signup` | `/signup` | supports `?redirectTo=` |
| `ForgotPassword` | `/forgot-password` | |
| `MainTabs → Home` | `/` | protected |
| `MainTabs → Marketplace` | `/marketplace` | |
| `MainTabs → MySystem` | `/my-system` | |
| `MainTabs → MyProject` | `/my-project` | |
| `MainTabs → Profile` | `/profile` | |
| `DesignFlow` | `/design/[step]` | steps: `appliances`, `solar`, `roof`, `backup-need`, `backup-appliances`, `backup-plan`, `recommended`, `packages`. Deep-linkable, guarded by store progress |
| `MarketplaceFlow` | `/marketplace/[category]` | `inverter` \| `panel` \| `battery` \| `accessory` |
| `ProductDetail` | `/marketplace/product/[productId]` | `?customBuilderEdit=panel\|inverter\|battery&returnToCustomSummary=1` |
| `SystemSummary` | `/my-system/summary` | `?packageId=&mode=recommended\|custom` + battery-sizing params |
| `CustomSystemSummary` | `/my-system/custom-summary` | |
| `BookSurvey` | `/book-survey` | **protected**; `?packageId=&bookingContext=&source=&selectedServiceType=&selectedServiceTitle=` |
| `SurveyConfirmation` | `/book-survey/confirmation/[bookingId]` | |
| `MySolarJourney` | `/my-project/journey/[bookingId]` | |
| `Complaint` | `/support/complaint` | |
| `HelpCenter` | `/support/help` | |
| `HowItWorks` | `/how-it-works` | public, SEO |
| `PreventiveMaintenance` | `/services/preventive-maintenance` | |
| `CleaningServiceEstimator` | `/services/cleaning` | |
| `InstallationService` | `/services/installation` | |
| `ElectricalWorkServices` | `/services/electrical` | |
| `ElectricalWorkBooking` | `/services/electrical/book` | `?selectedService=` |
| `MaintenancePackages` | `/services/maintenance` | |
| `MaintenancePlanDetails` | `/services/maintenance/[planId]` | |
| `MaintenanceBooking` | `/services/maintenance/[planId]/book` | `?renewalFromPlanId=` |
| `MaintenanceBookingConfirmation` | `/services/maintenance/confirmation/[requestId]` | |
| `PremiumCareProgress` | `/services/premium-care` | `?planId=&requestId=&visitId=` |
| `LiveTracking` | `/services/tracking` | |
| `PostServiceHealthReport` | `/services/health-report` | |
| `SolarCareMembership` | `/services/solar-care` | |
| `SolarAccessories` | `/marketplace/accessories` | |
| `RoofSpaceTool` | `/tools/roof-space` | |
| `ROICalculator` | `/tools/roi` | |
| `ROIResult` | `/tools/roi/result` | `?systemSize=&batterySize=&totalCost=&estimatedMonthlySavings=` |
| `SolarSizeTool` | `/tools/solar-size` | |
| `RecommendedSolarSize` | `/tools/solar-size/result` | `?loadKw=&systemKw=` |
| `BatterySizeTool` | `/tools/battery-size` | |
| `BatteryRunningLoad` | `/tools/battery-size/load` | appliance selection carried in store, not URL |
| `BatteryRecommendedSize` | `/tools/battery-size/result` | |
| `Notifications` | `/notifications` | |

Write the final table into `docs/ROUTE_MAP.md` as you build, marking each row **TODO / IN PROGRESS / DONE**.

### Rendering strategy
- **Server components + SSG/ISR** for public, SEO-valuable pages: `/how-it-works`, `/marketplace`, `/marketplace/[category]`, `/marketplace/product/[productId]`. Generate metadata (title, description, OG image) per product. Revalidate ~1h.
- **Client components** for everything stateful: design wizard, tools, booking flows, my-system, my-project, profile, notifications.
- Auth via `@supabase/ssr` cookie-based sessions so protected routes can be guarded in `src/proxy.ts` (server-side redirect to `/login?redirectTo=...`) instead of a client-side flash. **Next.js 16 renamed `middleware.ts` → `proxy.ts`**; the exported function must be named `proxy` and runs on the nodejs runtime (edge is not supported there). Already implemented in Phase 1.

---

## 8. React Native → Web porting rules

Apply mechanically. Do not "improve" logic while porting.

| React Native | Web |
|---|---|
| `<View>` | `<div>` |
| `<Text>` / `AppText` | `<p>` / `<span>` / heading tag + `AppText` wrapper |
| `<Pressable>` / `<TouchableOpacity>` | `<button>` (or `<Link>` when navigating) — **must be a real button for a11y** |
| `<ScrollView>` | `<div className="overflow-y-auto">` or natural page scroll |
| `<FlatList>` / `<SectionList>` | `.map()`; virtualize only if a list exceeds ~200 items |
| `<Image source={require()}>` / `SafeImage` | `next/image` wrapped in a `SafeImage` that keeps the fallback behaviour |
| `<Modal>` / bottom sheet | Radix-style dialog on desktop; bottom sheet (translate-y) on mobile |
| `StyleSheet.create` | Tailwind classes (convert every style object; keep exact px/colour values) |
| `className` via NativeWind | Tailwind directly — most classes carry over unchanged |
| `useWindowDimensions` | `useBreakpoint()` hook (matchMedia based) |
| `SafeAreaView` / insets | Not needed; drop `getSafeBottomPadding`, use normal padding |
| `AsyncStorage` | `localStorage` (via `createJSONStorage(() => localStorage)`) |
| `@react-navigation` `navigation.navigate/replace/reset` | `next/navigation` `useRouter().push/replace` + a typed `routes.ts` helper |
| `route.params` | `useParams()` / `useSearchParams()` — validate with Zod |
| `Linking.openURL` | `window.open` / `<a target="_blank" rel="noreferrer">` (WhatsApp deep links stay `https://wa.me/...`) |
| `expo-print` + `expo-sharing` + `expo-file-system` (ROI PDF) | `@react-pdf/renderer` download, or reuse the existing HTML template with a print stylesheet + `window.print()` |
| `expo-image-picker` (complaint photos) | `<input type="file" accept="image/*">` + preview + Supabase Storage upload |
| `expo-video` (My System explainer) | `<video controls playsInline>` |
| `expo-localization` | `navigator.language` + stored preference |
| `react-native-reanimated` (shimmer, marquee) | CSS keyframes / `framer-motion` |
| `lucide-react-native` | `lucide-react` — identical icon names |
| `I18nManager.forceRTL` | `<html dir="rtl">` + Tailwind logical properties (`ps-`/`pe-`/`ms-`/`me-`) |
| `__DEV__` | `process.env.NODE_ENV !== 'production'` |

---

## 9. State layer — port these stores verbatim

Copy from `kaamasaan-mobile/src/store/`, swapping only the storage adapter and any RN imports. **Keep store names, state shape, action names, `persist` keys, `version` numbers and `migrate` functions identical** — this is what guarantees behavioural parity.

| Store | Persist key | Role |
|---|---|---|
| `useSystemStore` | `kaamasaan-system-draft` (v7) | **The heart of the app.** Appliances, backup appliances, design step progress, recommended kW, panel wattage/orientation/quantity override, battery config, selected panel/inverter/battery/accessories, custom system builder, recommended packages + selection, booking context, cleaning estimate, installation details, promo state. ~700 lines — port carefully, do not restructure. |
| `useAuthStore` | (not persisted; Supabase session is) | Session, customer profile, sign in/up/out, password reset, profile update, `role === 'customer'` enforcement |
| `useAppStore` | `kaamasaan-app-state` | `hasSeenOnboarding`, `hasHydrated`, dismissed cancelled-survey ids |
| `useMarketplaceStore` | in-memory | selected products, compare ids (max 2), cart items |
| `useMaintenanceBookingStore` | — | maintenance booking draft |
| `useNotificationSessionStore` | — | per-session notification state, reset on sign-out |

Ported hooks (`src/hooks/`): `useHomeLocation`, `useMaintenanceLifecycle`, `useMySystemStatus`, `useNotifications`, `useProducts`, `useRecommendationConfiguration`, `useSurveyJourney`, `useSystemRecommendation`.

**Hydration note:** Zustand `persist` + SSR causes hydration mismatches. Gate persisted-state-dependent UI on a `hasHydrated` flag (the pattern already exists in `useAppStore`) and render a skeleton until then.

---

## 10. Data layer — Supabase

Port `src/services/*` as-is; they are plain `supabase-js` calls and need almost no change.

| Service | Tables / RPCs touched |
|---|---|
| `marketplace.api.ts` (~800 lines, the biggest) | `products`, `brands`, `product_families`, `family_compatibility`, `product_compatibility`, `product_compatibility_exceptions`, `package_templates` |
| `system.api.ts` | `survey_bookings`, RPC `create_survey_booking_with_promo` |
| `journey.api.ts` | `survey_bookings` (status timeline / milestones) |
| `maintenance.api.ts` | `maintenance_requests`, `maintenance_visits`, `maintenance_plans`, `maintenance_status_history`, `maintenance_feedback`; RPCs `create_premium_care_plan`, `submit_maintenance_feedback`, `cancel_maintenance_request` |
| `notifications.api.ts` | `notifications` |
| `promo.api.ts` | RPC `validate_promo_code`, tables `promo_codes`, `promo_redemptions` |
| `recommendation.api.ts` | `recommendation_settings`, `load_sizing_rules`, `battery_uplift_rules` |
| `complaints.api.ts` | `complaints` |
| profile (in `useAuthStore`) | `profiles` |

Also present: `system_designs`, `smart_tool_results`, `survey_booking_status_history`, view `commercial_product_spec_diagnostics`, RPCs `admin_transition_maintenance_visit`, `enqueue_premium_care_visit_reminders`.

Rules:
- Copy `src/types/supabase.generated.ts` over unchanged.
- **All access goes through RLS as the signed-in customer.** Never use a service-role key in the web app. No server route may bypass RLS.
- Keep the graceful-degradation pattern: `isSupabaseConfigured` guard, and the static fallbacks in `constants/products.ts` when the catalog query fails.
- Use TanStack Query for every read (same query keys as mobile where they exist) with sensible `staleTime`; server components may fetch directly for SSG pages.
- Preserve the image-URL versioning helpers (`normalizePublicStorageUrl`, `versionBrandLogoUrl`, the `?v=updated_at` cache-buster) — product/brand images break without them.

---

## 11. Calculation engines — copy, do not rewrite

These files are the commercial core. **Copy them byte-for-byte** (they are pure TypeScript with no RN dependency) and copy their tests too. If a number differs between mobile and web, that is a P0 bug.

```
utils/calculations.ts               recommendSolarKw, calculatePanelCount, calculateRoofSpace, backup requirement summary
utils/packageEngine.ts (+test)      DB-driven package generation
utils/packageBuilder.ts             recommended package assembly, getProductWatt
utils/packageCustomization.ts       component swap rules
utils/commercialRecommendation.ts (+test)  commercial sizing, BATTERY_RECOMMENDATION_ENGINE_VERSION
utils/batteryRecommendation.ts (+test)     battery configuration selection
utils/batteryCapacity.ts            kWh/Wh normalisation
utils/batteryCommercialRules.ts     parallel/tier limits
utils/customSystemBuilder.ts        custom system state machine
utils/capacity.ts                   kW/W parsing + formatting
utils/cleaningPricing.ts            cleaning estimator pricing
utils/recommendationDefaults.ts
utils/panelProducts.ts, productCategory.ts, productEligibility.ts, brandLogo.ts, packageImages.ts
utils/promo.ts                      promo state, context signature
utils/surveyMilestones.ts, projectStatus.ts, activeProject.ts (+test)
utils/notificationActions.ts, notificationPriority.ts
utils/surveyPackageSnapshot.ts
utils/formatters.ts, storage.ts
utils/catalogRegression.test.ts
```

Set up **Vitest** and make every ported `*.test.ts` pass before building UI on top of them. That test suite is the parity guarantee. (The mobile repo has no test runner configured — adding Vitest on web is an improvement, not a deviation.)

---

## 12. i18n and RTL

- Copy `src/i18n/locales/en.json` and `ur.json`. Top-level namespaces: `common, tabs, auth, onboarding, profile, home, menu, notifications, products, tools, marketplace, survey, project, services, errors`.
- Coverage on mobile is **partial** — many screens still have hardcoded English. As you port each screen, **extract its strings into `en.json` and add the Urdu translation**, extending the existing namespaces rather than inventing new ones. Log any untranslated string in `PORTING_LOG.md`.
- Language preference persists under `kaamasaan.language`; default `en`; auto-suggest `ur` when the browser locale is Urdu.
- Urdu is RTL: set `<html lang="ur" dir="rtl">`, use logical Tailwind utilities (`ps-*`, `pe-*`, `ms-*`, `me-*`, `text-start`, `text-end`), and mirror directional icons (back arrows, chevrons). Unlike mobile, no app restart is needed for RTL — that is a genuine web win, make the switch instant.
- Numbers and currency stay Western-Arabic digits with `en-PK` formatting in both languages (matches mobile).

---

## 13. Auth and route protection

Mirror the mobile rules exactly:
- Only `profiles.role === 'customer'` may sign in. Any other role → immediate sign-out with the `errors.customerOnly` message.
- Sign-up collects `full_name`, `phone`, `city`, `email`, `password`; handle the email-confirmation-required branch.
- `/book-survey` and the whole `(app)` group are protected → redirect to `/login?redirectTo=<path>` and return the user to their intended destination after login.
- Startup destination: no session → `/login` (or `/welcome` if onboarding unseen); session → `/`.
- Show the `auth.checkingAccount` loading state while the session resolves, and reset the notification session store on sign-out.

---

## 14. Feature checklist — nothing may be dropped

Each item must work end-to-end against the real Supabase data before it counts as done.

**Home** — hero + Design System CTA (with shimmer sweep), continue-plan progress bar, active-journey bar, smart-tools row, marketplace categories, services grid, brand logo marquee, why-KaamAsaan section, menu, notification bell + top banner.

**Design System wizard (8 steps)** — appliances → solar recommendation → roof space (with `PanelLayoutVisualizer`, orientation, quantity override) → backup need → backup appliances (per-appliance hours) → backup plan → recommended system → recommended packages. Back/forward navigation preserving all store state; resume from `lastDesignStep`.

**Marketplace** — category browse, brand filtering, product grid, product detail (gallery, specs, compatibility, warranty, stock, badges, compare-at price, package contents, usage instructions), compare (max 2), add-to-cart, custom-system builder entry points, solar accessories.

**My System** — current system status, explainer video, system summary (recommended and custom modes), custom system summary, package customization/component swap.

**My Project** — active project status, solar journey milestones, booking timeline, cancellation handling.

**Survey booking** — book survey across all booking contexts (`general`, `solar_package`, `custom_system`, `cleaning`, `installation`, `electrical`), promo code apply/remove with live total recalculation, confirmation screen with reference code, my-solar-journey progress.

**Services** — preventive maintenance, cleaning estimator (priced), installation service, electrical work services + booking, maintenance packages (Essential Care PKR 15,000 / Standard PKR 7,999 / Premium Care PKR 20,000 — read `data/maintenancePlans.ts` for the live values), plan details, maintenance booking + confirmation, premium care progress with visit feedback, live tracking, post-service health report, solar care membership.

**Smart tools** — ROI calculator + result + **PDF export**, solar size tool + recommended size, battery size tool → running load → recommended size, roof space tool.

**Support** — complaint (with photo upload), help center, how it works.

**Notifications** — list, unread badge, priority ordering, deep-link actions into the relevant screen, top banner.

**Profile** — profile view/edit (name, phone, city), language switcher, sign out.

**Cross-cutting** — onboarding, login/signup/forgot-password, empty states, loading skeletons, error boundaries, offline/failed-fetch fallbacks.

---

## 15. Build order

Ship in this order; each phase must be runnable and reviewable before the next starts.

1. **Scaffold** — Next.js + TS + Tailwind v4 + tokens + Vitest + ESLint. Supabase browser/server clients. Empty `AppShell` with desktop sidebar and mobile tab bar. `docs/ROUTE_MAP.md` skeleton.
2. **Logic port** — copy `utils/`, `types/`, `schemas/`, `constants/`, `data/`, `config/`. Get every ported test green. **No UI yet.**
3. **Data + state** — port `lib/supabase`, `services/`, `store/`, `hooks/`. Verify against live Supabase with a scratch page that dumps products, brands, and a package generation result.
4. **Auth + shell** — i18n provider (EN/UR + RTL), onboarding, login, signup, forgot-password, profile. (The `src/proxy.ts` route guard already landed in Phase 1.)
5. **Home + Marketplace** — home page in full, marketplace browse/category/product detail, SSG + metadata, compare, cart.
6. **Design wizard** — all 8 steps, desktop step rail + sticky summary, deep-linkable, resumable.
7. **My System / My Project / Summaries** — recommended + custom summaries, package customization, solar journey.
8. **Booking + promo** — book survey across all contexts, promo validation, confirmation.
9. **Services** — all 12 service screens including maintenance lifecycle and premium care.
10. **Smart tools** — 7 tool screens + ROI PDF export.
11. **Support + notifications** — complaint with upload, help center, how it works, notifications.
12. **Polish** — a11y pass (keyboard, focus, ARIA, contrast), Lighthouse (target >= 90 perf/a11y/SEO on public pages), full Urdu/RTL sweep, responsive QA at 375 / 768 / 1024 / 1440 / 1920, error/empty/loading states everywhere.

After every phase: update `docs/PORTING_LOG.md` and `docs/ROUTE_MAP.md`, and run `npm run typecheck && npm run lint && npm run test`.

---

## 16. Guardrails

**Do not:**
- Modify anything inside `kaamasaan-mobile/` or `backend-development/`. Both are read-only references.
- Create migrations or alter the Supabase schema. Flag the need instead.
- Redesign the visual language, change the palette, or introduce a dark theme.
- Rewrite, "optimise", or re-derive any calculation in `utils/`. Copy it.
- Invent product data, prices, plan tiers, copy, or business rules. Every number comes from Supabase or the ported constants.
- Ship a service-role key, or any secret, to the client.
- Build a mobile-only phone-frame layout on desktop.
- Fork screens into separate desktop/mobile components.
- Skip the Urdu translation for strings you extract.

**Always:**
- Open the corresponding mobile screen file before writing a web screen, and match its behaviour, ordering, wording and edge cases.
- Preserve Zustand persist keys, versions and migrations.
- Preserve route param contracts from `navigation.types.ts`.
- Keep TypeScript strict — no `any` in new code (the mobile app uses `any` for navigation props; type those properly on web).
- Prefer a shared responsive component over a conditional render.
- Log every intentional deviation from mobile behaviour, with its reason, in `docs/PORTING_LOG.md`.

---

## 17. Definition of done

- All 39 mobile screens reachable at the routes in §7 and functionally equivalent.
- Identical inputs produce identical outputs for sizing, package generation, battery recommendation, ROI, cleaning pricing and promo discounts — proven by the ported test suite.
- Reads and writes work against the live Supabase project under customer RLS.
- Full EN + UR support with working RTL, no untranslated visible strings.
- Clean at 375px, 768px, 1024px, 1440px and 1920px.
- `npm run build`, `typecheck`, `lint` and `test` all pass with zero errors.
- Lighthouse >= 90 (Performance, Accessibility, Best Practices, SEO) on `/`, `/marketplace`, `/marketplace/product/[id]`, `/how-it-works`.
- `docs/ROUTE_MAP.md` fully DONE and `docs/PORTING_LOG.md` complete.
