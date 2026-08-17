'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { ApplianceRow } from '@/features/design/ApplianceRow';
import type { Appliance } from '@/types/system.types';
import { calculateLoadKw } from '@/utils/calculations';
import { routes } from '@/constants/routes';
import { useBatteryToolStore } from './useBatteryToolStore';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/solar-tools/BatterySizeToolScreen.tsx.
 *
 * Its own local appliance list, deliberately independent of `useSystemStore`
 * (see useBatteryToolStore.ts). "More appliances" is an always-visible second
 * group here rather than a modal, matching the pattern used across the wizard.
 */
const starterAppliances: Appliance[] = [
  { id: 'lights', name: 'LED Bulbs', watts: 12, quantity: 0, hours: 1 },
  { id: 'fans', name: 'Fans', watts: 80, quantity: 0, hours: 1 },
  { id: 'fridge', name: 'Refrigerators', watts: 200, quantity: 0, hours: 1 },
  { id: 'washing', name: 'Washing Machine', watts: 500, quantity: 0, hours: 1 },
  { id: 'ac1TonInverter', name: 'AC 1 Ton (Inverter)', watts: 900, quantity: 0, hours: 1 },
  { id: 'ac15TonInverter', name: 'AC 1.5 Ton (Inverter)', watts: 1200, quantity: 0, hours: 1 },
  { id: 'ac2TonInverter', name: 'AC 2 Ton (Inverter)', watts: 1800, quantity: 0, hours: 1 }
];

const extraAppliances: Appliance[] = [
  { id: 'tv', name: 'TV / LED TV', watts: 120, quantity: 0, hours: 1 },
  { id: 'waterPump', name: 'Water Pump', watts: 750, quantity: 0, hours: 1 },
  { id: 'microwave', name: 'Microwave', watts: 1000, quantity: 0, hours: 1 },
  { id: 'iron', name: 'Iron', watts: 1200, quantity: 0, hours: 1 },
  { id: 'laptop', name: 'Laptop / Computer', watts: 90, quantity: 0, hours: 1 },
  { id: 'router', name: 'WiFi Router', watts: 15, quantity: 0, hours: 1 },
  { id: 'cctv', name: 'CCTV / Security System', watts: 60, quantity: 0, hours: 1 },
  { id: 'other', name: 'Other Appliance', watts: 300, quantity: 0, hours: 1 }
];

const essentials = ['lights', 'fans', 'fridge', 'washing'];
const airConditioners = ['ac1TonInverter', 'ac15TonInverter', 'ac2TonInverter'];

export const BatterySizeTool = () => {
  const router = useRouter();
  const setRunningLoad = useBatteryToolStore((state) => state.setRunningLoad);
  const [appliances, setAppliances] = useState([...starterAppliances, ...extraAppliances]);
  const [error, setError] = useState('');

  const loadKw = useMemo(() => calculateLoadKw(appliances), [appliances]);
  const selectedAppliances = useMemo(
    () => appliances.filter((item) => item.quantity > 0),
    [appliances]
  );

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

  const goToRunningLoad = () => {
    if (selectedAppliances.length === 0) {
      setError('Please select at least one appliance.');
      return;
    }
    setRunningLoad({
      selectedAppliances,
      totalBackupWatts: Math.round(loadKw * 1000)
    });
    router.push(routes.batteryRunningLoad());
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
      <h1 className="text-2xl font-extrabold text-kaam-navy">Battery Size Tool</h1>
      <p className="mt-1 text-sm text-kaam-muted">Which appliances do you want on backup?</p>

      <div className="mt-6 flex flex-col gap-5">
        {renderGroup('ESSENTIALS', essentials)}
        {renderGroup('AIR CONDITIONERS', airConditioners)}
        {renderGroup(
          'MORE APPLIANCES',
          extraAppliances.map((item) => item.id)
        )}

        {error ? <p className="text-xs font-bold text-kaam-red">{error}</p> : null}

        <button
          type="button"
          onClick={goToRunningLoad}
          className="h-12 rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber"
        >
          Continue
        </button>
      </div>
    </Screen>
  );
};
