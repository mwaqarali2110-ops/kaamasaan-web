'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  BatteryCharging,
  ShieldCheck,
  Sun,
  Wrench,
  Zap,
  type LucideIcon
} from 'lucide-react';
import { SafeImage } from '@/components/ui/SafeImage';
import { PromoCodeCard } from '@/components/promo/PromoCodeCard';
import { usePackageCompatibility, usePackageInventory } from '@/hooks/useProducts';
import { useRecommendationConfiguration } from '@/hooks/useRecommendationConfiguration';
import { useSystemStore } from '@/store/useSystemStore';
import { useSystemStoreHydrated } from '@/hooks/useStoreHydrated';
import { calculateRoofSpace } from '@/utils/calculations';
import { formatKw, formatPkr } from '@/utils/formatters';
import { buildPackagePromoContext, promoContextSignature } from '@/utils/promo';
import {
  generateRecommendedPackages,
  getProductBrandName,
  getProductWatt,
  getRecommendedPackageById
} from '@/utils/packageBuilder';
import { getBatteryProductDisplayName } from '@/utils/batteryRecommendation';
import {
  DEFAULT_COMMERCIAL_RECOMMENDATION_CONFIGURATION,
  commercialRuleRecommendationStrategy
} from '@/utils/commercialRecommendation';
import { routes } from '@/constants/routes';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/my-system/SystemSummaryScreen.tsx
 * (the `RecommendedSystemSummaryScreen` branch).
 *
 * Notably this screen **regenerates the package list itself** rather than
 * trusting whatever the wizard left in the store — so a deep link straight to
 * `/my-system/summary?packageId=…` resolves correctly. That behaviour is
 * mobile's and is what makes the route linkable on web.
 *
 * Desktop uses a two-column layout: components on the left, a sticky cost and
 * booking panel on the right. The whole screen sits on the same full-bleed
 * home photo + glass card treatment as `WizardShell` (the /design/* steps),
 * so the "Design Your System" flow keeps one continuous look all the way
 * through to this final screen instead of dropping back to a plain page.
 */
const productTitle = (brand: string, name: string) => {
  const normalizedName = name.trim().toLowerCase();
  return normalizedName.startsWith(brand.trim().toLowerCase()) ? name : `${brand} ${name}`;
};

const formatQuantity = (quantity: number, label: string) =>
  quantity > 1 ? `${quantity} x ${label}` : label;

type ComponentRow = {
  key: string;
  label: string;
  name: string;
  detail: string;
  price: string;
  image?: string | null;
  fallback: string;
  Icon: LucideIcon;
};

/**
 * Same full-bleed photo backdrop + top bar used by `WizardShell` on every
 * /design/* step, reused here so Packages -> Summary reads as one unbroken
 * flow rather than handing off to a different-looking page at the end.
 */
const SummaryBackdrop = ({
  onBack,
  eyebrow = 'Design Your System',
  title = 'System Summary',
  children
}: {
  onBack: () => void;
  eyebrow?: string;
  title?: string;
  children: ReactNode;
}) => (
  <div className="relative min-h-screen">
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

    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 md:px-6 lg:px-8 lg:pb-12">
      <div className="flex items-center gap-3 py-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-kaam-line bg-white/80 text-kaam-navy backdrop-blur-md transition-colors hover:border-kaam-amber hover:text-kaam-amber"
        >
          <ArrowLeft size={15} strokeWidth={2.4} className="rtl:rotate-180" aria-hidden />
        </button>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wide text-kaam-navy/60">{eyebrow}</p>
          <h1 className="text-base font-extrabold text-kaam-navy">{title}</h1>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-kaam-line bg-white/80 backdrop-blur-md">
          <Zap size={15} className="text-kaam-amber" strokeWidth={2.3} aria-hidden />
        </span>
      </div>

      {children}
    </div>
  </div>
);

export const SystemSummaryView = ({ packageId }: { packageId?: string }) => {
  const router = useRouter();
  const hydrated = useSystemStoreHydrated();

  const recommendedSolarKw = useSystemStore((state) => state.recommendedSolarKw);
  const selectedBatteryKwh = useSystemStore((state) => state.selectedBatteryKwh);
  const batteryRecommendationRequirementKwh = useSystemStore(
    (state) => state.batteryRecommendationRequirementKwh
  );
  const backupDecision = useSystemStore((state) => state.backupDecision);
  const panelWattage = useSystemStore((state) => state.panelWattage);
  const selectedRecommendedPackageId = useSystemStore(
    (state) => state.selectedRecommendedPackageId
  );
  const storedSelectedRecommendedPackage = useSystemStore(
    (state) => state.selectedRecommendedPackage
  );
  const backupAppliances = useSystemStore((state) => state.backupAppliances);
  const selectedBatteryConfiguration = useSystemStore(
    (state) => state.selectedBatteryConfiguration
  );
  const startBooking = useSystemStore((state) => state.startBooking);
  const promo = useSystemStore((state) => state.promo);
  const setPromoInput = useSystemStore((state) => state.setPromoInput);
  const applyPromo = useSystemStore((state) => state.applyPromo);
  const syncPromoContext = useSystemStore((state) => state.syncPromoContext);
  const removePromo = useSystemStore((state) => state.removePromo);

  const productsQuery = usePackageInventory();
  const compatibilityQuery = usePackageCompatibility();
  const configurationQuery = useRecommendationConfiguration();

  const configuration = configurationQuery.data ?? DEFAULT_COMMERCIAL_RECOMMENDATION_CONFIGURATION;

  const commercialRecommendation = useMemo(
    () =>
      commercialRuleRecommendationStrategy.recommend({
        appliances: backupAppliances ?? [],
        products: productsQuery.data ?? [],
        selectedPanelWattage: Number(panelWattage) || null,
        configuration
      }),
    [backupAppliances, configuration, panelWattage, productsQuery.data]
  );

  const requiredBatteryKwh =
    backupDecision === 'yes'
      ? Number(
          (selectedBatteryConfiguration?.capacityKwh ??
            batteryRecommendationRequirementKwh ??
            selectedBatteryKwh) || 0
        )
      : 0;

  // Keep PV/inverter sizing and expert review on the Recommended-bank baseline;
  // the customer-selected tier changes only the package battery target.
  const systemTargets = commercialRecommendation.systemTargets;
  const requiredSolarKw = systemTargets.targetPvKwp ?? Math.max(1, Number(recommendedSolarKw || 3));
  const requiredInverterKw =
    systemTargets.targetInverterKw ??
    (requiredSolarKw > 0 ? Math.max(3, Math.ceil(requiredSolarKw)) : 0);

  const recommendedPackages = useMemo(
    () =>
      generateRecommendedPackages({
        requiredPanelKw: requiredSolarKw,
        requiredInverterKw,
        requiredBatteryKwh,
        requiredBackupEnergyKwh: commercialRecommendation.requiredBackupEnergyKwh,
        batteryUsableFactor: configuration.settings.batteryUsableFactor,
        preliminaryDisclaimer: configuration.settings.preliminaryRecommendationDisclaimer,
        configuredInstallationCost: configuration.settings.configuredInstallationCost,
        configuredStructureCost: configuration.settings.configuredStructureCost,
        configuredAccessoriesCost: configuration.settings.configuredAccessoriesCost,
        acceptableBatteryShortfallPercent:
          configuration.settings.acceptableBatteryShortfallPercent,
        selectedBatteryTier: selectedBatteryConfiguration?.commercialTier,
        products: productsQuery.data ?? [],
        compatibilityRules: compatibilityQuery.data ?? [],
        selectedPanelWattage: Number(panelWattage) || undefined
      }),
    [
      commercialRecommendation.requiredBackupEnergyKwh,
      compatibilityQuery.data,
      configuration.settings,
      panelWattage,
      productsQuery.data,
      requiredBatteryKwh,
      requiredInverterKw,
      requiredSolarKw,
      selectedBatteryConfiguration?.commercialTier
    ]
  );

  const selectedPackage = useMemo(() => {
    const generated =
      getRecommendedPackageById(recommendedPackages, selectedRecommendedPackageId) ??
      getRecommendedPackageById(recommendedPackages, packageId ?? null);
    const storedMatches = Boolean(
      storedSelectedRecommendedPackage &&
        generated &&
        storedSelectedRecommendedPackage.id === generated.id &&
        (storedSelectedRecommendedPackage.id === selectedRecommendedPackageId ||
          storedSelectedRecommendedPackage.id === packageId)
    );
    return storedMatches ? storedSelectedRecommendedPackage : generated;
  }, [packageId, recommendedPackages, selectedRecommendedPackageId, storedSelectedRecommendedPackage]);

  const promoContext = useMemo(
    () => buildPackagePromoContext(selectedPackage),
    [selectedPackage]
  );
  const contextSignature = useMemo(
    () => (promoContext ? promoContextSignature(promoContext) : null),
    [promoContext]
  );

  useEffect(() => {
    if (promoContext) void syncPromoContext(promoContext);
  }, [promoContext, syncPromoContext]);

  const isLoading =
    productsQuery.isLoading || compatibilityQuery.isLoading || configurationQuery.isLoading;

  // Sequential "story" reveal: panel -> inverter -> battery (if any) -> summary.
  // These are plain values (not hooks) so they're safe to compute before the
  // early returns below, using optional chaining since selectedPackage may
  // still be null at this point.
  const revealPanelWatt = selectedPackage ? Math.round(getProductWatt(selectedPackage.panel)) : 0;
  const revealSystemSizeKw = selectedPackage
    ? selectedPackage.totalSolarKw || (selectedPackage.panelQuantity * revealPanelWatt) / 1000
    : 0;
  const revealBatteryProduct = selectedPackage?.battery?.product;

  const revealSteps = useMemo(() => {
    if (!selectedPackage) return [];
    const steps = [
      {
        key: 'panels',
        image: selectedPackage.panel.image,
        label: 'Solar Panels',
        value: `${revealSystemSizeKw.toFixed(1)} kW`,
        caption: `${selectedPackage.panelQuantity} x ${getProductBrandName(selectedPackage.panel)} ${revealPanelWatt}W`
      },
      {
        key: 'inverter',
        image: selectedPackage.inverter.product.image,
        label: 'Inverter',
        value: formatKw(selectedPackage.inverter.size),
        caption: productTitle(
          getProductBrandName(selectedPackage.inverter.product),
          selectedPackage.inverter.product.name
        )
      },
      ...(revealBatteryProduct
        ? [
            {
              key: 'battery',
              image: revealBatteryProduct.image,
              label: 'Battery Backup',
              value: `${selectedPackage.totalBatteryKwh} kWh`,
              caption: productTitle(
                getProductBrandName(revealBatteryProduct),
                getBatteryProductDisplayName(revealBatteryProduct)
              )
            }
          ]
        : [])
    ];
    return steps;
  }, [selectedPackage, revealBatteryProduct, revealSystemSizeKw, revealPanelWatt]);

  const prefersReducedMotion = useReducedMotion();
  const [stageIndex, setStageIndex] = useState(0);
  const [revealDone, setRevealDone] = useState(false);

  useEffect(() => {
    if (!selectedPackage || revealSteps.length === 0 || revealDone) return;
    if (prefersReducedMotion) {
      setRevealDone(true);
      return;
    }
    if (stageIndex >= revealSteps.length - 1) {
      const timer = setTimeout(() => setRevealDone(true), 1600);
      return () => clearTimeout(timer);
    }
    const timer = setTimeout(() => setStageIndex((current) => current + 1), 1600);
    return () => clearTimeout(timer);
  }, [selectedPackage, revealSteps.length, revealDone, prefersReducedMotion, stageIndex]);

  const goBack = () => router.back();

  if (!hydrated || isLoading) {
    return (
      <SummaryBackdrop onBack={goBack}>
        <div className="rounded-3xl border border-kaam-line bg-white/95 p-6 shadow-2xl backdrop-blur-xl">
          <div className="h-64 animate-pulse rounded-xl2 bg-kaam-surface" />
        </div>
      </SummaryBackdrop>
    );
  }

  if (!selectedPackage) {
    return (
      <SummaryBackdrop onBack={goBack}>
        <div className="mx-auto max-w-lg rounded-3xl border border-kaam-line bg-white/95 p-8 text-center shadow-2xl backdrop-blur-xl">
          <h1 className="text-xl font-extrabold text-kaam-navy">No package selected</h1>
          <p className="mt-2 text-sm text-kaam-muted">
            Please return and select a recommended package.
          </p>
          <Link
            href={routes.design('packages')}
            className="mt-6 inline-flex h-12 items-center rounded-2xl bg-kaam-yellow px-6 text-sm font-extrabold text-kaam-navy hover:bg-kaam-amber"
          >
            Choose a Package
          </Link>
        </div>
      </SummaryBackdrop>
    );
  }

  if (!revealDone && revealSteps.length > 0) {
    const step = revealSteps[Math.min(stageIndex, revealSteps.length - 1)];
    return (
      <SummaryBackdrop onBack={goBack} title="Building Your System">
        <div className="mx-auto flex min-h-[65vh] w-full max-w-xl flex-col items-center justify-center py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step.key}
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -16 }}
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="relative w-full overflow-hidden rounded-[2rem] border border-kaam-line bg-white/70 p-10 text-center shadow-2xl backdrop-blur-xl"
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-kaam-yellow/30 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-52 w-52 rounded-full bg-kaam-amber/15 blur-3xl" />

              <div className="relative mx-auto flex h-40 w-40 items-center justify-center overflow-hidden rounded-3xl bg-white/90 shadow-inner">
                <SafeImage src={step.image} alt={step.label} className="p-3" sizes="160px" />
              </div>

              <p className="relative mt-6 text-xs font-bold uppercase tracking-[0.2em] text-kaam-navy/60">
                {step.label}
              </p>
              <p className="relative mt-2 text-4xl font-extrabold text-kaam-navy">{step.value}</p>
              <p className="relative mt-1 text-sm text-kaam-muted">{step.caption}</p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center gap-2">
            {revealSteps.map((s, i) => (
              <span
                key={s.key}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === stageIndex ? 'w-8 bg-kaam-yellow' : 'w-1.5 bg-kaam-navy/15'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setRevealDone(true)}
            className="mt-6 text-xs font-semibold text-kaam-muted underline underline-offset-4 hover:text-kaam-navy"
          >
            Skip animation
          </button>
        </div>
      </SummaryBackdrop>
    );
  }

  const panelBrand = getProductBrandName(selectedPackage.panel);
  const panelWatt = Math.round(getProductWatt(selectedPackage.panel));
  const systemSizeKw =
    selectedPackage.totalSolarKw || (selectedPackage.panelQuantity * panelWatt) / 1000;
  const roofArea = calculateRoofSpace(selectedPackage.panelQuantity).areaSqFt;
  const inverterBrand = getProductBrandName(selectedPackage.inverter.product);
  const batteryProduct = selectedPackage.battery?.product;
  const batteryBrand = batteryProduct ? getProductBrandName(batteryProduct) : '';

  const components: ComponentRow[] = [
    {
      key: 'panels',
      label: 'Solar Panels',
      name: `${selectedPackage.panelQuantity} x ${panelBrand} ${panelWatt}W`,
      detail: selectedPackage.panel.name,
      price: formatPkr(selectedPackage.panelsPrice),
      image: selectedPackage.panel.image,
      fallback: '/assets/home/solar-panels.jpg',
      Icon: Sun
    },
    {
      key: 'inverter',
      label: 'Inverter',
      name: formatQuantity(
        selectedPackage.inverterQuantity,
        productTitle(inverterBrand, selectedPackage.inverter.product.name)
      ),
      detail: `${formatKw(selectedPackage.inverter.size)} total capacity`,
      price: formatPkr(selectedPackage.inverterPrice),
      image: selectedPackage.inverter.product.image,
      fallback: '/assets/home/inverter.jpg',
      Icon: Zap
    },
    ...(batteryProduct
      ? [
          {
            key: 'battery',
            label: 'Battery Backup',
            name: formatQuantity(
              selectedPackage.batteryQuantity,
              productTitle(batteryBrand, getBatteryProductDisplayName(batteryProduct))
            ),
            detail: `${selectedPackage.totalBatteryKwh} kWh total capacity`,
            price: formatPkr(selectedPackage.batteryPrice),
            image: batteryProduct.image,
            fallback: '/assets/home/battery.webp',
            Icon: BatteryCharging
          } satisfies ComponentRow
        ]
      : []),
    {
      key: 'installation',
      label: selectedPackage.installation.title,
      name: selectedPackage.installation.included ? 'Included' : 'Not included',
      detail: selectedPackage.installation.included
        ? 'Structure and professional installation'
        : 'Quoted separately',
      price:
        selectedPackage.installation.price > 0
          ? formatPkr(selectedPackage.installation.price)
          : 'Included',
      fallback: '/assets/home/installation.png',
      Icon: Wrench
    }
  ];

  const hasCurrentAppliedPromo = Boolean(
    promoContext &&
      promo.status === 'applied' &&
      promo.appliedPackageId === promoContext.packageId &&
      promo.appliedContextSignature === contextSignature
  );
  const displayTotal = hasCurrentAppliedPromo ? promo.finalTotal : selectedPackage.totalPrice;

  return (
    <SummaryBackdrop onBack={goBack}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="rounded-3xl border border-kaam-line bg-white/95 p-4 shadow-2xl backdrop-blur-xl sm:p-6 lg:p-8"
      >
        <div className="lg:grid lg:grid-cols-[1fr_340px] lg:items-start lg:gap-8">
          <div className="flex flex-col gap-5">
            <section className="grid gap-4 rounded-xl2 border border-kaam-line bg-kaam-card p-5 sm:grid-cols-3">
              <div>
                <p className="text-xs text-kaam-muted">System Size</p>
                <p className="text-2xl font-extrabold text-kaam-navy">{formatKw(systemSizeKw)}</p>
              </div>
              <div>
                <p className="text-xs text-kaam-muted">Panels</p>
                <p className="text-2xl font-extrabold text-kaam-navy">
                  {selectedPackage.panelQuantity}
                </p>
              </div>
              <div>
                <p className="text-xs text-kaam-muted">Roof space</p>
                <p className="text-2xl font-extrabold text-kaam-navy">
                  {Math.round(roofArea)} sq ft
                </p>
              </div>
            </section>

            {selectedPackage.preliminaryDisclaimer ? (
              <p className="rounded-xl2 border border-kaam-line bg-kaam-surface p-4 text-xs leading-relaxed text-kaam-muted">
                {selectedPackage.preliminaryDisclaimer}
              </p>
            ) : null}

            <div>
              <h2 className="mb-3 text-sm font-extrabold text-kaam-navy">System Components</h2>
              <div className="overflow-hidden rounded-xl2 border border-kaam-line bg-kaam-card">
                {components.map((item, index) => (
                  <div
                    key={item.key}
                    className={`flex items-center gap-4 p-4 ${index < components.length - 1 ? 'border-b border-kaam-line' : ''}`}
                  >
                    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-kaam-surface">
                      {item.image ? (
                        <SafeImage src={item.image} alt="" sizes="56px" />
                      ) : (
                        <item.Icon size={20} className="text-kaam-amber" aria-hidden />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[11px] font-bold uppercase tracking-wide text-kaam-muted">
                        {item.label}
                      </span>
                      <span className="block truncate text-sm font-extrabold text-kaam-navy">
                        {item.name}
                      </span>
                      <span className="block truncate text-xs text-kaam-muted">{item.detail}</span>
                    </span>
                    <span className="shrink-0 text-sm font-extrabold text-kaam-navy">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {!batteryProduct ? (
              <p className="rounded-xl2 border border-kaam-line bg-kaam-surface p-4 text-xs font-semibold text-kaam-muted">
                Battery backup not included
              </p>
            ) : null}

            <section className="flex items-start gap-3 rounded-xl2 border border-kaam-line bg-kaam-card p-4">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-kaam-green" aria-hidden />
              <div>
                <p className="text-sm font-extrabold text-kaam-navy">Compatible package</p>
                <p className="mt-0.5 text-xs text-kaam-muted">
                  {selectedPackage.recommendationReason}
                </p>
              </div>
            </section>
          </div>

          {/* Sticky cost + booking panel */}
          <aside className="mt-6 flex flex-col gap-4 lg:sticky lg:top-24 lg:mt-0">
            {promoContext ? (
              <PromoCodeCard
                promo={promo}
                onChangeCode={setPromoInput}
                onApply={() => void applyPromo(promoContext)}
                onRemove={() => removePromo(promoContext.originalTotal)}
              />
            ) : null}

            <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
              <p className="text-xs text-kaam-muted">Total Estimated Cost</p>
              <p className="text-2xl font-extrabold text-kaam-navy">{formatPkr(displayTotal)}</p>
              {hasCurrentAppliedPromo ? (
                <p className="mt-0.5 text-xs font-semibold text-kaam-green">
                  {formatPkr(promo.discountAmount)} off applied
                </p>
              ) : null}
              <p className="mt-1 text-xs text-kaam-muted">{selectedPackage.packageName}</p>

              <Link
                href={routes.bookSurvey({
                  packageId: selectedPackage.id,
                  bookingContext: 'solar_package',
                  source: 'solar_package'
                })}
                onClick={() => startBooking('solar_package')}
                className="mt-5 flex h-12 items-center justify-center rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber"
              >
                Book Free Survey
              </Link>
            </section>
          </aside>
        </div>
      </motion.div>
    </SummaryBackdrop>
  );
};
