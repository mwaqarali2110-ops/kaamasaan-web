'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BarChart3,
  CalendarClock,
  Coins,
  FileDown,
  Landmark,
  LineChart,
  PiggyBank,
  TrendingUp,
  type LucideIcon
} from 'lucide-react';
import { Screen } from '@/components/ui/Screen';
import {
  buildROIReportHtml,
  calculateProjection,
  fallbackROIInput,
  formatCompactCurrency,
  formatCurrency,
  formatPercent,
  type ROIInput,
  type ROIReportData
} from '@/utils/roiCalculator';
import { SavingsProjectionChart } from './SavingsProjectionChart';
import { cn } from '@/lib/cn';

/**
 * Ported from `ROIResultScreen` in
 * kaamasaan-mobile/.../ROICalculatorScreen.tsx.
 *
 * PDF export deviation: mobile builds the report HTML, renders it to a PDF
 * with `expo-print`, writes it to the filesystem, then hands it to
 * `expo-sharing`. On web there is no filesystem to write to and no share
 * sheet — the same `buildROIReportHtml()` markup is opened in a new tab and
 * `window.print()` is called immediately, so the browser's native "Save as
 * PDF" print destination produces an equivalent file. The HTML and its styles
 * are byte-identical to mobile's.
 */
const SummaryCard = ({
  Icon,
  label,
  value,
  helper
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
  helper: string;
}) => (
  <div className="rounded-xl2 border border-kaam-line bg-kaam-card p-4">
    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-kaam-yellow/20">
      <Icon size={16} className="text-[#B07800]" aria-hidden />
    </span>
    <p className="mt-2 text-[11px] font-extrabold text-kaam-muted">{label}</p>
    <p className="mt-0.5 text-lg font-extrabold text-kaam-navy">{value}</p>
    <p className="text-[10px] text-kaam-muted">{helper}</p>
  </div>
);

const MetricRow = ({
  label,
  value,
  strong = false,
  last = false
}: {
  label: string;
  value: string;
  strong?: boolean;
  last?: boolean;
}) => (
  <div className={cn('flex items-center justify-between gap-3 py-2.5', !last && 'border-b border-kaam-line')}>
    <span className="text-xs text-kaam-muted">{label}</span>
    <span className={cn('text-sm text-kaam-navy', strong ? 'font-extrabold' : 'font-semibold')}>
      {value}
    </span>
  </div>
);

const SectionHeader = ({
  title,
  subtitle,
  Icon
}: {
  title: string;
  subtitle: string;
  Icon: LucideIcon;
}) => (
  <div className="flex items-start justify-between gap-3">
    <div>
      <h2 className="text-sm font-extrabold text-kaam-navy">{title}</h2>
      <p className="text-xs text-kaam-muted">{subtitle}</p>
    </div>
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kaam-yellow/20">
      <Icon size={17} className="text-[#B07800]" strokeWidth={2.4} aria-hidden />
    </span>
  </div>
);

export const ROIResult = ({
  systemSize,
  batterySize,
  totalCost,
  estimatedMonthlySavings: estimatedMonthlySavingsParam
}: {
  systemSize?: number;
  batterySize?: number;
  totalCost?: number;
  estimatedMonthlySavings?: number;
}) => {
  const router = useRouter();
  const [isPreparingReport, setIsPreparingReport] = useState(false);

  const effectiveElectricityRate = fallbackROIInput.effectiveElectricityRate;

  // `input` is rebuilt inside the memo, keyed on the primitive params rather
  // than the object itself — otherwise a fresh object every render would
  // recompute the projection on every render regardless of memoization.
  const input: ROIInput = useMemo(() => {
    const estimatedMonthlySavings =
      estimatedMonthlySavingsParam ||
      Math.round((systemSize || fallbackROIInput.systemSize) * 5625);
    return {
      ...fallbackROIInput,
      systemSize: systemSize || fallbackROIInput.systemSize,
      batterySize: batterySize || fallbackROIInput.batterySize,
      systemCost: totalCost || fallbackROIInput.systemCost,
      estimatedMonthlySavings,
      effectiveElectricityRate,
      monthlyUnitsOffset: Math.round(estimatedMonthlySavings / effectiveElectricityRate)
    };
  }, [systemSize, batterySize, totalCost, estimatedMonthlySavingsParam, effectiveElectricityRate]);

  const projection = useMemo(() => calculateProjection(input), [input]);
  const breakevenLabel = projection.breakevenYear ? `Year ${projection.breakevenYear}` : 'Beyond 10 years';

  const downloadROIReport = () => {
    if (isPreparingReport) return;
    setIsPreparingReport(true);
    try {
      const reportData: ROIReportData = {
        ...input,
        ...projection,
        generatedDate: new Date().toLocaleDateString('en-PK', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        breakevenLabel
      };
      const html = buildROIReportHtml(reportData);
      const reportWindow = window.open('', '_blank');
      if (!reportWindow) {
        window.alert('Please allow pop-ups to download the ROI report.');
        return;
      }
      reportWindow.document.write(html);
      reportWindow.document.close();
      // Give the new document a beat to lay out before invoking print.
      setTimeout(() => reportWindow.print(), 300);
    } finally {
      setIsPreparingReport(false);
    }
  };

  return (
    <Screen width="narrow">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-kaam-line bg-white text-kaam-navy hover:border-kaam-amber"
        >
          <ArrowLeft size={19} strokeWidth={2.4} className="rtl:rotate-180" aria-hidden />
        </button>
        <div>
          <h1 className="text-lg font-extrabold text-kaam-navy">ROI Estimate</h1>
          <p className="text-xs text-kaam-muted">See your savings and payback over time</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <SummaryCard
          Icon={PiggyBank}
          label="Estimated Monthly Savings"
          value={formatCurrency(projection.monthlySavings)}
          helper={`${input.systemSize} kW solar estimate`}
        />
        <SummaryCard
          Icon={Coins}
          label="Estimated Annual Savings"
          value={formatCurrency(projection.annualSavingsYear1)}
          helper="Year 1 after maintenance"
        />
        <SummaryCard
          Icon={CalendarClock}
          label="Payback Period"
          value={`${projection.paybackPeriod.toFixed(1)} yrs`}
          helper={`Breakeven: ${breakevenLabel}`}
        />
        <SummaryCard
          Icon={TrendingUp}
          label="10-Year ROI"
          value={formatPercent(projection.roi10)}
          helper="Net return vs cost"
        />
      </div>

      <section className="mt-5 rounded-xl2 border border-kaam-line bg-kaam-card p-5">
        <SectionHeader
          title="Investment Summary"
          subtitle="Based on 10-year solar production"
          Icon={Landmark}
        />
        <div className="mt-3">
          <MetricRow label="Total System Cost" value={formatCurrency(input.systemCost)} />
          <MetricRow label="Breakeven Year" value={breakevenLabel} />
          <MetricRow
            label="10-Year Cumulative Savings"
            value={formatCurrency(projection.cumulativeSavings10)}
          />
          <MetricRow
            label="Net Profit After 10 Years"
            value={formatCurrency(projection.netProfit10)}
            strong
            last
          />
        </div>
      </section>

      <section className="mt-5 rounded-xl2 border border-kaam-line bg-kaam-card p-5">
        <SectionHeader
          title="10-Year Savings Projection"
          subtitle="Bars show annual savings, line shows cumulative savings"
          Icon={BarChart3}
        />
        <div className="mt-3">
          <SavingsProjectionChart
            projectionData={projection.projectionData}
            systemCost={input.systemCost}
            breakevenYear={projection.breakevenYear}
          />
        </div>
        <p className="mt-2 text-center text-[11px] text-kaam-muted">
          {projection.breakevenYear
            ? `Cumulative savings cross your system cost at Year ${projection.breakevenYear}.`
            : 'Cumulative savings are projected to cross system cost beyond 10 years.'}
        </p>
      </section>

      <section className="mt-5 rounded-xl2 border border-kaam-line bg-kaam-card p-5">
        <SectionHeader
          title="Year-by-Year Breakdown"
          subtitle="Annual savings, cumulative savings and ROI"
          Icon={LineChart}
        />
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-[10px] font-extrabold uppercase text-kaam-muted">
                <th className="py-1.5 text-start">Year</th>
                <th className="py-1.5 text-end">Annual</th>
                <th className="py-1.5 text-end">Cumulative</th>
                <th className="py-1.5 text-end">ROI</th>
              </tr>
            </thead>
            <tbody>
              {projection.projectionData.map((row, index) => (
                <tr
                  key={row.year}
                  className={index < projection.projectionData.length - 1 ? 'border-b border-kaam-line' : ''}
                >
                  <td className="py-2 font-extrabold text-kaam-navy">Year {row.year}</td>
                  <td className="py-2 text-end font-semibold text-kaam-navy">
                    {formatCompactCurrency(row.annualSavings)}
                  </td>
                  <td className="py-2 text-end font-semibold text-kaam-navy">
                    {formatCompactCurrency(row.cumulativeSavings)}
                  </td>
                  <td
                    className={cn(
                      'py-2 text-end font-extrabold',
                      row.roiPercent >= 0 ? 'text-kaam-green' : 'text-kaam-navy'
                    )}
                  >
                    {formatPercent(row.roiPercent)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <button
        type="button"
        onClick={downloadROIReport}
        disabled={isPreparingReport}
        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber disabled:opacity-60"
      >
        <FileDown size={20} strokeWidth={2.5} aria-hidden />
        {isPreparingReport ? 'Preparing Report…' : 'Download ROI Report'}
      </button>
    </Screen>
  );
};
