'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check, ShieldCheck } from 'lucide-react';
import { Screen } from '@/components/ui/Screen';
import { useActiveSurveyJourney } from '@/hooks/useSurveyJourney';
import { useMaintenanceBookingStore } from '@/store/useMaintenanceBookingStore';
import { getMaintenancePlan, formatMaintenancePrice } from '@/data/maintenancePlans';
import { routes } from '@/constants/routes';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/services/PreventiveMaintenanceScreen.tsx.
 *
 * This is the real bookable entry point: it selects the **Premium Care** plan
 * from `data/maintenancePlans.ts` and pushes into the maintenance booking form.
 *
 * Mobile's guard is preserved — if the customer already has an active solar
 * journey, booking is blocked and an explanation is shown instead, so
 * maintenance is not sold to someone mid-installation.
 */
const benefits = [
  'Thermal inspection of every panel',
  'DC wiring and MC4 connector checks',
  'Inverter diagnostics and firmware review',
  'Battery health and performance report'
];

export const PreventiveMaintenance = () => {
  const router = useRouter();
  const activeJourney = useActiveSurveyJourney();
  const setSelectedPlan = useMaintenanceBookingStore((state) => state.setSelectedPlan);
  const [blocked, setBlocked] = useState(false);

  const plan = getMaintenancePlan('premium');

  const bookPremium = async () => {
    // Mobile refetches before deciding, so a stale cache cannot let a booking
    // through while an installation is already in flight.
    const active = activeJourney.data ?? (await activeJourney.refetch()).data;
    if (active) {
      setBlocked(true);
      return;
    }
    setSelectedPlan(plan);
    router.push(routes.maintenanceBooking(plan.planId));
  };

  return (
    <Screen>
      <div className="relative h-48 overflow-hidden rounded-xl2 border border-kaam-line md:h-60">
        <Image
          src="/assets/home/solar-care.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute bottom-0 p-6">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-kaam-yellow">
            Solar Care
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-white">Preventive Maintenance</h1>
        </div>
      </div>

      <div className="mt-6 lg:grid lg:grid-cols-[1fr_340px] lg:items-start lg:gap-8">
        <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
          <h2 className="text-sm font-extrabold text-kaam-navy">What&apos;s included</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {benefits.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-kaam-green/10">
                  <Check size={11} className="text-kaam-green" strokeWidth={3} aria-hidden />
                </span>
                <span className="text-sm text-kaam-navy">{item}</span>
              </li>
            ))}
          </ul>

          <Link
            href={routes.maintenancePackages()}
            className="mt-5 inline-block text-xs font-extrabold text-kaam-amber hover:underline"
          >
            Compare all maintenance packages
          </Link>
        </section>

        <aside className="mt-6 lg:sticky lg:top-24 lg:mt-0">
          <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-kaam-muted">
              {plan.title}
            </p>
            <p className="mt-1 text-2xl font-extrabold text-kaam-navy">
              {formatMaintenancePrice(plan.price)}
            </p>
            <p className="text-xs text-kaam-muted">{plan.frequency}</p>

            {blocked ? (
              <p
                className="mt-4 rounded-xl bg-[#FFF4D6] p-3 text-xs font-semibold text-[#9A6700]"
                role="status"
              >
                You already have an active solar journey. Our team will arrange maintenance once
                your installation is complete.
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => void bookPremium()}
              disabled={activeJourney.isLoading}
              className="mt-5 h-12 w-full rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber disabled:opacity-50"
            >
              Book {plan.title}
            </button>

            <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-kaam-muted">
              <ShieldCheck size={13} className="text-kaam-green" aria-hidden />
              Certified technicians · Fixed price
            </p>
          </section>
        </aside>
      </div>
    </Screen>
  );
};
