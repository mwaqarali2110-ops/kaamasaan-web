'use client';

import { createElement, useState } from 'react';
import { useSystemStore } from '@/store/useSystemStore';
import { StepCard, WizardShell } from '../WizardShell';
import { ApplianceRow } from '../ApplianceRow';
import { applianceGroups, applianceIcon, extraApplianceOptions } from '../applianceContent';
import { STEP_TITLES } from '../wizard';
import { LoadSummary } from '../LoadSummary';
import type { StepProps } from './types';

/**
 * Step 1 — ported from `ApplianceStepScreen` in
 * kaamasaan-mobile/.../DesignSystemFlowScreen.tsx.
 *
 * Gate is mobile's exactly: at least one appliance with quantity > 0, otherwise
 * show the validation message and do not advance.
 */
export const AppliancesStep = ({ onContinue, onBack }: StepProps) => {
  const appliances = useSystemStore((state) => state.appliances);
  const setApplianceQuantity = useSystemStore((state) => state.setApplianceQuantity);
  const addAppliance = useSystemStore((state) => state.addAppliance);
  const [error, setError] = useState('');

  // Resolve the delta against fresh store state so rapid clicks cannot be
  // collapsed into one increment by React batching.
  const stepQuantity = (id: string, delta: -1 | 1) => {
    const current =
      useSystemStore.getState().appliances.find((item) => item.id === id)?.quantity ?? 0;
    setApplianceQuantity(id, Math.min(20, Math.max(0, current + delta)));
  };

  const selectedQuantity = appliances.reduce(
    (total, item) => total + Math.max(0, Number(item.quantity) || 0),
    0
  );
  const hasSelected = selectedQuantity > 0;

  const defaultIds = new Set(applianceGroups.flatMap((group) => group.ids));
  const customAppliances = appliances.filter((item) => !defaultIds.has(item.id));

  const handleContinue = () => {
    if (!hasSelected) {
      setError('Please select at least one appliance to calculate your load.');
      return;
    }
    setError('');
    onContinue();
  };

  return (
    <WizardShell
      step="appliances"
      title={STEP_TITLES.appliances}
      onBack={onBack}
      summary={<LoadSummary />}
      footer={
        <div>
          {error ? <p className="mb-2 text-xs font-bold text-kaam-red">{error}</p> : null}
          <button
            type="button"
            onClick={handleContinue}
            disabled={!hasSelected}
            className="h-12 w-full rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber disabled:opacity-50 lg:w-auto lg:px-8"
          >
            Calculate Load
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-xl font-extrabold leading-snug text-kaam-navy">
            Which appliances do you use <span className="text-kaam-amber">during the day?</span>
          </h2>
          <p className="mt-1 text-sm text-kaam-muted">Select the appliances that apply to you</p>
        </div>

        {applianceGroups.map((group) => (
          <div key={group.title}>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-kaam-muted">
              {group.title}
            </h3>
            <div className="overflow-hidden rounded-xl2 border border-kaam-line bg-kaam-card">
              {group.ids.map((id, index) => {
                const item = appliances.find((appliance) => appliance.id === id);
                if (!item) return null;
                return (
                  <ApplianceRow
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    watts={item.watts}
                    quantity={item.quantity}
                    showDivider={index < group.ids.length - 1}
                    onQuantityStep={(delta) => stepQuantity(item.id, delta)}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {customAppliances.length > 0 ? (
          <div>
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-kaam-muted">
              ADDED APPLIANCES
            </h3>
            <div className="overflow-hidden rounded-xl2 border border-kaam-line bg-kaam-card">
              {customAppliances.map((item, index) => (
                <ApplianceRow
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  watts={item.watts}
                  quantity={item.quantity}
                  showDivider={index < customAppliances.length - 1}
                  onQuantityStep={(delta) => stepQuantity(item.id, delta)}
                />
              ))}
            </div>
          </div>
        ) : null}

        {/*
          Mobile opens a bottom sheet for these. The list is short, so on web an
          always-visible section is simpler and more accessible than a modal.
        */}
        <StepCard title="More appliances">
          <ul className="grid gap-2 sm:grid-cols-2">
            {extraApplianceOptions.map((item) => {
              const added = appliances.some((appliance) => appliance.id === item.id);
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
                    onClick={() => addAppliance({ ...item, quantity: 1, hours: 4 })}
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
