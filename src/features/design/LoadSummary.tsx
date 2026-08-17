'use client';

import { useTranslation } from 'react-i18next';
import { useSystemStore } from '@/store/useSystemStore';
import {
  calculateEnergyKwh,
  calculateLoadKw,
  calculatePanelCount,
  calculateRoofSpace,
  recommendSolarKw
} from '@/utils/calculations';
import { formatKw } from '@/utils/formatters';

/**
 * Live sizing summary shown as a sticky sidebar on desktop.
 *
 * This is the web affordance BUILD_PROMPT §6 calls for — mobile has no room for
 * it and only reveals these numbers on the next step. **No new maths:** every
 * value comes from the engines ported and tested in Phase 2, so it can only
 * ever agree with what the following steps compute.
 */
export const LoadSummary = ({ showPanels = false }: { showPanels?: boolean }) => {
  const { t } = useTranslation();
  const appliances = useSystemStore((state) => state.appliances);
  const panelWattage = useSystemStore((state) => state.panelWattage);
  const panelQuantityOverride = useSystemStore((state) => state.panelQuantityOverride);
  const storedSolarKw = useSystemStore((state) => state.recommendedSolarKw);
  const designStarted = useSystemStore((state) => state.designStarted);

  const selectedCount = appliances.reduce(
    (total, item) => total + Math.max(0, Number(item.quantity) || 0),
    0
  );

  if (selectedCount === 0) {
    return (
      <div className="rounded-xl2 border border-dashed border-kaam-line bg-kaam-card p-5">
        <p className="text-sm font-extrabold text-kaam-navy">{t('tools.mySystem')}</p>
        <p className="mt-1 text-xs text-kaam-muted">
          Add appliances to see your estimated load and system size.
        </p>
      </div>
    );
  }

  const loadKw = calculateLoadKw(appliances);
  const energyKwh = calculateEnergyKwh(appliances);
  // Before the customer confirms a size, preview the engine's recommendation.
  const solarKw = designStarted && storedSolarKw ? storedSolarKw : recommendSolarKw(appliances);
  const panelCount = panelQuantityOverride ?? calculatePanelCount(solarKw, panelWattage);
  const roof = calculateRoofSpace(panelCount);

  const rows: Array<[string, string]> = [
    ['Appliances selected', String(selectedCount)],
    ['Running load', `${loadKw.toFixed(2)} kW`],
    ['Daily energy', `${energyKwh.toFixed(1)} kWh`],
    [t('tools.solarSizeLabel'), formatKw(solarKw)]
  ];

  if (showPanels) {
    rows.push(['Panels', `${panelCount} × ${panelWattage} W`]);
    rows.push(['Roof space', `${Math.round(roof.areaSqFt)} sq ft`]);
  }

  return (
    <div className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-kaam-muted">
        {t('tools.mySystem')}
      </p>
      <dl className="mt-3 divide-y divide-kaam-line">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-3 py-2">
            <dt className="text-xs text-kaam-muted">{label}</dt>
            <dd className="text-sm font-extrabold text-kaam-navy">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};
