'use client';

import type { ProjectionRow } from '@/utils/roiCalculator';
import { formatCompactCurrency } from '@/utils/roiCalculator';

/**
 * Ported from `SavingsProjectionChart` in
 * kaamasaan-mobile/.../ROICalculatorScreen.tsx. Mobile already draws this with
 * `react-native-svg`, so the geometry translates to a browser `<svg>` almost
 * unchanged — only the fixed pixel `width` prop becomes a `viewBox`, so the
 * chart scales to its container instead of needing a measured width.
 */
const CHART_HEIGHT = 230;
const PADDING_LEFT = 36;
const PADDING_RIGHT = 14;
const PADDING_TOP = 18;
const PADDING_BOTTOM = 38;
/** Nominal design width for the viewBox; the SVG itself is fluid. */
const VIEW_WIDTH = 380;

const LegendItem = ({
  color,
  label,
  dashed = false
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) => (
  <span className="flex items-center gap-1.5 text-[10px] font-bold text-kaam-muted">
    <span
      className="h-2 w-2 rounded-full"
      style={{ backgroundColor: color, opacity: dashed ? 0.6 : 1 }}
      aria-hidden
    />
    {label}
  </span>
);

export const SavingsProjectionChart = ({
  projectionData,
  systemCost,
  breakevenYear
}: {
  projectionData: ProjectionRow[];
  systemCost: number;
  breakevenYear?: number;
}) => {
  const chartWidth = VIEW_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const chartHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const maxValue =
    Math.max(
      systemCost,
      ...projectionData.map((row) => row.cumulativeSavings),
      ...projectionData.map((row) => row.annualSavings)
    ) * 1.08;
  const barSlot = chartWidth / projectionData.length;
  const barWidth = Math.min(18, barSlot * 0.48);
  const xFor = (index: number) => PADDING_LEFT + barSlot * index + barSlot / 2;
  const yFor = (value: number) => PADDING_TOP + chartHeight - (value / maxValue) * chartHeight;
  const linePath = projectionData
    .map(
      (row, index) =>
        `${index === 0 ? 'M' : 'L'} ${xFor(index).toFixed(1)} ${yFor(row.cumulativeSavings).toFixed(1)}`
    )
    .join(' ');
  const costY = yFor(systemCost);
  const breakevenIndex = breakevenYear ? breakevenYear - 1 : -1;

  return (
    <div>
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${CHART_HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label={`Savings projection over ${projectionData.length} years`}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = PADDING_TOP + chartHeight * ratio;
          return (
            <line
              key={ratio}
              x1={PADDING_LEFT}
              x2={VIEW_WIDTH - PADDING_RIGHT}
              y1={y}
              y2={y}
              stroke="#EEE4D5"
              strokeWidth={1}
            />
          );
        })}

        <line
          x1={PADDING_LEFT}
          x2={VIEW_WIDTH - PADDING_RIGHT}
          y1={costY}
          y2={costY}
          stroke="#D99A00"
          strokeWidth={1.4}
          strokeDasharray="5 5"
        />
        <text x={PADDING_LEFT} y={Math.max(12, costY - 6)} fill="#B07800" fontSize="10" fontWeight="700">
          System cost
        </text>

        {projectionData.map((row, index) => {
          const x = xFor(index) - barWidth / 2;
          const y = yFor(row.annualSavings);
          return (
            <g key={row.year}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={PADDING_TOP + chartHeight - y}
                rx={5}
                fill="#F5B400"
                opacity={0.82}
              />
              <text
                x={xFor(index)}
                y={CHART_HEIGHT - 16}
                textAnchor="middle"
                fill="#64748B"
                fontSize="9"
                fontWeight="700"
              >
                Y{row.year}
              </text>
            </g>
          );
        })}

        <path d={linePath} fill="none" stroke="#10213A" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        {projectionData.map((row, index) => (
          <circle key={`dot-${row.year}`} cx={xFor(index)} cy={yFor(row.cumulativeSavings)} r={3.4} fill="#10213A" />
        ))}

        {breakevenIndex >= 0 ? (
          <>
            <line
              x1={xFor(breakevenIndex)}
              x2={xFor(breakevenIndex)}
              y1={PADDING_TOP}
              y2={PADDING_TOP + chartHeight}
              stroke="#168A4A"
              strokeWidth={1.3}
              strokeDasharray="4 4"
            />
            <circle
              cx={xFor(breakevenIndex)}
              cy={yFor(projectionData[breakevenIndex].cumulativeSavings)}
              r={6}
              fill="#168A4A"
            />
          </>
        ) : null}

        <text x={4} y={PADDING_TOP + 5} fill="#64748B" fontSize="9" fontWeight="700">
          {formatCompactCurrency(maxValue)}
        </text>
        <text x={6} y={PADDING_TOP + chartHeight} fill="#64748B" fontSize="9" fontWeight="700">
          PKR 0
        </text>
      </svg>

      <div className="mt-2 flex flex-wrap justify-center gap-4">
        <LegendItem color="#F5B400" label="Annual savings" />
        <LegendItem color="#10213A" label="Cumulative" />
        <LegendItem color="#D99A00" label="System cost" dashed />
      </div>
    </div>
  );
};
