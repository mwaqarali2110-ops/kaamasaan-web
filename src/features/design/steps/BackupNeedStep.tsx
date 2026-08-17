'use client';

import Image from 'next/image';
import { useSystemStore } from '@/store/useSystemStore';
import { StepCard, WizardShell } from '../WizardShell';
import { STEP_TITLES, getInverterSizeKw } from '../wizard';
import { cn } from '@/lib/cn';
import type { StepProps } from './types';

/**
 * Step 4 — ported from `BatteryChoiceStepScreen`.
 *
 * This is the branch point: "yes" continues to the backup appliances step,
 * "no" skips straight to the recommended system (and clears any battery state
 * via `setBackupDecision`, which the ported store already handles).
 *
 * Mobile navigates the instant a choice is tapped; the same here. Zustand's
 * `set` is synchronous, so the route's `onContinue` reads the fresh decision
 * from `getState()` and branches correctly.
 *
 * "Your system so far" shows the customer's own uploaded equipment photos
 * (Longi panel, Sungrow HV hybrid inverter, Sungrow HV battery bank) instead
 * of generic icons — these are representative of the gear KaamAsaan installs,
 * not necessarily the exact SKU the calculation engine lands on downstream
 * (panel/inverter/battery selection still happens on their own steps with the
 * real catalog). The kW/kWh values and every calculation are unchanged.
 */
export const BackupNeedStep = ({ onContinue, onBack }: StepProps) => {
  const backupDecision = useSystemStore((state) => state.backupDecision);
  const recommendedSolarKw = useSystemStore((state) => state.recommendedSolarKw);
  const selectedBatteryKwh = useSystemStore((state) => state.selectedBatteryKwh);
  const setBackupDecision = useSystemStore((state) => state.setBackupDecision);

  const solarKw = Math.min(20, Math.max(1, Math.round(Number(recommendedSolarKw || 3))));
  const inverterKw = getInverterSizeKw(solarKw);
  const batteryKwh = backupDecision === 'yes' ? selectedBatteryKwh : 0;

  const equipment = [
    {
      key: 'panels',
      image: '/marketing/equipment/longi-panel.png',
      value: `${solarKw} kW`,
      label: 'Solar Panels',
      caption: 'Longi Hi-MO X10'
    },
    {
      key: 'inverter',
      image: '/marketing/equipment/sungrow-inverter.jpg',
      value: `${inverterKw} kW`,
      label: 'Inverter',
      caption: 'Sungrow HV Hybrid'
    },
    {
      key: 'battery',
      image: '/marketing/equipment/sungrow-battery.webp',
      value: batteryKwh ? `${batteryKwh} kWh` : '—',
      label: 'Battery',
      caption: 'Sungrow HV Battery'
    }
  ] as const;

  return (
    <WizardShell step="backupNeed" title={STEP_TITLES.backupNeed} onBack={onBack}>
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-xl font-extrabold text-kaam-navy">
            Do you need a backup battery?
          </h2>
          <p className="mt-1 text-sm text-kaam-muted">
            Batteries keep selected appliances running when the grid is down.
          </p>
        </div>

        <StepCard title="Your system so far">
          <div className="grid grid-cols-3 gap-3">
            {equipment.map((item) => (
              <div key={item.key} className="text-center">
                <span className="relative mx-auto flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-kaam-line bg-white shadow-sm sm:h-16 sm:w-16">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-contain p-1.5"
                  />
                </span>
                <p className="mt-2 text-sm font-extrabold text-kaam-navy">{item.value}</p>
                <p className="text-[11px] text-kaam-muted">{item.label}</p>
                <p className="mt-0.5 truncate text-[9px] font-semibold text-kaam-muted/70">
                  {item.caption}
                </p>
              </div>
            ))}
          </div>
        </StepCard>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => { setBackupDecision('yes'); onContinue(); }}
            aria-pressed={backupDecision === 'yes'}
            className={cn(
              'rounded-xl2 border p-5 text-start transition-colors',
              backupDecision === 'yes'
                ? 'border-kaam-amber bg-kaam-yellow/10'
                : 'border-kaam-line bg-kaam-card hover:border-kaam-amber'
            )}
          >
            <span className="block text-sm font-extrabold text-kaam-navy">
              Yes, I want backup
            </span>
            <span className="mt-1 block text-xs text-kaam-muted">
              Pick the appliances to keep running during load-shedding.
            </span>
          </button>

          <button
            type="button"
            onClick={() => { setBackupDecision('no'); onContinue(); }}
            aria-pressed={backupDecision === 'no'}
            className={cn(
              'rounded-xl2 border p-5 text-start transition-colors',
              backupDecision === 'no'
                ? 'border-kaam-amber bg-kaam-yellow/10'
                : 'border-kaam-line bg-kaam-card hover:border-kaam-amber'
            )}
          >
            <span className="block text-sm font-extrabold text-kaam-navy">
              No, solar only
            </span>
            <span className="mt-1 block text-xs text-kaam-muted">
              Lower upfront cost, no backup during outages.
            </span>
          </button>
        </div>
      </div>
    </WizardShell>
  );
};
