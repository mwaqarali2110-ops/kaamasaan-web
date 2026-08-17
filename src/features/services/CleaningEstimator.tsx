'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { useSystemStore } from '@/store/useSystemStore';
import {
  CLEANING_PRICING,
  calculateCleaningEstimate,
  formatPkrAmount,
  type CleaningStructureType
} from '@/utils/cleaningPricing';
import { routes } from '@/constants/routes';
import { cn } from '@/lib/cn';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/services/CleaningServiceEstimatorScreen.tsx.
 *
 * All pricing comes from the ported `calculateCleaningEstimate`; this screen
 * only collects inputs and applies mobile's validation rules:
 *   - system size required, > 0, <= CLEANING_PRICING.maxSystemSizeKw
 *   - elevated structures additionally require front and back heights
 *
 * The estimate is written to `useSystemStore.setCleaningEstimate`, which the
 * Book Survey form (Phase 8) reads for the `cleaning` booking context.
 */
const parsePositiveNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const structureOptions: Array<{ value: CleaningStructureType; label: string; detail: string }> = [
  { value: 'standard', label: 'Standard roof', detail: 'Panels mounted flush on the roof' },
  { value: 'elevated', label: 'Elevated structure', detail: 'Raised frame above the roof' }
];

export const CleaningEstimator = () => {
  const router = useRouter();
  const storedEstimate = useSystemStore((state) => state.cleaningEstimate);
  const setCleaningEstimate = useSystemStore((state) => state.setCleaningEstimate);
  const clearCleaningEstimate = useSystemStore((state) => state.clearCleaningEstimate);

  const [systemSize, setSystemSize] = useState(
    storedEstimate?.systemSizeKw ? String(storedEstimate.systemSizeKw) : ''
  );
  const [structureType, setStructureType] = useState<CleaningStructureType | null>(
    storedEstimate?.structureType ?? null
  );
  const [frontHeight, setFrontHeight] = useState(
    storedEstimate?.frontHeightFt ? String(storedEstimate.frontHeightFt) : ''
  );
  const [backHeight, setBackHeight] = useState(
    storedEstimate?.backHeightFt ? String(storedEstimate.backHeightFt) : ''
  );
  const [sizeTouched, setSizeTouched] = useState(false);
  const [frontTouched, setFrontTouched] = useState(false);
  const [backTouched, setBackTouched] = useState(false);

  const systemSizeKw = parsePositiveNumber(systemSize);
  const frontHeightFt = parsePositiveNumber(frontHeight);
  const backHeightFt = parsePositiveNumber(backHeight);
  const elevated = structureType === 'elevated';

  const sizeError = !sizeTouched
    ? ''
    : !systemSizeKw
      ? 'Enter a system size greater than 0.'
      : systemSizeKw > CLEANING_PRICING.maxSystemSizeKw
        ? `Maximum supported size is ${CLEANING_PRICING.maxSystemSizeKw} kW.`
        : '';
  const frontError = elevated && frontTouched && !frontHeightFt ? 'Enter a front height greater than 0.' : '';
  const backError = elevated && backTouched && !backHeightFt ? 'Enter a back height greater than 0.' : '';

  const isValid = Boolean(
    systemSizeKw &&
      systemSizeKw <= CLEANING_PRICING.maxSystemSizeKw &&
      structureType &&
      (!elevated || (frontHeightFt && backHeightFt))
  );

  const estimate = useMemo(() => {
    if (!isValid || !systemSizeKw || !structureType) return null;
    return calculateCleaningEstimate({
      systemSizeKw,
      structureType,
      frontHeightFt: elevated ? frontHeightFt : null,
      backHeightFt: elevated ? backHeightFt : null
    });
  }, [backHeightFt, elevated, frontHeightFt, isValid, structureType, systemSizeKw]);

  const goToBooking = () => {
    if (estimate) setCleaningEstimate(estimate);
    else clearCleaningEstimate();
    router.push(routes.bookSurvey({ source: 'cleaning_estimator', bookingContext: 'cleaning' }));
  };

  const numberField = (
    label: string,
    value: string,
    onChange: (value: string) => void,
    onBlur: () => void,
    error: string,
    suffix: string
  ) => (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-black text-kaam-navy">{label}</span>
      <span
        className={cn(
          'flex h-[46px] items-center gap-2 rounded-[13px] border bg-[#FFFEFB] px-3 focus-within:border-kaam-amber',
          error ? 'border-kaam-red' : 'border-kaam-line'
        )}
      >
        <input
          type="number"
          inputMode="decimal"
          min={0}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          className="min-w-0 flex-1 bg-transparent text-[13.5px] font-semibold text-kaam-navy outline-none"
        />
        <span className="shrink-0 text-xs font-bold text-kaam-muted">{suffix}</span>
      </span>
      {error ? (
        <span className="text-[10.5px] font-bold text-kaam-red" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );

  return (
    <Screen>
      <h1 className="text-2xl font-extrabold text-kaam-navy">Solar Panel Cleaning</h1>
      <p className="mt-1 text-sm text-kaam-muted">
        Get an instant estimate for a professional cleaning visit.
      </p>

      <div className="mt-6 lg:grid lg:grid-cols-[1fr_340px] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
            <h2 className="text-sm font-extrabold text-kaam-navy">Your system</h2>
            <div className="mt-4 flex flex-col gap-4">
              {numberField(
                'System size',
                systemSize,
                setSystemSize,
                () => setSizeTouched(true),
                sizeError,
                'kW'
              )}
            </div>
          </section>

          <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
            <h2 className="text-sm font-extrabold text-kaam-navy">Structure type</h2>
            {/* Mobile uses a dropdown sheet; two options render better as cards. */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {structureOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setStructureType(option.value)}
                  aria-pressed={structureType === option.value}
                  className={cn(
                    'rounded-xl2 border p-4 text-start transition-colors',
                    structureType === option.value
                      ? 'border-kaam-amber bg-kaam-yellow/10'
                      : 'border-kaam-line hover:border-kaam-amber'
                  )}
                >
                  <span className="block text-sm font-extrabold text-kaam-navy">{option.label}</span>
                  <span className="mt-0.5 block text-xs text-kaam-muted">{option.detail}</span>
                </button>
              ))}
            </div>

            {elevated ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {numberField(
                  'Front height',
                  frontHeight,
                  setFrontHeight,
                  () => setFrontTouched(true),
                  frontError,
                  'ft'
                )}
                {numberField(
                  'Back height',
                  backHeight,
                  setBackHeight,
                  () => setBackTouched(true),
                  backError,
                  'ft'
                )}
              </div>
            ) : null}
          </section>
        </div>

        <aside className="mt-6 lg:sticky lg:top-24 lg:mt-0">
          <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
            <h2 className="text-xs font-bold uppercase tracking-wide text-kaam-muted">
              Estimated cost
            </h2>

            {estimate ? (
              <>
                <p className="mt-2 text-2xl font-extrabold text-kaam-navy">
                  {formatPkrAmount(estimate.estimatedAmount)}
                </p>
                <dl className="mt-4 divide-y divide-kaam-line">
                  <div className="flex justify-between gap-3 py-2">
                    <dt className="text-xs text-kaam-muted">Base visit</dt>
                    <dd className="text-xs font-extrabold text-kaam-navy">
                      {formatPkrAmount(estimate.breakdown.baseCharge)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3 py-2">
                    <dt className="text-xs text-kaam-muted">System size</dt>
                    <dd className="text-xs font-extrabold text-kaam-navy">
                      {formatPkrAmount(estimate.breakdown.sizeCharge)}
                    </dd>
                  </div>
                  {estimate.breakdown.elevatedSurcharge > 0 ? (
                    <div className="flex justify-between gap-3 py-2">
                      <dt className="text-xs text-kaam-muted">Elevated structure</dt>
                      <dd className="text-xs font-extrabold text-kaam-navy">
                        {formatPkrAmount(estimate.breakdown.elevatedSurcharge)}
                      </dd>
                    </div>
                  ) : null}
                  {estimate.breakdown.heightSurcharge > 0 ? (
                    <div className="flex justify-between gap-3 py-2">
                      <dt className="text-xs text-kaam-muted">Height surcharge</dt>
                      <dd className="text-xs font-extrabold text-kaam-navy">
                        {formatPkrAmount(estimate.breakdown.heightSurcharge)}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </>
            ) : (
              <p className="mt-2 text-sm text-kaam-muted">
                Enter your system size and structure type to see an estimate.
              </p>
            )}

            <button
              type="button"
              onClick={goToBooking}
              className="mt-5 h-12 w-full rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber"
            >
              {estimate ? 'Book Cleaning Visit' : 'Talk to an Expert'}
            </button>
            <p className="mt-2 text-[11px] text-kaam-muted">
              Final price is confirmed after our team reviews your roof.
            </p>
          </section>
        </aside>
      </div>
    </Screen>
  );
};
