'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { Screen } from '@/components/ui/Screen';
import { cleanNumber } from '@/utils/roiCalculator';
import { routes } from '@/constants/routes';
import { cn } from '@/lib/cn';

/**
 * Ported from `ROICalculatorScreen` in
 * kaamasaan-mobile/.../ROICalculatorScreen.tsx. Battery size is optional;
 * system size and total cost are required, matching mobile's validation
 * exactly. `estimatedMonthlySavings = systemSize * 5625` is mobile's fixed
 * estimate — the result screen re-derives it the same way if not supplied.
 */
const Field = ({
  label,
  placeholder,
  value,
  onChange,
  helper,
  prefix,
  error
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  helper: string;
  prefix?: string;
  error?: boolean;
}) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[12.5px] font-black text-kaam-navy">{label}</span>
    <span
      className={cn(
        'flex h-[46px] items-center gap-2 rounded-[13px] border bg-[#FFFEFB] px-3 focus-within:border-kaam-amber',
        error ? 'border-kaam-red' : 'border-kaam-line'
      )}
    >
      {prefix ? <span className="shrink-0 text-xs font-bold text-kaam-muted">{prefix}</span> : null}
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={error}
        className="min-w-0 flex-1 bg-transparent text-[13.5px] font-semibold text-kaam-navy outline-none placeholder:text-[#9CA3AF]"
      />
    </span>
    <span className="text-[11px] text-kaam-muted">{helper}</span>
  </label>
);

export const ROICalculator = () => {
  const router = useRouter();
  const [systemSize, setSystemSize] = useState('');
  const [batterySize, setBatterySize] = useState('');
  const [totalCost, setTotalCost] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const hasSystemSize = Number(systemSize) > 0;
  const hasTotalCost = Number(totalCost) > 0;
  const hasError = submitted && (!hasSystemSize || !hasTotalCost);

  const calculate = () => {
    setSubmitted(true);
    if (!hasSystemSize || !hasTotalCost) return;

    const parsedSystemSize = Number(systemSize);
    router.push(
      routes.roiResult({
        systemSize: parsedSystemSize,
        batterySize: Number(batterySize) || 0,
        totalCost: Number(totalCost),
        estimatedMonthlySavings: Math.round(parsedSystemSize * 5625)
      })
    );
  };

  return (
    <Screen width="narrow">
      <h1 className="text-2xl font-extrabold text-kaam-navy">ROI Calculator</h1>
      <p className="mt-1 text-sm text-kaam-muted">Enter your quoted system details</p>

      <div className="mt-6 flex flex-col gap-5">
        <section className="flex flex-col gap-4 rounded-xl2 border border-kaam-line bg-kaam-card p-5">
          <Field
            label="Solar System Size (kW)"
            placeholder="Enter system size"
            value={systemSize}
            onChange={(value) => setSystemSize(cleanNumber(value))}
            helper="Typical homes use 5-10 kW systems"
            error={submitted && !hasSystemSize}
          />
          <Field
            label="Battery Size (kWh) (optional)"
            placeholder="Enter battery size"
            value={batterySize}
            onChange={(value) => setBatterySize(cleanNumber(value))}
            helper="Optional - add only if backup is included"
          />
          <Field
            label="Total System Cost (PKR)"
            placeholder="Enter total cost"
            value={totalCost}
            onChange={(value) => setTotalCost(value.replace(/[^0-9]/g, ''))}
            helper="Enter complete quoted price including installation"
            prefix="PKR"
            error={submitted && !hasTotalCost}
          />
        </section>

        {hasError ? (
          <p className="text-xs font-bold text-kaam-red" role="alert">
            Enter system size and total system cost to calculate ROI.
          </p>
        ) : null}

        <button
          type="button"
          onClick={calculate}
          className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber"
        >
          Calculate ROI
          <ArrowRight size={18} strokeWidth={2.6} className="rtl:rotate-180" aria-hidden />
        </button>

        <div className="flex items-center justify-between gap-3 rounded-xl2 border border-kaam-line bg-kaam-surface p-4">
          <div>
            <p className="text-sm font-extrabold text-kaam-navy">Need a recommended package?</p>
            <p className="text-xs text-kaam-muted">Build a system with guided solar planning.</p>
          </div>
          <Link
            href={routes.design()}
            aria-label="Design your system"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kaam-yellow/20"
          >
            <ArrowRight size={17} strokeWidth={2.4} className="text-[#B07800] rtl:rotate-180" aria-hidden />
          </Link>
        </div>
      </div>
    </Screen>
  );
};
