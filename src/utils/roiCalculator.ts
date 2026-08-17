/**
 * Ported verbatim from the top-level helpers in
 * kaamasaan-mobile/src/mobile/screens/solar-tools/ROICalculatorScreen.tsx
 * (fallbackROIInput, calculateProjection, formatters, buildROIReportHtml).
 *
 * Extracted into its own module — mobile has no `roiCalculator.js` in
 * `src/config/` despite CLAUDE.md documenting one; the calculation lived
 * inline in the screen. Pulling it out here makes it independently testable
 * and reusable between the ROI form, the result screen and the PDF export.
 */

export const fallbackROIInput = {
  systemSize: 10,
  batterySize: 0,
  systemCost: 1800000,
  estimatedMonthlySavings: 56250,
  monthlyUnitsOffset: 1250,
  effectiveElectricityRate: 45,
  annualMaintenanceCost: 15000,
  yearlyTariffEscalation: 0.08,
  solarDegradation: 0.005,
  analysisYears: 10
};

export type ProjectionRow = {
  year: number;
  annualSavings: number;
  cumulativeSavings: number;
  roiPercent: number;
};

export type ROIInput = typeof fallbackROIInput;
export type ROIReportData = ReturnType<typeof calculateProjection> &
  ROIInput & {
    generatedDate: string;
    breakevenLabel: string;
  };

export const cleanNumber = (value: string) => value.replace(/[^0-9.]/g, '');

export const formatCurrency = (value: number) => {
  const numeric = Number(value || 0);
  return `PKR ${numeric.toLocaleString('en-PK', { maximumFractionDigits: 0 })}`;
};

export const formatCompactCurrency = (value: number) => {
  if (Math.abs(value) >= 10000000) return `PKR ${(value / 10000000).toFixed(1)}Cr`;
  if (Math.abs(value) >= 100000) return `PKR ${(value / 100000).toFixed(1)}L`;
  return formatCurrency(value);
};

export const formatPercent = (value: number) => {
  const numeric = Number(value || 0);
  return `${numeric.toFixed(Math.abs(numeric) >= 100 ? 0 : 1)}%`;
};

export const formatYears = (value: number) => {
  const numeric = Number(value || 0);
  return `${numeric.toFixed(1)} years`;
};

const escapeHtml = (value: string | number) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const calculateProjection = (input: ROIInput) => {
  const projectionData: ProjectionRow[] = [];

  for (let year = 1; year <= input.analysisYears; year += 1) {
    const annualSavings = Math.max(
      0,
      input.estimatedMonthlySavings *
        12 *
        Math.pow(1 + input.yearlyTariffEscalation, year - 1) *
        Math.pow(1 - input.solarDegradation, year - 1) -
        input.annualMaintenanceCost
    );
    const cumulativeSavings = annualSavings + (projectionData[year - 2]?.cumulativeSavings ?? 0);
    const roiPercent = ((cumulativeSavings - input.systemCost) / input.systemCost) * 100;
    projectionData.push({ year, annualSavings, cumulativeSavings, roiPercent });
  }

  const annualSavingsYear1 = projectionData[0]?.annualSavings ?? 0;
  const cumulativeSavings10 = projectionData[projectionData.length - 1]?.cumulativeSavings ?? 0;
  const breakeven = projectionData.find((row) => row.cumulativeSavings >= input.systemCost);

  return {
    monthlySavings: input.estimatedMonthlySavings,
    annualSavingsYear1,
    paybackPeriod: annualSavingsYear1 > 0 ? input.systemCost / annualSavingsYear1 : 0,
    breakevenYear: breakeven?.year,
    cumulativeSavings10,
    roi10: ((cumulativeSavings10 - input.systemCost) / input.systemCost) * 100,
    netProfit10: cumulativeSavings10 - input.systemCost,
    projectionData
  };
};

/**
 * Renders the standalone HTML report mobile builds for `expo-print`.
 * On web this same HTML is opened in a new tab and printed via
 * `window.print()` (see ROIResult.tsx) — the "Save as PDF" browser dialog
 * replaces `expo-sharing`, so the markup and styles are unchanged.
 */
export const buildROIReportHtml = (data: ROIReportData) => {
  const rows = Array.isArray(data.projectionData) ? data.projectionData : [];
  const projectionRows = rows.length
    ? rows
        .map(
          (row) => `
        <tr>
          <td>Year ${escapeHtml(row.year)}</td>
          <td>${escapeHtml(formatCurrency(row.annualSavings))}</td>
          <td>${escapeHtml(formatCurrency(row.cumulativeSavings))}</td>
          <td class="${row.roiPercent >= 0 ? 'positive' : 'negative'}">${escapeHtml(formatPercent(row.roiPercent))}</td>
        </tr>
      `
        )
        .join('')
    : '<tr><td colspan="4">No yearly projection data available.</td></tr>';
  const monthlyFormula =
    data.monthlyUnitsOffset && data.effectiveElectricityRate
      ? `
        <p class="formula">Estimated Monthly Savings = Monthly Units Offset x Effective Electricity Rate</p>
        <table>
          <tr><th>Monthly Units Offset</th><td>${escapeHtml(Math.round(data.monthlyUnitsOffset).toLocaleString('en-PK'))} units</td></tr>
          <tr><th>Effective Electricity Rate</th><td>${escapeHtml(formatCurrency(data.effectiveElectricityRate))} / unit</td></tr>
          <tr><th>Estimated Monthly Savings</th><td>${escapeHtml(Math.round(data.monthlyUnitsOffset).toLocaleString('en-PK'))} x ${escapeHtml(formatCurrency(data.effectiveElectricityRate))} = ${escapeHtml(formatCurrency(data.monthlySavings))}</td></tr>
        </table>
      `
      : '<p>Monthly savings are estimated using your expected solar generation, units offset, and current electricity rate.</p>';

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; padding: 32px; background: #ffffff; color: #0F172A; font-family: Arial, sans-serif; }
          .brand { color: #D99A00; font-size: 15px; font-weight: 800; letter-spacing: 0.4px; }
          h1 { margin: 8px 0 4px; font-size: 30px; line-height: 1.15; }
          h2 { margin: 28px 0 12px; font-size: 18px; color: #0F172A; }
          p { margin: 0 0 10px; color: #475569; font-size: 12px; line-height: 1.55; }
          .header { padding-bottom: 18px; border-bottom: 3px solid #F5B400; }
          .subtitle { font-size: 13px; font-weight: 700; color: #64748B; }
          .date { margin-top: 10px; color: #64748B; font-size: 11px; font-weight: 700; }
          .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 20px; }
          .card { border: 1px solid #F0E3CF; border-radius: 16px; background: #FFFBF2; padding: 14px; }
          .label { color: #64748B; font-size: 11px; font-weight: 800; }
          .value { margin-top: 6px; color: #0F172A; font-size: 20px; font-weight: 900; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; overflow: hidden; border-radius: 12px; }
          th { background: #FFF4D6; color: #8A6B14; text-align: left; font-size: 11px; padding: 10px; }
          td { border-bottom: 1px solid #EFE7DA; color: #0F172A; font-size: 11px; font-weight: 700; padding: 10px; }
          tr:last-child td { border-bottom: 0; }
          .formula { background: #FFF8E6; border-left: 4px solid #F5B400; border-radius: 10px; padding: 10px; color: #0F172A; font-weight: 800; }
          .positive { color: #168A4A; }
          .negative { color: #D14343; }
          .note { margin-top: 18px; padding: 12px; border-radius: 14px; background: #F8FAFC; color: #64748B; font-size: 10.5px; }
          .footer { margin-top: 24px; padding-top: 14px; border-top: 1px solid #EFE7DA; color: #94A3B8; font-size: 10px; }
        </style>
      </head>
      <body>
        <section class="header">
          <div class="brand">KaamAsaan</div>
          <h1>ROI Estimate Report</h1>
          <p class="subtitle">Solar savings and payback projection</p>
          <p class="date">Generated: ${escapeHtml(data.generatedDate)}</p>
        </section>

        <section class="summary-grid">
          <div class="card"><div class="label">Estimated Monthly Savings</div><div class="value">${escapeHtml(formatCurrency(data.monthlySavings))}</div></div>
          <div class="card"><div class="label">Estimated Annual Savings</div><div class="value">${escapeHtml(formatCurrency(data.annualSavingsYear1))}</div></div>
          <div class="card"><div class="label">Payback Period</div><div class="value">${escapeHtml(formatYears(data.paybackPeriod))}</div></div>
          <div class="card"><div class="label">10-Year ROI</div><div class="value">${escapeHtml(formatPercent(data.roi10))}</div></div>
        </section>

        <h2>How Estimated Monthly Savings Are Calculated</h2>
        ${monthlyFormula}

        <h2>Investment & Breakeven Summary</h2>
        <table>
          <tr><th>Total System Cost</th><td>${escapeHtml(formatCurrency(data.systemCost))}</td></tr>
          <tr><th>Breakeven Year</th><td>${escapeHtml(data.breakevenLabel)}</td></tr>
          <tr><th>10-Year Cumulative Savings</th><td>${escapeHtml(formatCurrency(data.cumulativeSavings10))}</td></tr>
          <tr><th>Net Profit After 10 Years</th><td>${escapeHtml(formatCurrency(data.netProfit10))}</td></tr>
        </table>

        <h2>10-Year Savings Projection</h2>
        <table>
          <tr>
            <th>Year</th>
            <th>Annual Savings</th>
            <th>Cumulative Savings</th>
            <th>ROI %</th>
          </tr>
          ${projectionRows}
        </table>

        <p class="note">
          ${escapeHtml(
            data.breakevenYear
              ? `Your cumulative savings are expected to cross the system cost in Year ${data.breakevenYear}.`
              : 'Your cumulative savings are expected to cross the system cost beyond 10 years.'
          )}
        </p>

        <p class="footer">
          Note: This ROI estimate is based on the information provided and current assumptions for electricity rates, system performance, and annual savings. Actual savings may vary depending on site conditions, usage pattern, electricity tariff changes, system quality, and maintenance.
        </p>
      </body>
    </html>
  `;
};
