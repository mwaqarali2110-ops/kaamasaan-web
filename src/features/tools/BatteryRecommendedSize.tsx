'use client';

import Link from 'next/link';
import { ArrowRight, BatteryCharging, CheckCircle2, Clock3, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import { Screen } from '@/components/ui/Screen';
import { routes } from '@/constants/routes';
import { useBatteryToolStore } from './useBatteryToolStore';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/solar-tools/BatteryRecommendedSizeScreen.tsx.
 * Sizing constants and the nearest-common-size lookup reproduced exactly.
 *
 * Mobile's final CTA navigates to `SystemSummary` with the running-load figures
 * as params, but `SystemSummaryScreen` never reads them — it only checks
 * `route.params.packageId`, so that button silently lands on "No package
 * selected". Reproducing that dead end would just be a broken link with no
 * mobile parity to preserve, so this points at the design wizard instead,
 * which is where a customer sizing a battery actually needs to go next.
 */
const commonBatterySizes = [2.4, 3, 5, 7.5, 10, 12.5, 15, 20];
const batteryEfficiency = 0.9;
const depthOfDischarge = 0.8;
const safetyMargin = 1.2;

const formatNumber = (value: number) => (Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1));

const getRecommendedBatteryKwh = (requiredKwh: number) =>
  commonBatterySizes.find((size) => size >= requiredKwh) ?? Math.ceil(requiredKwh);

const ReasonRow = ({
  Icon,
  title,
  subtitle
}: {
  Icon: typeof TrendingUp;
  title: string;
  subtitle: string;
}) => (
  <div className="flex items-start gap-3 py-2">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kaam-yellow/20">
      <Icon size={16} className="text-[#B07800]" aria-hidden />
    </span>
    <span>
      <span className="block text-sm font-extrabold text-kaam-navy">{title}</span>
      <span className="block text-xs text-kaam-muted">{subtitle}</span>
    </span>
  </div>
);

const PreviewItem = ({
  Icon,
  value,
  label
}: {
  Icon: typeof Zap;
  value: string;
  label: string;
}) => (
  <div className="rounded-xl bg-kaam-surface p-3 text-center">
    <Icon size={16} className="mx-auto text-kaam-amber" aria-hidden />
    <p className="mt-1.5 text-sm font-extrabold text-kaam-navy">{value}</p>
    <p className="text-[10px] text-kaam-muted">{label}</p>
  </div>
);

export const BatteryRecommendedSize = () => {
  const selectedAppliances = useBatteryToolStore((state) => state.selectedAppliances);
  const totalBackupWatts = useBatteryToolStore((state) => state.totalBackupWatts);
  const backupHours = useBatteryToolStore((state) => state.backupHours);

  if (selectedAppliances.length === 0) {
    return (
      <Screen width="narrow">
        <div className="rounded-xl2 border border-kaam-line bg-kaam-card p-8 text-center">
          <h1 className="text-lg font-extrabold text-kaam-navy">No appliances selected</h1>
          <p className="mt-2 text-sm text-kaam-muted">
            Start from the battery size tool to select your backup appliances.
          </p>
          <Link
            href={routes.batterySizeTool()}
            className="mt-6 inline-flex h-12 items-center rounded-2xl bg-kaam-yellow px-6 text-sm font-extrabold text-kaam-navy hover:bg-kaam-amber"
          >
            Start Over
          </Link>
        </div>
      </Screen>
    );
  }

  const runningLoadKw = totalBackupWatts / 1000;
  const rawEnergyKwh = (totalBackupWatts * backupHours) / 1000;
  const requiredBatteryKwh = (rawEnergyKwh / (batteryEfficiency * depthOfDischarge)) * safetyMargin;
  const recommendedBatteryKwh = getRecommendedBatteryKwh(requiredBatteryKwh);

  return (
    <Screen width="narrow">
      <div className="rounded-xl2 border border-kaam-line bg-kaam-card p-6 text-center">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-kaam-muted">
          Recommended Battery Size
        </p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <BatteryCharging
            size={32}
            className="text-[#FDB813]"
            fill="#FDB813"
            strokeWidth={2.2}
            aria-hidden
          />
          <p className="text-4xl font-extrabold text-kaam-navy">
            {formatNumber(recommendedBatteryKwh)} <span className="text-xl text-kaam-muted">kWh</span>
          </p>
        </div>
        <p className="mt-3 text-sm font-extrabold text-kaam-navy">
          Ideal for your {runningLoadKw.toFixed(1)} kW backup load
        </p>
        <p className="mt-1 text-xs text-kaam-muted">
          Based on selected appliances, backup hours and battery safety margin
        </p>
      </div>

      <section className="mt-5 rounded-xl2 border border-kaam-line bg-kaam-card p-5">
        <h2 className="text-sm font-extrabold text-kaam-navy">
          Why {formatNumber(recommendedBatteryKwh)} kWh?
        </h2>
        <div className="mt-2 divide-y divide-kaam-line">
          <ReasonRow
            Icon={TrendingUp}
            title="Covers your selected backup load"
            subtitle={`Designed for ${runningLoadKw.toFixed(1)} kW running load`}
          />
          <ReasonRow
            Icon={ShieldCheck}
            title="Battery safety margin included"
            subtitle="Helps protect battery life and performance"
          />
          <ReasonRow
            Icon={CheckCircle2}
            title="Better real-world backup"
            subtitle="Considers efficiency and usable battery capacity"
          />
        </div>
      </section>

      <section className="mt-5 rounded-xl2 border border-kaam-line bg-kaam-card p-5">
        <h2 className="text-sm font-extrabold text-kaam-navy">Battery Preview</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <PreviewItem Icon={Zap} value={`${runningLoadKw.toFixed(1)} kW`} label="Running Load" />
          <PreviewItem
            Icon={Clock3}
            value={`${backupHours} hour${backupHours === 1 ? '' : 's'}`}
            label="Backup Duration"
          />
          <PreviewItem
            Icon={BatteryCharging}
            value={`${rawEnergyKwh.toFixed(1)} kWh`}
            label="Energy Required"
          />
          <PreviewItem
            Icon={ShieldCheck}
            value={`${formatNumber(recommendedBatteryKwh)} kWh`}
            label="Recommended Battery"
          />
        </div>
      </section>

      <div className="mt-5 flex items-start gap-3 rounded-xl2 border border-kaam-line bg-[#F0FDF4] p-4">
        <ShieldCheck size={27} className="shrink-0 text-[#15803D]" strokeWidth={2.2} aria-hidden />
        <div>
          <p className="text-sm font-extrabold text-kaam-navy">
            This battery size is suitable for your selected backup load
          </p>
          <p className="text-xs text-kaam-muted">
            You can increase backup hours if you need longer backup.
          </p>
        </div>
      </div>

      <Link
        href={routes.design()}
        className="mt-6 flex h-12 items-center justify-center gap-2 rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber"
      >
        Continue to Design System
        <ArrowRight size={19} strokeWidth={2.7} className="rtl:rotate-180" aria-hidden />
      </Link>
    </Screen>
  );
};
