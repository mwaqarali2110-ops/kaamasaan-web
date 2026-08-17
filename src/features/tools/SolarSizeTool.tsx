'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { ApplianceRow } from '@/features/design/ApplianceRow';
import type { Appliance } from '@/types/system.types';
import { calculateLoadKw, recommendSolarKw } from '@/utils/calculations';
import { formatKw } from '@/utils/formatters';
import { routes } from '@/constants/routes';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/solar-tools/SolarSizeToolScreen.tsx.
 *
 * Deliberately uses its own local appliance list rather than
 * `useSystemStore.appliances` — same as mobile, which keeps this standalone
 * tool from mutating the design-wizard draft. Note the `washing` id here
 * differs from the wizard's `washingMachine`; that mismatch is mobile's own
 * and is preserved rather than "fixed", since the two lists are intentionally
 * independent.
 */
const starterAppliances: Appliance[] = [
  { id: 'lights', name: 'LED Bulbs', watts: 12, quantity: 0, hours: 6 },
  { id: 'fans', name: 'Fans', watts: 80, quantity: 0, hours: 8 },
  { id: 'fridge', name: 'Refrigerators', watts: 200, quantity: 0, hours: 10 },
  { id: 'washing', name: 'Washing Machine', watts: 500, quantity: 0, hours: 1 },
  { id: 'ac1TonInverter', name: 'AC 1 Ton (Inverter)', watts: 900, quantity: 0, hours: 4 },
  { id: 'ac15TonInverter', name: 'AC 1.5 Ton (Inverter)', watts: 1200, quantity: 0, hours: 4 },
  { id: 'ac2TonInverter', name: 'AC 2 Ton (Inverter)', watts: 1800, quantity: 0, hours: 4 }
];

const essentials = ['lights', 'fans', 'fridge', 'washing'];
const airConditioners = ['ac1TonInverter', 'ac15TonInverter', 'ac2TonInverter'];

export const SolarSizeTool = () => {
  const router = useRouter();
  const [appliances, setAppliances] = useState(starterAppliances);
  const [error, setError] = useState('');

  const loadKw = useMemo(() => calculateLoadKw(appliances), [appliances]);
  const systemKw = useMemo(
    () => (loadKw > 0 ? recommendSolarKw(appliances) : 0),
    [appliances, loadKw]
  );
  const hasSelected = appliances.some((item) => Number(item.quantity) > 0);

  const stepQuantity = (id: string, delta: -1 | 1) => {
    setAppliances((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.min(20, Math.max(0, item.quantity + delta)) }
          : item
      )
    );
    if (error) setError('');
  };

  const calculate = () => {
    if (!hasSelected) {
      setError('Please select at least one appliance.');
      return;
    }
    router.push(routes.recommendedSolarSize({ loadKw, systemKw }));
  };

  const renderGroup = (title: string, ids: string[]) => (
    <div>
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wide text-kaam-muted">
        {title}
      </h3>
      <div className="overflow-hidden rounded-xl2 border border-kaam-line bg-kaam-card">
        {appliances
          .filter((item) => ids.includes(item.id))
          .map((item, index, filtered) => (
            <ApplianceRow
              key={item.id}
              id={item.id}
              name={item.name}
              watts={item.watts}
              quantity={item.quantity}
              showDivider={index < filtered.length - 1}
              onQuantityStep={(delta) => stepQuantity(item.id, delta)}
            />
          ))}
      </div>
    </div>
  );

  return (
    <Screen width="narrow">
      <h1 className="text-2xl font-extrabold text-kaam-navy">Solar Size Tool</h1>
      <p className="mt-1 text-sm text-kaam-muted">
        Which appliances do you use <span className="text-kaam-amber">during the day?</span>
      </p>

      <div className="mt-6 flex flex-col gap-5">
        {renderGroup('ESSENTIALS', essentials)}
        {renderGroup('AIR CONDITIONERS', airConditioners)}

        {loadKw > 0 ? (
          <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <p className="text-xl font-extrabold text-kaam-navy">{loadKw.toFixed(2)} kW</p>
                <p className="text-[11px] text-kaam-muted">Running load</p>
              </div>
              <div>
                <p className="text-xl font-extrabold text-kaam-navy">{formatKw(systemKw)}</p>
                <p className="text-[11px] text-kaam-muted">Recommended size</p>
              </div>
            </div>
          </section>
        ) : null}

        {error ? <p className="text-xs font-bold text-kaam-red">{error}</p> : null}

        <button
          type="button"
          onClick={calculate}
          disabled={!hasSelected}
          className="h-12 rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber disabled:opacity-50"
        >
          Calculate
        </button>
      </div>
    </Screen>
  );
};
