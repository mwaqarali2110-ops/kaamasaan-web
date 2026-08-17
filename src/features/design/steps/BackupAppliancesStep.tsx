'use client';

import { createElement, useState } from 'react';
import { useSystemStore } from '@/store/useSystemStore';
import { calculateBackupRequirementSummary } from '@/utils/calculations';
import { StepCard, WizardShell } from '../WizardShell';
import { ApplianceRow } from '../ApplianceRow';
import { applianceGroups, applianceIcon, extraApplianceOptions } from '../applianceContent';
import { STEP_TITLES } from '../wizard';
import type { StepProps } from './types';

/**
 * Step 5 — ported from `BackupAppliancesStepScreen`.
 *
 * Gate matches mobile: at least one backup appliance. On continue it stores the
 * requirement summary via `setBackupRequirementSummary`, computed by the ported
 * `calculateBackupRequirementSummary` engine — the next step reads it to size
 * the battery bank.
 */
export const BackupAppliancesStep = ({ onContinue, onBack }: StepProps) => {
  const backupAppliances = useSystemStore((state) => state.backupAppliances);
  const setBackupApplianceQuantity = useSystemStore((state) => state.setBackupApplianceQuantity);
  const setBackupApplianceHours = useSystemStore((state) => state.setBackupApplianceHours);
  const addBackupAppliance = useSystemStore((state) => state.addBackupAppliance);
  const setBackupRequirementSummary = useSystemStore(
    (state) => state.setBackupRequirementSummary
  );
  const [error, setError] = useState('');

  // See AppliancesStep: deltas resolved against fresh state, not rendered props.
  const stepQuantity = (id: string, delta: -1 | 1) => {
    const current =
      useSystemStore.getState().backupAppliances.find((item) => item.id === id)?.quantity ?? 0;
    setBackupApplianceQuantity(id, Math.min(20, Math.max(0, current + delta)));
  };

  const selectedQuantity = backupAppliances.reduce(
    (total, item) => total + Math.max(0, Number(item.quantity) || 0),
    0
  );
  const hasSelected = selectedQuantity > 0;
  const summary = calculateBackupRequirementSummary(backupAppliances, 0);

  const defaultIds = new Set(applianceGroups.flatMap((group) => group.ids));
  const customAppliances = backupAppliances.filter((item) => !defaultIds.has(item.id));

  const handleContinue = () => {
    if (!hasSelected) {
      setError('Please select at least one appliance for battery backup.');
      return;
    }
    setError('');
    setBackupRequirementSummary(summary);
    onContinue();
  };

  const renderRow = (id: string, showDivider: boolean) => {
    const item = backupAppliances.find((appliance) => appliance.id === id);
    if (!item) return null;
    return (
      <ApplianceRow
        key={item.id}
        id={item.id}
        name={item.name}
        watts={item.watts}
        quantity={item.quantity}
        hours={item.hours}
        showDivider={showDivider}
        onQuantityStep={(delta) => stepQuantity(item.id, delta)}
        onHoursChange={(hours) => setBackupApplianceHours(item.id, hours)}
      />
    );
  };

  return (
    <WizardShell
      step="backupAppliances"
      title={STEP_TITLES.backupAppliances}
      onBack={onBack}
      summary={
        <StepCard title="Backup requirement">
          <dl className="divide-y divide-kaam-line">
            <div className="flex justify-between gap-3 py-2">
              <dt className="text-xs text-kaam-muted">Backup load</dt>
              <dd className="text-sm font-extrabold text-kaam-navy">
                {summary.runningLoadWatts} W
              </dd>
            </div>
            <div className="flex justify-between gap-3 py-2">
              <dt className="text-xs text-kaam-muted">Energy needed</dt>
              <dd className="text-sm font-extrabold text-kaam-navy">
                {summary.baseRequiredEnergyKwh.toFixed(2)} kWh
              </dd>
            </div>
          </dl>
          <p className="mt-2 text-[11px] text-kaam-muted">
            Adjust backup hours per appliance to change this.
          </p>
        </StepCard>
      }
      footer={
        <div>
          {error ? <p className="mb-2 text-xs font-bold text-kaam-red">{error}</p> : null}
          <button
            type="button"
            onClick={handleContinue}
            disabled={!hasSelected}
            className="h-12 w-full rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber disabled:opacity-50 lg:w-auto lg:px-8"
          >
            Continue
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-xl font-extrabold leading-snug text-kaam-navy">
            Which appliances do you want <span className="text-kaam-amber">on backup?</span>
          </h2>
          <p className="mt-1 text-sm text-kaam-muted">Select appliances for battery backup</p>
        </div>

        {applianceGroups.map((group) => (
          <div key={group.title}>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-kaam-muted">
              {group.title}
            </h3>
            <div className="overflow-hidden rounded-xl2 border border-kaam-line bg-kaam-card">
              {group.ids.map((id, index) => renderRow(id, index < group.ids.length - 1))}
            </div>
          </div>
        ))}

        {customAppliances.length > 0 ? (
          <div>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-kaam-muted">
              ADDED APPLIANCES
            </h3>
            <div className="overflow-hidden rounded-xl2 border border-kaam-line bg-kaam-card">
              {customAppliances.map((item, index) =>
                renderRow(item.id, index < customAppliances.length - 1)
              )}
            </div>
          </div>
        ) : null}

        <StepCard title="More appliances">
          <ul className="grid gap-2 sm:grid-cols-2">
            {extraApplianceOptions.map((item) => {
              const added = backupAppliances.some((appliance) => appliance.id === item.id);
              return (
                <li
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-kaam-line px-3 py-2"
                >
                  <span className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-kaam-yellow/30 bg-kaam-yellow/15">
                      {createElement(applianceIcon(item.id), {
                        size: 16,
                        className: 'text-[#B98900]',
                        strokeWidth: 1.8,
                        'aria-hidden': true
                      })}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-extrabold text-kaam-navy">
                        {item.name}
                      </span>
                      <span className="block text-[11px] text-kaam-muted">{item.watts} W</span>
                    </span>
                  </span>
                  <button
                    type="button"
                    disabled={added}
                    onClick={() => addBackupAppliance({ ...item, quantity: 1, hours: 1 })}
                    className={
                      added
                        ? 'rounded-lg bg-kaam-surface px-3 py-1.5 text-[11px] font-extrabold text-kaam-muted'
                        : 'rounded-lg bg-kaam-yellow px-3 py-1.5 text-[11px] font-extrabold text-kaam-navy hover:bg-kaam-amber'
                    }
                  >
                    {added ? 'Added' : 'Add'}
                  </button>
                </li>
              );
            })}
          </ul>
        </StepCard>
      </div>
    </WizardShell>
  );
};
