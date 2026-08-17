'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { useProducts } from '@/hooks/useProducts';
import { useSystemStore } from '@/store/useSystemStore';
import { calculatePanelLayout } from '@/utils/calculations';
import { extractPanelWattage, isPanelProduct } from '@/utils/packageBuilder';
import { selectDefaultPanelProduct } from '@/utils/panelProducts';
import { PanelLayoutVisualizer } from '@/features/design/PanelLayoutVisualizer';
import { routes } from '@/constants/routes';
import { cn } from '@/lib/cn';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/solar-tools/RoofSpaceToolScreen.tsx.
 *
 * A standalone panel-count -> roof-area calculator, distinct from the wizard's
 * roof step (same engine, entered from Home's Smart Tools rather than the
 * appliance-driven flow). Reuses `PanelLayoutVisualizer` from the wizard
 * (Phase 6) rather than re-implementing panel layout rendering.
 *
 * "Build my system" writes the layout into the store via
 * `setPanelLayoutSelection` — the same action the wizard's roof step uses —
 * then jumps into the wizard at that step, matching mobile's
 * `navigation.navigate('DesignFlow', { screen: 'roof' })`.
 */
export const RoofSpaceTool = () => {
  const router = useRouter();
  const orientation = useSystemStore((state) => state.panelOrientation);
  const setOrientation = useSystemStore((state) => state.setPanelOrientation);
  const storedPanel = useSystemStore((state) => state.selectedPanels);
  const storedPanelWattage = useSystemStore((state) => state.panelWattage);
  const setPanelLayoutSelection = useSystemStore((state) => state.setPanelLayoutSelection);

  const panelQuery = useProducts('panel');
  const [panelCountInput, setPanelCountInput] = useState('12');

  const panelProducts = useMemo(
    () =>
      (panelQuery.data ?? [])
        .filter(isPanelProduct)
        .filter((product) => extractPanelWattage(product) > 0),
    [panelQuery.data]
  );

  const selectedPanel =
    panelProducts.find((product) => product.id === storedPanel?.id) ??
    (storedPanel && isPanelProduct(storedPanel) && extractPanelWattage(storedPanel) > 0
      ? storedPanel
      : null) ??
    selectDefaultPanelProduct(panelProducts, storedPanelWattage);

  const selectedPanelWattage = selectedPanel
    ? extractPanelWattage(selectedPanel)
    : Math.max(1, storedPanelWattage || 610);

  const panelCount = Math.max(1, Number.parseInt(panelCountInput, 10) || 12);

  const layout = useMemo(
    () => calculatePanelLayout({ panelCount, orientation }),
    [orientation, panelCount]
  );

  const buildSystem = () => {
    setPanelLayoutSelection({
      panelQuantity: panelCount,
      panelWattage: selectedPanelWattage,
      orientation,
      panelProduct: selectedPanel
    });
    router.push(routes.design('roof'));
  };

  return (
    <Screen width="narrow">
      <h1 className="text-2xl font-extrabold text-kaam-navy">Roof Space Calculator</h1>
      <p className="mt-1 text-sm text-kaam-muted">
        See how much roof area a given number of panels needs.
      </p>

      <div className="mt-6 flex flex-col gap-5">
        <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12.5px] font-black text-kaam-navy">Number of panels</span>
            <input
              type="number"
              min={1}
              value={panelCountInput}
              onChange={(event) => setPanelCountInput(event.target.value)}
              className="h-[46px] rounded-[13px] border border-kaam-line bg-[#FFFEFB] px-3 text-[13.5px] font-semibold text-kaam-navy outline-none focus:border-kaam-amber"
            />
          </label>

          <div className="mt-4 flex gap-1 rounded-xl bg-kaam-surface p-1" role="group">
            {(['landscape', 'portrait'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setOrientation(option)}
                aria-pressed={orientation === option}
                className={cn(
                  'flex-1 rounded-lg py-2 text-xs font-extrabold capitalize transition-colors',
                  orientation === option ? 'bg-white text-kaam-navy shadow-sm' : 'text-kaam-muted'
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xl font-extrabold text-kaam-navy">{panelCount}</p>
              <p className="text-[11px] text-kaam-muted">Panels</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-kaam-navy">{selectedPanelWattage} W</p>
              <p className="text-[11px] text-kaam-muted">Each</p>
            </div>
            <div>
              <p className="text-xl font-extrabold text-kaam-navy">{Math.ceil(layout.area)}</p>
              <p className="text-[11px] text-kaam-muted">sq ft</p>
            </div>
          </div>

          <div className="mt-5">
            <PanelLayoutVisualizer layout={layout} panelCount={panelCount} />
            <p className="mt-2 text-center text-[11px] text-kaam-muted">
              {layout.rows} rows × {layout.columns} columns · {layout.width.toFixed(1)} ft ×{' '}
              {layout.height.toFixed(1)} ft
            </p>
          </div>
        </section>

        <button
          type="button"
          onClick={buildSystem}
          className="h-12 rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber"
        >
          Build My System
        </button>
      </div>
    </Screen>
  );
};
