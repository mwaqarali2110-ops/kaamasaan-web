'use client';

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { Screen } from '@/components/ui/Screen';
import { routes, type ElectricalServiceType } from '@/constants/routes';
import { electricalServices } from './ElectricalServices';

/**
 * Ported from `ElectricalWorkBookingScreen` in
 * kaamasaan-mobile/src/mobile/screens/services/ElectricalWorkServicesScreen.tsx.
 *
 * Mobile passes the service title and description as route params. Here only
 * the service *type* travels in the URL and the copy is looked up from the same
 * list — a URL cannot then carry mismatched or spoofed marketing text.
 */
export const ElectricalBooking = ({
  selectedService
}: {
  selectedService: ElectricalServiceType;
}) => {
  const service = electricalServices.find((entry) => entry.type === selectedService);
  if (!service) notFound();

  return (
    <Screen width="narrow">
      <h1 className="text-2xl font-extrabold text-kaam-navy">{service.title}</h1>
      <p className="mt-1 text-sm text-kaam-muted">{service.description}</p>

      <section className="mt-6 rounded-xl2 border border-kaam-line bg-kaam-card p-5">
        <h2 className="text-sm font-extrabold text-kaam-navy">How it works</h2>
        <ol className="mt-3 flex flex-col gap-3">
          {[
            'Book a free visit and tell us what you need.',
            'A licensed electrician inspects your setup.',
            'You get a clear scope and price before any work starts.'
          ].map((step, index) => (
            <li key={step} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kaam-yellow text-[11px] font-extrabold text-kaam-navy">
                {index + 1}
              </span>
              <span className="text-sm text-kaam-navy">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-4 flex items-start gap-3 rounded-xl2 border border-kaam-line bg-kaam-surface p-4">
        <ShieldCheck size={18} className="mt-0.5 shrink-0 text-kaam-green" aria-hidden />
        <p className="text-xs text-kaam-muted">
          No payment is taken now — the visit is free and the scope is agreed with you first.
        </p>
      </section>

      <Link
        href={routes.bookSurvey({
          bookingContext: 'electrical',
          source: 'electrical_service',
          selectedServiceType: service.type,
          selectedServiceTitle: service.title
        })}
        className="mt-6 inline-flex h-12 items-center justify-center rounded-2xl bg-kaam-yellow px-8 text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber"
      >
        Book Free Visit
      </Link>
    </Screen>
  );
};
