'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check } from 'lucide-react';
import { Screen } from '@/components/ui/Screen';
import { formatMaintenancePrice, getMaintenancePlan } from '@/data/maintenancePlans';
import type { MaintenancePlanId } from '@/types/maintenance.types';
import { routes } from '@/constants/routes';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/services/MaintenancePlanDetailsScreen.tsx.
 *
 * Mobile passes the whole plan object as a route param and falls back to the
 * stored selection. Here only the plan id travels in the URL and the record is
 * looked up from `data/maintenancePlans.ts`, so a URL cannot carry a plan with
 * a price that does not exist.
 */
const planInclusions = [
  'Full panel cleaning and inspection',
  'Thermal scan for hotspots',
  'DC wiring and connector checks',
  'Inverter diagnostics',
  'Written health report after each visit'
];

export const MaintenancePlanDetails = ({ planId }: { planId: string }) => {
  const isKnown = planId === 'essential' || planId === 'standard' || planId === 'premium';
  if (!isKnown) notFound();

  const plan = getMaintenancePlan(planId as MaintenancePlanId);

  return (
    <Screen width="narrow">
      <h1 className="text-2xl font-extrabold text-kaam-navy">{plan.title}</h1>
      <p className="mt-1 text-sm text-kaam-muted">{plan.frequency}</p>

      <section className="mt-5 rounded-xl2 border border-kaam-line bg-kaam-card p-5">
        <p className="text-3xl font-extrabold text-kaam-navy">
          {formatMaintenancePrice(plan.price)}
        </p>
        <p className="text-xs text-kaam-muted">per year</p>

        <ul className="mt-5 flex flex-col gap-3">
          {planInclusions.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-kaam-green/10">
                <Check size={11} className="text-kaam-green" strokeWidth={3} aria-hidden />
              </span>
              <span className="text-sm text-kaam-navy">{item}</span>
            </li>
          ))}
        </ul>

        <Link
          href={routes.maintenanceBooking(plan.planId)}
          className="mt-6 flex h-12 items-center justify-center rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy hover:bg-kaam-amber"
        >
          Book {plan.title}
        </Link>
      </section>
    </Screen>
  );
};
