'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { BatteryCharging } from 'lucide-react';
import { useSystemStore } from '@/store/useSystemStore';
import { useBatterySizingCatalog } from '@/hooks/useProducts';
import { useRecommendationConfiguration } from '@/hooks/useRecommendationConfiguration';
import { calculateBackupRequirementSummary } from '@/utils/calculations';
import {
  BATTERY_RECOMMENDATION_ENGINE_VERSION,
  DEFAULT_COMMERCIAL_RECOMMENDATION_CONFIGURATION,
  commercialRuleRecommendationStrategy,
  type CommercialBatteryBank
} from '@/utils/commercialRecommendation';
import type { BatteryConfiguration } from '@/utils/batteryRecommendation';
import { formatPkr } from '@/utils/formatters';
import { StepCard, WizardShell } from '../WizardShell';
import { STEP_TITLES } from '../wizard';
import { cn } from '@/lib/cn';
import type { StepProps } from './types';

/**
 * Step 6 — ported from `BackupPlanStepScreen`.
 *
 * Every number here comes from `commercialRuleRecommendationStrategy`, the
 * engine ported and covered by scenario tests in Phase 2. This screen only
 * chooses which of the three returned tiers to show and which is preselected —
 * no sizing logic is reimplemented.
 *
 * The preselection rules are mobile's exactly: keep the customer's stored tier
 * unless the engine version changed or the energy requirement moved by more
 * than 0.01 kWh, otherwise fall back to `recommended`.
 */
const toStoredBatteryConfiguration = (bank: CommercialBatteryBank): BatteryConfiguration => ({
  id: bank.id,
  capacityKwh: bank.batteryBankCapacityKwh,
  productIds: Array.from({ length: bank.quantity }, () => bank.batteryProductId),
  quantity: bank.quantity,
  brand: bank.brand,
  model: bank.model,
  totalPrice: bank.totalPrice,
  usableEnergyKwh: bank.batteryUsableEnergyKwh,
  image: bank.product.image,
  primaryProduct: bank.product,
  applicableUsableFactor: bank.applicableUsableFactor,
  requiredBackupEnergyKwh: bank.requiredBackupEnergyKwh,
  coveragePercentage: bank.coveragePercent,
  capacityShortfallKwh: bank.shortfallKwh,
  headroomKwh: bank.headroomKwh,
  coversRequirement: bank.coversRequirement,
  commercialTier: bank.tier,
  statusLabel: bank.statusLabel
});

const TIER_LABELS: Record<NonNullable<BatteryConfiguration['commercialTier']>, string> = {
  loadManaged: 'Load Managed',
  recommended: 'Recommended',
  extended: 'Extended Backup'
};

export const BackupPlanStep = ({ onContinue, onBack }: StepProps) => {
  const backupAppliances = useSystemStore((state) => state.backupAppliances);
  const panelWattage = useSystemStore((state) => state.panelWattage);
  const storedConfiguration = useSystemStore((state) => state.selectedBatteryConfiguration);
  const storedRequirementKwh = useSystemStore(
    (state) => state.batteryRecommendationRequirementKwh
  );
  const engineVersion = useSystemStore((state) => state.batteryRecommendationEngineVersion);
  const setSelectedBatteryConfiguration = useSystemStore(
    (state) => state.setSelectedBatteryConfiguration
  );

  const catalogQuery = useBatterySizingCatalog();
  const configurationQuery = useRecommendationConfiguration();

  const summary = calculateBackupRequirementSummary(backupAppliances, 0);
  const requiredBackupEnergyKwh = summary.baseRequiredEnergyKwh;

  const recommendation = useMemo(
    () =>
      commercialRuleRecommendationStrategy.recommend({
        appliances: backupAppliances,
        products: catalogQuery.data ?? [],
        selectedPanelWattage: Number(panelWattage) || null,
        configuration: configurationQuery.data ?? DEFAULT_COMMERCIAL_RECOMMENDATION_CONFIGURATION
      }),
    [backupAppliances, catalogQuery.data, configurationQuery.data, panelWattage]
  );

  const backupOptions = useMemo(
    () =>
      (['loadManaged', 'recommended', 'extended'] as const)
        .map((tier) => recommendation.batteryTiers[tier])
        .filter((bank): bank is CommercialBatteryBank => Boolean(bank))
        .map(toStoredBatteryConfiguration),
    [recommendation]
  );

  const engineChanged = Number(engineVersion) !== BATTERY_RECOMMENDATION_ENGINE_VERSION;
  const requirementChanged =
    storedRequirementKwh == null ||
    Math.abs(Number(storedRequirementKwh) - requiredBackupEnergyKwh) > 0.01;
  const storedOption = backupOptions.find(
    (option) => option.commercialTier === storedConfiguration?.commercialTier
  );
  const selected =
    !engineChanged && !requirementChanged && storedOption
      ? storedOption
      : (backupOptions.find((option) => option.commercialTier === 'recommended') ?? null);

  const choose = (option: BatteryConfiguration) =>
    setSelectedBatteryConfiguration(option, requiredBackupEnergyKwh);

  const loading = catalogQuery.isLoading || configurationQuery.isLoading;

  return (
    <WizardShell
      step="backupPlan"
      title={STEP_TITLES.backupPlan}
      onBack={onBack}
      summary={
        <StepCard title="Backup requirement">
          <dl className="divide-y divide-kaam-line">
            <div className="flex justify-between gap-3 py-2">
              <dt className="text-xs text-kaam-muted">Energy needed</dt>
              <dd className="text-sm font-extrabold text-kaam-navy">
                {requiredBackupEnergyKwh.toFixed(2)} kWh
              </dd>
            </div>
            <div className="flex justify-between gap-3 py-2">
              <dt className="text-xs text-kaam-muted">Safety margin</dt>
              <dd className="text-sm font-extrabold text-kaam-navy">
                {recommendation.safetyMarginPercent}%
              </dd>
            </div>
            {selected ? (
              <div className="flex justify-between gap-3 py-2">
                <dt className="text-xs text-kaam-muted">Selected bank</dt>
                <dd className="text-sm font-extrabold text-kaam-navy">
                  {selected.capacityKwh} kWh
                </dd>
              </div>
            ) : null}
          </dl>
        </StepCard>
      }
      footer={
        <button
          type="button"
          onClick={() => {
            if (selected) choose(selected);
            onContinue();
          }}
          disabled={!selected}
          className="h-12 w-full rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber disabled:opacity-50 lg:w-auto lg:px-8"
        >
          Continue
        </button>
      }
    >
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-xl font-extrabold text-kaam-navy">Choose your backup plan</h2>
          <p className="mt-1 text-sm text-kaam-muted">
            Options sized for {requiredBackupEnergyKwh.toFixed(2)} kWh of backup energy
          </p>
        </div>

        {loading ? (
          <StepCard>
            <p className="text-sm text-kaam-muted">Sizing battery options…</p>
          </StepCard>
        ) : backupOptions.length === 0 ? (
          <StepCard>
            <p className="text-sm font-extrabold text-kaam-navy">
              No battery bank matches this requirement yet.
            </p>
            <p className="mt-1 text-xs text-kaam-muted">
              Our team can size this for you during the survey.
            </p>
          </StepCard>
        ) : (
          <div className="grid gap-3">
            {backupOptions.map((option) => {
              const active = selected?.commercialTier === option.commercialTier;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => choose(option)}
                  aria-pressed={active}
                  className={cn(
                    'rounded-xl2 border p-5 text-start transition-colors',
                    active
                      ? 'border-kaam-amber bg-kaam-yellow/10'
                      : 'border-kaam-line bg-kaam-card hover:border-kaam-amber'
                  )}
                >
                  <span className="flex items-start gap-3">
                    {/* Real product photo from the catalog — same `image` field
                        the marketplace product cards use, not a placeholder. */}
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-kaam-line bg-white p-1.5">
                      {option.image ? (
                        <Image
                          src={option.image}
                          alt=""
                          width={56}
                          height={56}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <BatteryCharging size={20} className="text-kaam-muted" strokeWidth={1.8} aria-hidden />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="text-sm font-extrabold text-kaam-navy">
                          {TIER_LABELS[option.commercialTier ?? 'recommended']}
                        </span>
                        <span className="text-sm font-extrabold text-kaam-navy">
                          {formatPkr(option.totalPrice)}
                        </span>
                      </span>
                      <span className="mt-1 block text-xs text-kaam-muted">
                        {option.quantity} × {option.brand} {option.model} · {option.capacityKwh} kWh
                      </span>
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        <span className="rounded-lg bg-kaam-surface px-2 py-1 text-[10px] font-semibold text-kaam-muted">
                          {option.usableEnergyKwh.toFixed(1)} kWh usable
                        </span>
                        {option.coveragePercentage != null ? (
                          <span className="rounded-lg bg-kaam-surface px-2 py-1 text-[10px] font-semibold text-kaam-muted">
                            {Math.round(option.coveragePercentage)}% coverage
                          </span>
                        ) : null}
                        {option.statusLabel ? (
                          <span className="rounded-lg bg-kaam-surface px-2 py-1 text-[10px] font-semibold text-kaam-muted">
                            {option.statusLabel}
                          </span>
                        ) : null}
                      </span>
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
