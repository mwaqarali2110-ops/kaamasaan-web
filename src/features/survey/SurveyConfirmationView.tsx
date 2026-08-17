'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { formatSurveyReference } from '@/services/journey.api';
import { Screen } from '@/components/ui/Screen';
import { routes } from '@/constants/routes';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/survey/SurveyConfirmationScreen.tsx.
 *
 * Adds a link straight to the journey timeline — on mobile the only action is
 * "Back to Home", but on web the booking now has its own URL worth offering.
 */
export const SurveyConfirmationView = ({ bookingId }: { bookingId?: string }) => (
  <Screen width="narrow">
    <div className="rounded-xl2 border border-kaam-line bg-kaam-card p-8 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ECFDF3]">
        <CheckCircle2 size={32} className="text-kaam-green" strokeWidth={2.2} aria-hidden />
      </span>

      <h1 className="mt-4 text-xl font-extrabold text-kaam-navy">Survey Request Received</h1>
      <p className="mt-2 text-sm text-kaam-muted">
        Thank you for choosing KaamAsaan. Our team will call you shortly to confirm your site
        survey visit.
      </p>

      {bookingId ? (
        <p className="mt-5 inline-block rounded-xl bg-kaam-surface px-4 py-2 text-sm font-extrabold text-kaam-navy">
          Reference: {formatSurveyReference({ id: bookingId })}
        </p>
      ) : null}

      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        {bookingId ? (
          <Link
            href={routes.solarJourney(bookingId)}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-kaam-yellow px-6 text-sm font-extrabold text-kaam-navy hover:bg-kaam-amber"
          >
            Track My Journey
          </Link>
        ) : null}
        <Link
          href={routes.home()}
          className="inline-flex h-12 items-center justify-center rounded-2xl border border-kaam-line bg-white px-6 text-sm font-extrabold text-kaam-navy hover:border-kaam-amber"
        >
          Back to Home
        </Link>
      </div>
    </div>
  </Screen>
);
