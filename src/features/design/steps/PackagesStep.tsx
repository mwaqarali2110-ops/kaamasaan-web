'use client';

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSystemStore } from '@/store/useSystemStore';
import {
  usePackageCompatibility,
  usePackageInventory
} from '@/hooks/useProducts';
import { useRecommendationConfiguration } from '@/hooks/useRecommendationConfiguration';
import { DEFAULT_BACKUP_HOURS, calculateBackupRequirementSummary } from '@/utils/calculations';
import {
  DEFAULT_COMMERCIAL_RECOMMENDATION_CONFIGURATION,
  commercialRuleRecommendationStrategy
} from '@/utils/commercialRecommendation';
import { generateRecommendedPackages, type RecommendedPackage } from '@/utils/packageBuilder';
import { getPackageImage } from '@/utils/packageImages';
import { formatPkr } from '@/utils/formatters';
import { SafeImage } from '@/components/ui/SafeImage';
import { StepCard, WizardShell } from '../WizardShell';
import { STEP_TITLES, getInverterSizeKw } from '../wizard';
import { routes } from '@/constants/routes';
import { cn } from '@/lib/cn';
import type { StepProps } from './types';

/**
 * Step 8 — ported from `RecommendedPackagesStepScreen`.
 *
 * The sizing inputs below are copied line for line from mobile, including the
 * comment about PV/inverter targets staying anchored to the engine's
 * Recommended bank while only the battery target follows the customer's tier.
 * Package generation itself is `generateRecommendedPackages` — ported and
 * covered by 29 scenarios in Phase 2.
 */
export const PackagesStep = ({ onContinue, onBack }: StepProps) => {
  const { t } = useTranslation();

  const backupAppliances = useSystemStore((state) => state.backupAppliances);
  const backupDecision = useSystemStore((state) => state.backupDecision);
  const panelWattage = useSystemStore((state) => state.panelWattage);
  const recommendedSolarKw = useSystemStore((state) => state.recommendedSolarKw);
  const selectedBatteryConfiguration = useSystemStore(
    (state) => state.selectedBatteryConfiguration
  );
  const selectedRecommendedPackageId = useSystemStore(
    (state) => state.selectedRecommendedPackageId
  );
  const setRecommendedPackages = useSystemStore((state) => state.setRecommendedPackages);
  const setSelectedRecommendedPackage = useSystemStore(
    (state) => state.setSelectedRecommendedPackage
  );

  const productsQuery = usePackageInventory();
  const compatibilityQuery = usePackageCompatibility();
  const configurationQuery = useRecommendationConfiguration();

  const allProducts = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);
  const configuration = configurationQuery.data ?? DEFAULT_COMMERCIAL_RECOMMENDATION_CONFIGURATION;
  const backupSummary = calculateBackupRequirementSummary(backupAppliances, 0);
  const runningLoadKw = backupSummary.runningLoadKw;

  const commercialRecommendation = useMemo(
    () =>
      commercialRuleRecommendationStrategy.recommend({
        appliances: backupAppliances,
        products: allProducts,
        selectedPanelWattage: Number(panelWattage) || null,
        configuration
      }),
    [allProducts, backupAppliances, configuration, panelWattage]
  );

  const selectedBatteryCapacityKwh =
    backupDecision === 'yes'
      ? Number(
          selectedBatteryConfiguration?.capacityKwh ??
            commercialRecommendation.recommendedBatteryBank?.batteryBankCapacityKwh ??
            0
        )
      : 0;

  // Package PV/inverter sizing stays anchored to the engine's Recommended bank.
  // Changing to Load-Managed or Extended only changes the package battery target.
  const baselineSystemTargets = commercialRecommendation.systemTargets;
  const requiredSolarKw =
    baselineSystemTargets.targetPvKwp ?? Math.max(1, Number(recommendedSolarKw || 3));
  const requiredInverterKw =
    baselineSystemTargets.targetInverterKw ?? getInverterSizeKw(requiredSolarKw);

  const selectedBackupQuantity = backupAppliances.reduce(
    (total, appliance) => total + Math.max(0, Number(appliance.quantity) || 0),
    0
  );
  const backupHours =
    selectedBackupQuantity > 0
      ? backupAppliances.reduce(
          (total, appliance) =>
            total +
            Math.max(0, Number(appliance.quantity) || 0) *
              Number(appliance.hours ?? DEFAULT_BACKUP_HOURS),
          0
        ) / selectedBackupQuantity
      : undefined;

  const packages = useMemo(
    () =>
      commercialRecommendation.requiresExpertReview
        ? []
        : generateRecommendedPackages({
            requiredPanelKw: requiredSolarKw,
            requiredInverterKw,
            requiredBatteryKwh: selectedBatteryCapacityKwh,
            requiredBackupEnergyKwh: backupSummary.baseRequiredEnergyKwh,
            batteryUsableFactor: configuration.settings.batteryUsableFactor,
            preliminaryDisclaimer: configuration.settings.preliminaryRecommendationDisclaimer,
            configuredInstallationCost: configuration.settings.configuredInstallationCost,
            configuredStructureCost: configuration.settings.configuredStructureCost,
            configuredAccessoriesCost: configuration.settings.configuredAccessoriesCost,
            acceptableBatteryShortfallPercent:
              configuration.settings.acceptableBatteryShortfallPercent,
            selectedBatteryTier: selectedBatteryConfiguration?.commercialTier,
            runningLoadKw,
            backupHours,
            products: allProducts,
            compatibilityRules: compatibilityQuery.data ?? [],
            selectedPanelWattage: Number(panelWattage) || undefined
          }),
    [
      allProducts,
      backupHours,
      backupSummary.baseRequiredEnergyKwh,
      commercialRecommendation.requiresExpertReview,
      compatibilityQuery.data,
      configuration.settings,
      panelWattage,
      requiredInverterKw,
      requiredSolarKw,
      selectedBatteryCapacityKwh,
      selectedBatteryConfiguration?.commercialTier,
      runningLoadKw
    ]
  );

  // Mirrors mobile: publish the generated list to the store so downstream
  // screens (System Summary, Book Survey) can resolve the selection by id.
  useEffect(() => {
    setRecommendedPackages(packages);
  }, [packages, setRecommendedPackages]);

  const loading =
    productsQuery.isLoading || compatibilityQuery.isLoading || configurationQuery.isLoading;

  const choose = (recommendedPackage: RecommendedPackage) =>
    setSelectedRecommendedPackage(recommendedPackage);

  return (
    <WizardShell
      step="packages"
      title={STEP_TITLES.packages}
      onBack={onBack}
      footer={
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onContinue}
            disabled={!selectedRecommendedPackageId}
            className="h-12 flex-1 rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber disabled:opacity-50 lg:flex-none lg:px-8"
          >
            {t('home.reviewMySystem')}
          </button>
          <Link
            href={routes.bookSurvey()}
            className="flex h-12 items-center justify-center rounded-2xl border border-kaam-line bg-white px-5 text-sm font-extrabold text-kaam-navy transition-colors hover:border-kaam-amber"
          >
            {t('home.getExpertOpinion')}
          </Link>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-xl font-extrabold text-kaam-navy">
            {t('marketplace.recommendedPackages')}
          </h2>
          <p className="mt-1 text-sm text-kaam-muted">
            Matched to {requiredSolarKw.toFixed(1)} kWp of panels
            {selectedBatteryCapacityKwh > 0
              ? ` and ${selectedBatteryCapacityKwh} kWh of storage`
              : ''}
            .
          </p>
        </div>

        {loading ? (
          <StepCard>
            <p className="text-sm text-kaam-muted">Building packages…</p>
          </StepCard>
        ) : commercialRecommendation.requiresExpertReview ? (
          <StepCard>
            <p className="text-sm font-extrabold text-kaam-navy">
              This system needs an expert review.
            </p>
            <p className="mt-1 text-xs text-kaam-muted">
              Your requirement is outside the range we can package automatically. Book a survey and
              our team will size it for you.
            </p>
          </StepCard>
        ) : packages.length === 0 ? (
          <StepCard>
            <p className="text-sm font-extrabold text-kaam-navy">
              No package matches this configuration yet.
            </p>
            <p className="mt-1 text-xs text-kaam-muted">
              Try a different battery tier, or ask for an expert opinion.
            </p>
          </StepCard>
        ) : (
          /* Desktop shows the packages side by side rather than as a carousel. */
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {packages.map((item) => {
              const active = selectedRecommendedPackageId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => choose(item)}
                  aria-pressed={active}
                  className={cn(
                    'flex flex-col overflow-hidden rounded-xl2 border text-start transition-all hover:-translate-y-0.5 hover:shadow-md',
                    active
                      ? 'border-kaam-amber bg-kaam-yellow/8'
                      : 'border-kaam-line bg-kaam-card hover:border-kaam-amber'
                  )}
                >
                  <span className="relative flex h-36 items-center justify-center bg-kaam-surface p-4">
                    <SafeImage
                      src={getPackageImage(item)}
                      alt={item.packageName}
                      sizes="(max-width: 1024px) 100vw, 320px"
                    />
                    {item.badge ? (
                      <span className="absolute start-3 top-3 rounded-md bg-kaam-yellow px-2 py-1 text-[9px] font-bold text-kaam-navy">
                        {item.badge}
                      </span>
                    ) : null}
                    {active ? (
                      <span className="absolute end-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-kaam-green">
                        <Check size={13} className="text-white" strokeWidth={3} aria-hidden />
                      </span>
                    ) : null}
                  </span>

                  <span className="flex flex-1 flex-col p-4">
                    <span className="text-sm font-extrabold text-kaam-navy">
                      {item.packageName}
                    </span>
                    <span className="mt-0.5 text-[11px] text-kaam-muted">{item.title}</span>

                    <span className="mt-3 flex flex-wrap gap-1">
                      <span className="rounded-lg bg-kaam-surface px-2 py-1 text-[10px] font-semibold text-kaam-muted">
                        {item.panelQuantity} × {item.panel.name}
                      </span>
                      <span className="rounded-lg bg-kaam-surface px-2 py-1 text-[10px] font-semibold text-kaam-muted">
                        {item.inverterSizeKw} kW inverter
                      </span>
                      {item.totalBatteryKwh > 0 ? (
                        <span className="rounded-lg bg-kaam-surface px-2 py-1 text-[10px] font-semibold text-kaam-muted">
                          {item.totalBatteryKwh} kWh battery
                        </span>
                      ) : null}
                    </span>

                    <span className="mt-auto pt-3 text-base font-extrabold text-kaam-navy">
                      {formatPkr(item.totalPrice)}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </WizardShell>
  );
};
