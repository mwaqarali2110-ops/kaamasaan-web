'use client';

import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import { Screen } from '@/components/ui/Screen';
import { routes } from '@/constants/routes';
import { useBatteryToolStore } from './useBatteryToolStore';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/solar-tools/BatteryRunningLoadScreen.tsx.
 *
 * Reads the selection from `useBatteryToolStore` (see that file) instead of
 * route params. An empty selection means this was reached without going
 * through the first screen — mobile has no equivalent guard because it cannot
 * be deep-linked; here it redirects back rather than showing an empty page.
 */
const formatKw = (watts: number) => `${(watts / 1000).toFixed(1)} kW`;

export const BatteryRunningLoad = () => {
  const selectedAppliances = useBatteryToolStore((state) => state.selectedAppliances);
  const totalBackupWatts = useBatteryToolStore((state) => state.totalBackupWatts);

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

  return (
    <Screen width="narrow">
      <div className="rounded-xl2 border border-kaam-line bg-kaam-card p-6 text-center">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-kaam-muted">
          Your Running Load
        </p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <Zap size={32} className="text-[#FDB813]" fill="#FDB813" strokeWidth={2.2} aria-hidden />
          <p className="text-4xl font-extrabold text-kaam-navy">{formatKw(totalBackupWatts)}</p>
        </div>
        <p className="mt-2 text-xs text-kaam-muted">Based on selected backup appliances</p>
      </div>

      <section className="mt-5 rounded-xl2 border border-kaam-line bg-kaam-card p-5">
        <h2 className="text-sm font-extrabold text-kaam-navy">View calculation</h2>
        <div className="mt-2 divide-y divide-kaam-line">
          {selectedAppliances.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-2.5">
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold text-kaam-navy">{item.name}</span>
                <span className="block text-xs text-kaam-muted">
                  {item.quantity} x {item.watts}W
                </span>
              </span>
              <span className="shrink-0 text-sm font-extrabold text-kaam-navy">
                {item.quantity * item.watts}W
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between border-t border-kaam-line pt-3">
          <span className="text-sm font-extrabold text-kaam-navy">Total</span>
          <span className="text-sm font-extrabold text-kaam-navy">
            {formatKw(totalBackupWatts)}
          </span>
        </div>
      </section>

      <Link
        href={routes.batteryRecommendedSize()}
        className="mt-6 flex h-12 items-center justify-center gap-2 rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber"
      >
        See Recommended Battery Size
        <ArrowRight size={19} strokeWidth={2.7} className="rtl:rotate-180" aria-hidden />
      </Link>
    </Screen>
  );
};
