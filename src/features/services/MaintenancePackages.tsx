'use client';

import Link from 'next/link';
import { Check, ShieldCheck } from 'lucide-react';
import { Screen } from '@/components/ui/Screen';
import { routes } from '@/constants/routes';
import { cn } from '@/lib/cn';
import { maintenancePackages, trustItems } from './maintenanceContent';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/services/MaintenancePackagesScreen.tsx.
 *
 * Mobile's CTA navigates to a general Book Survey without selecting a plan, so
 * this is effectively a pricing page. Same here — see the warning in
 * maintenanceContent.ts about the two conflicting price sets.
 */
export const MaintenancePackages = () => (
  <Screen width="wide">
    <h1 className="text-2xl font-extrabold text-kaam-navy">Maintenance Packages</h1>
    <p className="mt-1 text-sm text-kaam-muted">
      Keep your system generating at full output all year.
    </p>

    <div className="mt-6 grid gap-4 md:grid-cols-3">
      {maintenancePackages.map((pkg) => (
        <section
          key={pkg.id}
          className={cn(
            'flex flex-col rounded-xl2 border bg-kaam-card p-5',
            pkg.recommended ? 'border-kaam-amber shadow-md' : 'border-kaam-line'
          )}
        >
          {pkg.recommended ? (
            <span className="mb-2 inline-flex w-fit rounded-full bg-kaam-yellow px-3 py-1 text-[10px] font-extrabold text-kaam-navy">
              RECOMMENDED
            </span>
          ) : null}

          <h2 className="text-base font-extrabold text-kaam-navy">{pkg.title}</h2>
          <p className="mt-1 text-2xl font-extrabold text-kaam-navy">
            PKR {pkg.price}
            <span className="text-xs font-semibold text-kaam-muted"> / visit</span>
          </p>

          <ul className="mt-4 flex flex-1 flex-col gap-2">
            {pkg.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-kaam-green/10">
                  <Check size={10} className="text-kaam-green" strokeWidth={3} aria-hidden />
                </span>
                <span className="text-xs text-kaam-navy">{feature}</span>
              </li>
            ))}
          </ul>

          <Link
            href={routes.bookSurvey()}
            className={cn(
              'mt-5 flex h-11 items-center justify-center rounded-2xl text-sm font-extrabold transition-colors',
              pkg.recommended
                ? 'bg-kaam-yellow text-kaam-navy hover:bg-kaam-amber'
                : 'border border-kaam-line bg-white text-kaam-navy hover:border-kaam-amber'
            )}
          >
            Book This Package
          </Link>
        </section>
      ))}
    </div>

    <ul className="mt-6 flex flex-wrap gap-4">
      {trustItems.map((item) => (
        <li key={item} className="flex items-center gap-2 text-xs font-semibold text-kaam-muted">
          <ShieldCheck size={15} className="text-kaam-green" aria-hidden />
          {item}
        </li>
      ))}
    </ul>
  </Screen>
);
