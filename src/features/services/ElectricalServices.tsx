'use client';

import Link from 'next/link';
import { Activity, ChevronRight, Grid3X3, Zap, type LucideIcon } from 'lucide-react';
import { Screen } from '@/components/ui/Screen';
import { routes, type ElectricalServiceType } from '@/constants/routes';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/services/ElectricalWorkServicesScreen.tsx.
 * Same three services, titles, descriptions and icons.
 */
export const electricalServices: Array<{
  title: string;
  description: string;
  type: ElectricalServiceType;
  Icon: LucideIcon;
}> = [
  {
    title: 'Load Distribution',
    description: 'Balance electrical load safely across your system.',
    type: 'load_distribution',
    Icon: Grid3X3
  },
  {
    title: 'Single Phase to 3 Phase Wiring',
    description: 'Upgrade wiring support for higher load requirements.',
    type: 'single_phase_to_3_phase_wiring',
    Icon: Zap
  },
  {
    title: 'Diagnostic Services',
    description: 'Identify wiring faults, load issues, and safety risks.',
    type: 'diagnostic_services',
    Icon: Activity
  }
];

export const ElectricalServices = () => (
  <Screen width="narrow">
    <h1 className="text-2xl font-extrabold text-kaam-navy">Electrical Work</h1>
    <p className="mt-1 text-sm text-kaam-muted">
      Licensed electricians for load distribution, wiring upgrades and diagnostics.
    </p>

    <div className="mt-6 flex flex-col gap-3">
      {electricalServices.map(({ title, description, type, Icon }) => (
        <Link
          key={type}
          href={routes.electricalBooking({ selectedService: type })}
          className="flex items-center gap-4 rounded-xl2 border border-kaam-line bg-kaam-card p-5 transition-colors hover:border-kaam-amber"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-kaam-yellow/20">
            <Icon size={19} className="text-[#B07800]" strokeWidth={2} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-extrabold text-kaam-navy">{title}</span>
            <span className="block text-xs text-kaam-muted">{description}</span>
          </span>
          <ChevronRight size={18} className="shrink-0 text-kaam-muted rtl:rotate-180" aria-hidden />
        </Link>
      ))}
    </div>
  </Screen>
);
