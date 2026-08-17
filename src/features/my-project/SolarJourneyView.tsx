'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck, ClipboardList, FileText, HardHat, Inbox } from 'lucide-react';
import { journeyApi } from '@/services/browser';
import { useAuthStore } from '@/store/useAuthStore';
import { formatSurveyReference } from '@/services/journey.api';
import { SURVEY_MILESTONE_DEFINITIONS, type SurveyMilestone } from '@/types/survey.types';
import { getSolarJourneyStepState } from '@/contracts/solarJourneyMilestones';
import {
  resolveSurveyLifecycle,
  resolveSurveyMilestone,
  surveyMilestoneMeta
} from '@/utils/surveyMilestones';
import type { SurveyBookingStatus } from '@/services/journey.api';
import { Screen } from '@/components/ui/Screen';
import { routes } from '@/constants/routes';
import { cn } from '@/lib/cn';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/survey/MySolarJourneyScreen.tsx.
 *
 * Milestone resolution, step state and tones all come from the ported
 * `surveyMilestones` utils and the shared milestone contract — this component
 * only renders them.
 */
const timelineIcons: Record<SurveyMilestone, typeof Inbox> = {
  request_received: Inbox,
  survey_scheduled: CalendarCheck,
  survey_completed: ClipboardList,
  quotation_shared: FileText,
  installation_completed: HardHat
};

/** Ported verbatim from MySolarJourneyScreen.tsx. */
const cancellableStatuses: SurveyBookingStatus[] = [
  'pending',
  'confirmed',
  'assigned',
  'scheduled',
  'survey_scheduled'
];

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-PK', { dateStyle: 'medium' }) : '—';

export const SolarJourneyView = ({ bookingId }: { bookingId: string }) => {
  const queryClient = useQueryClient();
  const userId = useAuthStore((state) => state.session?.user.id) ?? '';
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const bookingQuery = useQuery({
    queryKey: ['survey-booking', bookingId],
    queryFn: () => journeyApi.getSurveyBooking(bookingId)
  });

  const booking = bookingQuery.data;

  if (bookingQuery.isLoading) {
    return (
      <Screen>
        <div className="h-64 animate-pulse rounded-xl2 border border-kaam-line bg-kaam-card" />
      </Screen>
    );
  }

  if (!booking) {
    return (
      <Screen width="narrow">
        <div className="rounded-xl2 border border-kaam-line bg-kaam-card p-8 text-center">
          <h1 className="text-lg font-extrabold text-kaam-navy">Booking not found</h1>
          <p className="mt-2 text-sm text-kaam-muted">
            We could not load this survey booking.
          </p>
          <Link
            href={routes.myProject()}
            className="mt-6 inline-flex h-11 items-center rounded-2xl border border-kaam-line bg-white px-5 text-sm font-extrabold text-kaam-navy hover:border-kaam-amber"
          >
            Go Back
          </Link>
        </div>
      </Screen>
    );
  }

  const milestone = resolveSurveyMilestone(booking.current_milestone, booking.status);
  const lifecycle = resolveSurveyLifecycle(
    booking.journey_status,
    booking.current_milestone,
    booking.status
  );
  const current = surveyMilestoneMeta[lifecycle === 'active' ? milestone : lifecycle];
  const isCancelled = lifecycle === 'cancelled';
  const canCancel = cancellableStatuses.includes(booking.status);

  const confirmCancellation = async () => {
    setCancelling(true);
    setCancelError(null);
    try {
      const result = await journeyApi.cancelSurveyBooking({
        bookingId: booking.id,
        userId,
        cancellationReason: cancelReason.trim() || 'Cancelled by customer'
      });
      if (!result.success) {
        setCancelError(result.message);
        return;
      }
      setCancelOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['survey-booking', booking.id] });
      await queryClient.invalidateQueries({ queryKey: ['active-survey-journey'] });
    } catch (reason) {
      setCancelError(reason instanceof Error ? reason.message : 'Unable to cancel this booking.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Screen>
      <h1 className="text-2xl font-extrabold text-kaam-navy">My Solar Journey</h1>
      <p className="mt-1 text-sm text-kaam-muted">
        Reference {formatSurveyReference(booking)}
      </p>

      <section
        className="mt-5 rounded-xl2 border p-5"
        style={{ borderColor: `${current.tone}33`, backgroundColor: `${current.tone}0F` }}
      >
        <p className="text-sm font-extrabold" style={{ color: current.tone }}>
          {current.title}
        </p>
        <p className="mt-1 text-xs text-kaam-muted">{current.detail}</p>
      </section>

      {isCancelled ? (
        <section className="mt-4 rounded-xl2 border border-kaam-line bg-kaam-card p-5">
          <p className="text-xs text-kaam-muted">
            Reason: {booking.cancellation_reason || 'Not provided'}
          </p>
          {booking.cancellation_note ? (
            <p className="text-xs text-kaam-muted">Note: {booking.cancellation_note}</p>
          ) : null}
          <p className="text-xs text-kaam-muted">
            Cancelled on: {formatDate(booking.cancelled_at)}
          </p>
          <Link
            href={routes.bookSurvey()}
            className="mt-4 inline-flex h-11 items-center rounded-2xl bg-kaam-yellow px-5 text-sm font-extrabold text-kaam-navy hover:bg-kaam-amber"
          >
            Book a New Survey
          </Link>
        </section>
      ) : null}

      <h2 className="mt-8 mb-3 text-sm font-extrabold text-kaam-navy">Journey Progress</h2>
      <ol className="overflow-hidden rounded-xl2 border border-kaam-line bg-kaam-card p-5">
        {SURVEY_MILESTONE_DEFINITIONS.map((item, index) => {
          const Icon = timelineIcons[item.key];
          const state = getSolarJourneyStepState(milestone, lifecycle, index);
          const active = state === 'active';
          const complete = state === 'completed';
          const tone = complete ? '#168A4A' : active ? surveyMilestoneMeta[item.key].tone : '#B7BFC9';
          const isLast = index === SURVEY_MILESTONE_DEFINITIONS.length - 1;

          return (
            <li key={item.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: tone }}
                >
                  <Icon size={14} className="text-white" strokeWidth={2.4} aria-hidden />
                </span>
                {!isLast ? (
                  <span
                    className="w-0.5 flex-1"
                    style={{ backgroundColor: complete ? '#A7D8BB' : '#E2E6EA' }}
                  />
                ) : null}
              </div>

              <div className={cn('min-w-0 flex-1', !isLast && 'pb-6')}>
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={cn(
                      'text-sm',
                      active || complete
                        ? 'font-extrabold text-kaam-navy'
                        : 'font-semibold text-kaam-muted'
                    )}
                  >
                    {item.label}
                  </p>
                  <span
                    className="rounded-md px-2 py-0.5 text-[10px] font-extrabold"
                    style={{ color: tone, backgroundColor: `${tone}14` }}
                  >
                    {complete ? 'Completed' : active ? 'In Progress' : 'Pending'}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-kaam-muted">{item.customerDescription}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {canCancel && !isCancelled ? (
        <div className="mt-6">
          {cancelOpen ? (
            <div className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
              <h3 className="text-sm font-extrabold text-kaam-navy">Cancel this survey?</h3>
              <p className="mt-1 text-xs text-kaam-muted">
                Tell us why so we can improve. You can book again any time.
              </p>
              <textarea
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                rows={3}
                placeholder="Reason (optional)"
                aria-label="Cancellation reason"
                className="mt-3 w-full rounded-xl border border-kaam-line bg-white p-3 text-sm text-kaam-navy placeholder:text-kaam-muted"
              />
              {cancelError ? (
                <p className="mt-2 text-xs font-bold text-kaam-red" role="alert">
                  {cancelError}
                </p>
              ) : null}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => void confirmCancellation()}
                  className="h-11 flex-1 rounded-2xl bg-kaam-red text-sm font-extrabold text-white disabled:opacity-50"
                >
                  {cancelling ? 'Cancelling…' : 'Confirm cancellation'}
                </button>
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => setCancelOpen(false)}
                  className="h-11 rounded-2xl border border-kaam-line bg-white px-5 text-sm font-extrabold text-kaam-navy"
                >
                  Keep booking
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCancelOpen(true)}
              className="text-xs font-extrabold text-kaam-red hover:underline"
            >
              Cancel this survey
            </button>
          )}
        </div>
      ) : null}
    </Screen>
  );
};
