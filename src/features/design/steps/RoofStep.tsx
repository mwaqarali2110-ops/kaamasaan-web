'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useSystemStore } from '@/store/useSystemStore';
import { useProducts } from '@/hooks/useProducts';
import { calculatePanelCount, calculatePanelLayout } from '@/utils/calculations';
import { extractPanelWattage, isPanelProduct } from '@/utils/packageBuilder';
import { panelOptionLabel, selectDefaultPanelProduct } from '@/utils/panelProducts';
import { StepCard, WizardShell } from '../WizardShell';
import { PanelLayoutVisualizer } from '../PanelLayoutVisualizer';
import { LoadSummary } from '../LoadSummary';
import { STEP_TITLES } from '../wizard';
import { cn } from '@/lib/cn';
import type { StepProps } from './types';

/**
 * Step 3 — ported from `RoofSpaceStepScreen`.
 *
 * Panel selection, count and layout all come from the ported engines
 * (`selectDefaultPanelProduct`, `calculatePanelCount`, `calculatePanelLayout`).
 * Choosing a panel or orientation writes through `setPanelLayoutSelection`, the
 * same store action mobile uses, so downstream steps see identical state.
 *
 * The "Panel" picker below the layout visual is a single glass card with a
 * collapsed summary row (selected panel + panel count) and a chevron; the
 * full list of panel options only renders once the customer opens it. This
 * is purely presentational — `commit`/`setPanelLayoutSelection` and every
 * calculation are unchanged, so which panel ends up selected behaves exactly
 * as it did with the always-visible list.
 */
export const RoofStep = ({ onContinue, onBack }: StepProps) => {
  const recommendedSolarKw = useSystemStore((state) => state.recommendedSolarKw);
  const panelWattage = useSystemStore((state) => state.panelWattage);
  const panelQuantityOverride = useSystemStore((state) => state.panelQuantityOverride);
  const orientation = useSystemStore((state) => state.panelOrientation);
  const selectedPanels = useSystemStore((state) => state.selectedPanels);
  const setPanelLayoutSelection = useSystemStore((state) => state.setPanelLayoutSelection);
  const setPanelOrientation = useSystemStore((state) => state.setPanelOrientation);

  const panelQuery = useProducts('panel');
  const [panelListOpen, setPanelListOpen] = useState(false);

  const selectedPVSizeKW = Math.min(20, Math.max(1, Math.round(Number(recommendedSolarKw || 3))));
  const requestedPanelWattage = Math.round(Number(panelWattage || 610));

  const panelProducts = useMemo(
    () =>
      (panelQuery.data ?? [])
        .filter(isPanelProduct)
        .filter((product) => extractPanelWattage(product) > 0),
    [panelQuery.data]
  );

  const storedPanel = panelProducts.find((product) => product.id === selectedPanels?.id) ?? null;
  const defaultPanel = useMemo(
    () => selectDefaultPanelProduct(panelProducts, requestedPanelWattage),
    [panelProducts, requestedPanelWattage]
  );
  const selectedPanel = storedPanel ?? defaultPanel;
  const selectedPanelWattage = selectedPanel ? extractPanelWattage(selectedPanel) : 0;

  const panelCount =
    selectedPanelWattage > 0
      ? (panelQuantityOverride ?? calculatePanelCount(selectedPVSizeKW, selectedPanelWattage))
      : 0;

  const layout = useMemo(
    () => calculatePanelLayout({ panelCount, orientation }),
    [orientation, panelCount]
  );

  const commit = (nextOrientation = orientation, product = selectedPanel) => {
    if (!product) return;
    const wattage = extractPanelWattage(product);
    setPanelLayoutSelection({
      panelQuantity: panelQuantityOverride ?? calculatePanelCount(selectedPVSizeKW, wattage),
      panelWattage: wattage,
      orientation: nextOrientation,
      panelProduct: product
    });
  };

  const canOpenPanelList = !panelQuery.isLoading && panelProducts.length > 0;

  return (
    <WizardShell
      step="roof"
      title={STEP_TITLES.roof}
      onBack={onBack}
      summary={<LoadSummary showPanels />}
      footer={
        <button
          type="button"
          onClick={() => {
            commit();
            onContinue();
          }}
          className="h-12 w-full rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber lg:w-auto lg:px-8"
        >
          Continue
        </button>
      }
    >
      <div className="flex flex-col gap-5">
        <div>
          <h2 className="text-xl font-extrabold text-kaam-navy">Roof Space Estimate</h2>
          <p className="mt-1 text-sm text-kaam-muted">
            How much roof area your {selectedPVSizeKW} kW system needs
          </p>
        </div>

        <StepCard>
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

          {panelCount > 0 ? (
            <div className="mt-5">
              <PanelLayoutVisualizer layout={layout} panelCount={panelCount} />
              <p className="mt-2 text-center text-[11px] text-kaam-muted">
                {layout.rows} rows × {layout.columns} columns ·{' '}
                {layout.width.toFixed(1)} ft × {layout.height.toFixed(1)} ft
              </p>
            </div>
          ) : null}
        </StepCard>

        <StepCard title="Panel orientation">
          <div className="flex gap-1 rounded-xl bg-kaam-surface p-1" role="group">
            {(['landscape', 'portrait'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  setPanelOrientation(option);
                  commit(option);
                }}
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
        </StepCard>

        {/* Single glass card, collapsed by default — tap the chevron to reveal
            the full list of panel options. */}
        <section className="overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-lg backdrop-blur-xl">
          <h2 className="px-4 pt-4 text-xs font-bold uppercase tracking-wide text-kaam-muted">
            Panel
          </h2>

          <button
            type="button"
            onClick={() => setPanelListOpen((open) => !open)}
            disabled={!canOpenPanelList}
            aria-expanded={panelListOpen}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-start disabled:cursor-default"
          >
            <span className="min-w-0">
              {panelQuery.isLoading ? (
                <span className="text-sm text-kaam-muted">Loading panels…</span>
              ) : selectedPanel ? (
                <span className="block">
                  <span className="block truncate text-sm font-extrabold text-kaam-navy">
                    {panelOptionLabel(selectedPanel)}
                  </span>
                  <span className="text-[11px] text-kaam-muted">{panelCount} panels needed</span>
                </span>
              ) : (
                <span className="text-sm text-kaam-muted">No panels are available right now.</span>
              )}
            </span>
            {canOpenPanelList ? (
              <ChevronDown
                size={18}
                strokeWidth={2.5}
                className={cn(
                  'shrink-0 text-kaam-navy transition-transform duration-200',
                  panelListOpen && 'rotate-180'
                )}
                aria-hidden
              />
            ) : null}
          </button>

          <AnimatePresence initial={false}>
            {panelListOpen && canOpenPanelList ? (
              <motion.div
                key="panel-options"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-2 border-t border-white/50 p-4 pt-3">
                  {panelProducts.slice(0, 8).map((product) => {
                    const active = selectedPanel?.id === product.id;
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          commit(orientation, product);
                          setPanelListOpen(false);
                        }}
                        aria-pressed={active}
                        className={cn(
                          'flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-start transition-colors',
                          active
                            ? 'border-kaam-amber bg-kaam-yellow/10'
                            : 'border-kaam-line bg-white hover:border-kaam-amber'
                        )}
                      >
                        <span className="text-sm font-extrabold text-kaam-navy">
                          {panelOptionLabel(product)}
                        </span>
                        <span className="text-[11px] text-kaam-muted">
                          {calculatePanelCount(selectedPVSizeKW, extractPanelWattage(product))} panels
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>
      </div>
    </WizardShell>
  );
};
