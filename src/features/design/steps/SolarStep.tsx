'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { useSystemStore } from '@/store/useSystemStore';
import { calculateLoadKw } from '@/utils/calculations';
import { StepCard, WizardShell } from '../WizardShell';
import { LoadSummary } from '../LoadSummary';
import { STEP_TITLES } from '../wizard';
import { islamabadSolarProductionCurves, type Season } from '../solarProduction';
import { cn } from '@/lib/cn';
import type { StepProps } from './types';

/**
 * Step 2 — ported from `SolarRecommendationStepScreen`.
 *
 * All derived values follow mobile line for line:
 *   recommendedKw = max(3, ceil(runningLoad * 1.5))
 *   systemKw      = clamp(round(store.recommendedSolarKw || recommendedKw), 1, 20)
 *   dailyUnits    = systemKw * (summer ? 6 : 3)
 *   dayCoverage   = min(100, round(systemKw / runningLoad * 100))
 */
export const SolarStep = ({ onContinue, onBack }: StepProps) => {
  const appliances = useSystemStore((state) => state.appliances);
  const storedSolarKw = useSystemStore((state) => state.recommendedSolarKw);
  const setRecommendedSolarKw = useSystemStore((state) => state.setRecommendedSolarKw);
  const [season, setSeason] = useState<Season>('summer');

  const runningLoadKw = calculateLoadKw(appliances);
  const recommendedKw = Math.max(3, Math.ceil(runningLoadKw * 1.5));
  const systemKw = Math.min(20, Math.max(1, Math.round(Number(storedSolarKw || recommendedKw))));
  const dailyUnits = systemKw * (season === 'summer' ? 6 : 3);
  const dayCoverage =
    runningLoadKw <= 0 ? 100 : Math.min(100, Math.round((systemKw / runningLoadKw) * 100));

  const adjust = (delta: number) =>
    setRecommendedSolarKw(Math.min(20, Math.max(1, systemKw + delta)));

  const curve = islamabadSolarProductionCurves[season];
  const peak = Math.max(...curve.points.map((point) => point.multiplier));

  return (
    <WizardShell
      step="solar"
      title={STEP_TITLES.solar}
      onBack={onBack}
      summary={<LoadSummary />}
      footer={
        <button
          type="button"
          onClick={onContinue}
          className="h-12 w-full rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber lg:w-auto lg:px-8"
        >
          Continue
        </button>
      }
    >
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-xl font-extrabold text-kaam-navy">Your Solar Recommendation ☀️</h2>
          <p className="mt-1 text-sm text-kaam-muted">Ideal system size for your daytime usage</p>
        </div>

        <StepCard>
          <div className="flex items-center justify-center gap-6">
            <button
              type="button"
              onClick={() => adjust(-1)}
              disabled={systemKw <= 1}
              aria-label="Decrease system size"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-kaam-line text-kaam-navy disabled:opacity-40"
            >
              <Minus size={18} strokeWidth={2.5} aria-hidden />
            </button>
            <p className="text-center" aria-live="polite">
              <span className="text-5xl font-extrabold text-kaam-navy">{systemKw}</span>
              <span className="text-xl font-extrabold text-kaam-muted"> kW</span>
            </p>
            <button
              type="button"
              onClick={() => adjust(1)}
              disabled={systemKw >= 20}
              aria-label="Increase system size"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-kaam-yellow text-kaam-navy hover:bg-kaam-amber disabled:opacity-40"
            >
              <Plus size={18} strokeWidth={2.5} aria-hidden />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-kaam-surface p-3 text-center">
              <p className="text-sm font-extrabold text-kaam-navy">
                ~{Math.round(dailyUnits)} units/day
              </p>
              <p className="text-[11px] text-kaam-muted">Estimated generation</p>
            </div>
            <div className="rounded-xl bg-kaam-surface p-3 text-center">
              <p className="text-sm font-extrabold text-kaam-navy">~{dayCoverage}% day coverage</p>
              <p className="text-[11px] text-kaam-muted">Of your running load</p>
            </div>
          </div>
        </StepCard>

        <StepCard title="Expected hourly output">
          <div
            className="flex gap-1 rounded-xl bg-kaam-surface p-1"
            role="group"
            aria-label="Season"
          >
            {(['summer', 'winter'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSeason(option)}
                aria-pressed={season === option}
                className={cn(
                  'flex-1 rounded-lg py-2 text-xs font-extrabold capitalize transition-colors',
                  season === option ? 'bg-white text-kaam-navy shadow-sm' : 'text-kaam-muted'
                )}
              >
                {option}
              </button>
            ))}
          </div>

          <p className="mt-3 text-xs text-kaam-muted">{curve.subtitle}</p>

          {/*
            Mobile draws this with Views; on web a simple bar chart in flex.
            Bar height is a computed pixel value, not a CSS percentage — a
            percentage only resolves against a parent with a *definite*
            height, and this bar's direct parent (the flex column) has none
            of its own (it hugs its content). That silently collapsed every
            bar to 0px while the numbers/labels around it rendered fine.
          */}
          <div className="mt-4 flex h-40 items-end gap-1.5">
            {curve.points.map((point) => {
              const kw = systemKw * point.multiplier;
              // 96px ceiling leaves room above for the value label and below
              // for the time label within the 160px (h-40) row.
              const barHeightPx = Math.max(4, Math.round((point.multiplier / peak) * 96));
              return (
                <div key={point.time} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[9px] font-bold text-kaam-muted">{kw.toFixed(1)}</span>
                  <div
                    className="w-full rounded-t bg-kaam-yellow"
                    style={{ height: `${barHeightPx}px` }}
                    title={`${point.time}: ${kw.toFixed(1)} kW`}
                  />
                  <span className="text-[8px] text-kaam-muted">{point.time.replace(' ', '')}</span>
                </div>
              );
            })}
          </div>
        </StepCard>
      </div>
    </WizardShell>
  );
};
