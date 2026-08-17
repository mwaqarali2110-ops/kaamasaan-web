import { describe, expect, it } from 'vitest';
import { calculateProjection, fallbackROIInput, formatCompactCurrency, formatPercent } from './roiCalculator';

/**
 * Locks the ROI projection math to the values ported from
 * kaamasaan-mobile/.../ROICalculatorScreen.tsx. The mobile app had no test for
 * this engine at all — it lived inline in the screen with nothing to run it.
 */
describe('calculateProjection', () => {
  it('matches the fallback scenario mobile ships as its example', () => {
    const projection = calculateProjection(fallbackROIInput);

    expect(projection.projectionData).toHaveLength(10);
    expect(projection.monthlySavings).toBe(56250);

    // annualSavingsYear1 = 56250 * 12 - 15000 (no escalation/degradation in year 1)
    expect(projection.annualSavingsYear1).toBeCloseTo(56250 * 12 - 15000, 5);

    // Breakeven must be the first year cumulative savings meets system cost.
    const breakevenRow = projection.projectionData.find(
      (row) => row.year === projection.breakevenYear
    );
    expect(breakevenRow?.cumulativeSavings).toBeGreaterThanOrEqual(fallbackROIInput.systemCost);
    const priorRow = projection.projectionData.find(
      (row) => row.year === (projection.breakevenYear ?? 0) - 1
    );
    if (priorRow) expect(priorRow.cumulativeSavings).toBeLessThan(fallbackROIInput.systemCost);
  });

  it('escalates tariff and degrades output year over year', () => {
    const projection = calculateProjection(fallbackROIInput);
    const [year1, year2] = projection.projectionData;
    // Year 2 pre-maintenance savings grow by the tariff escalation and shrink
    // by degradation, so the net effect must still be an increase given the
    // fallback's 8% escalation dwarfs its 0.5% degradation.
    expect(year2.annualSavings).toBeGreaterThan(year1.annualSavings);
  });

  it('never lets annual savings go negative', () => {
    const projection = calculateProjection({
      ...fallbackROIInput,
      estimatedMonthlySavings: 100,
      annualMaintenanceCost: 100000
    });
    for (const row of projection.projectionData) {
      expect(row.annualSavings).toBeGreaterThanOrEqual(0);
    }
  });

  it('reports no breakeven when savings never reach system cost within the window', () => {
    const projection = calculateProjection({
      ...fallbackROIInput,
      systemCost: 100_000_000,
      estimatedMonthlySavings: 1000
    });
    expect(projection.breakevenYear).toBeUndefined();
  });
});

describe('formatters', () => {
  it('compacts large currency values into Lakh/Crore, matching en-PK convention', () => {
    expect(formatCompactCurrency(250000)).toBe('PKR 2.5L');
    expect(formatCompactCurrency(15000000)).toBe('PKR 1.5Cr');
    expect(formatCompactCurrency(5000)).toBe('PKR 5,000');
  });

  it('drops decimals once the percentage reaches 100', () => {
    expect(formatPercent(45.6)).toBe('45.6%');
    expect(formatPercent(123.4)).toBe('123%');
  });
});
