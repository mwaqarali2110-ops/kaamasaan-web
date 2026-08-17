'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, BatteryCharging, Grid3X3, ShieldCheck, Sun, TrendingUp, Wallet, Zap } from 'lucide-react';
import { Screen } from '@/components/ui/Screen';
import { calculatePanelCount } from '@/utils/calculations';
import { routes } from '@/constants/routes';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/solar-tools/RecommendedSolarSizeScreen.tsx.
 * All figures reproduced exactly: 550W reference panel, 4-5 kWh/kW daily
 * generation range, PKR 1,050 per kW monthly saving (rounded to the nearest 100).
 */
const formatKw = (value: number) => (Number.isInteger(value) ? value.toFixed(0) : value.toFixed(1));

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
  Icon: typeof Sun;
  value: string;
  label: string;
}) => (
  <div className="rounded-xl bg-kaam-surface p-3 text-center">
    <Icon size={16} className="mx-auto text-kaam-amber" aria-hidden />
    <p className="mt-1.5 text-sm font-extrabold text-kaam-navy">{value}</p>
    <p className="text-[10px] text-kaam-muted">{label}</p>
  </div>
);

export const RecommendedSolarSize = ({ loadKw, systemKw }: { loadKw: number; systemKw: number }) => {
  const panelCount = useMemo(() => calculatePanelCount(systemKw || 1, 550), [systemKw]);
  const dailyLow = Math.round(systemKw * 4);
  const dailyHigh = Math.round(systemKw * 5);
  const monthlySaving = Math.round((systemKw * 1050) / 100) * 100;

  return (
    <Screen width="narrow">
      <div className="rounded-xl2 border border-kaam-line bg-kaam-card p-6 text-center">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-kaam-muted">
          Recommended Solar Size
        </p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <Zap size={32} className="text-[#FDB813]" fill="#FDB813" strokeWidth={2.2} aria-hidden />
          <p className="text-4xl font-extrabold text-kaam-navy">
            {formatKw(systemKw)} <span className="text-xl text-kaam-muted">kW</span>
          </p>
        </div>
        <p className="mt-3 text-sm font-extrabold text-kaam-navy">
          Ideal for your {loadKw.toFixed(1)} kW running load
        </p>
        <p className="mt-1 text-xs text-kaam-muted">
          Based on selected appliances and average solar conditions
        </p>
      </div>

      <section className="mt-5 rounded-xl2 border border-kaam-line bg-kaam-card p-5">
        <h2 className="text-sm font-extrabold text-kaam-navy">Why {formatKw(systemKw)} kW?</h2>
        <div className="mt-2 divide-y divide-kaam-line">
          <ReasonRow
            Icon={TrendingUp}
            title="20-30% extra production for safety"
            subtitle="Handles cloudy days and future needs"
          />
          <ReasonRow
            Icon={BatteryCharging}
            title="Better battery charging efficiency"
            subtitle="Faster charging and longer backup"
          />
          <ReasonRow Icon={Wallet} title="Best long-term value" subtitle="More savings, higher ROI" />
        </div>
      </section>

      <section className="mt-5 rounded-xl2 border border-kaam-line bg-kaam-card p-5">
        <h2 className="text-sm font-extrabold text-kaam-navy">System Preview</h2>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <PreviewItem Icon={Sun} value={`${formatKw(systemKw)} kW`} label="System Size" />
          <PreviewItem Icon={Grid3X3} value={`${panelCount} Panels`} label="550W each" />
          <PreviewItem Icon={Zap} value={`~${dailyLow}-${dailyHigh} kWh`} label="Daily Generation" />
          <PreviewItem
            Icon={Wallet}
            value={`~PKR ${monthlySaving.toLocaleString('en-PK')}`}
            label="Est. Monthly Saving"
          />
        </div>
      </section>

      <div className="mt-5 flex items-start gap-3 rounded-xl2 border border-kaam-line bg-[#F0FDF4] p-4">
        <ShieldCheck size={27} className="shrink-0 text-[#15803D]" strokeWidth={2.2} aria-hidden />
        <div>
          <p className="text-sm font-extrabold text-kaam-navy">
            This size is perfect for your current load
          </p>
          <p className="text-xs text-kaam-muted">You can always upgrade later if needed.</p>
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
