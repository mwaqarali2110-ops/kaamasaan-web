'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  CalendarCheck2,
  MapPin,
  Phone,
  ShieldCheck,
  User,
  type LucideIcon
} from 'lucide-react';
import { surveyBookingSchema, type SurveyBookingForm as SurveyBookingValues } from '@/schemas/survey.schema';
import { systemApi, notificationsApi } from '@/services/browser';
import { saveLocalActiveSurveyBooking } from '@/services/journey.api';
import { useSystemStore, type BookingContext } from '@/store/useSystemStore';
import { useAuthStore } from '@/store/useAuthStore';
import { activeSurveyJourneyQueryKey } from '@/hooks/useSurveyJourney';
import {
  latestWelcomeNotificationQueryKey,
  notificationsQueryKey,
  unreadNotificationsQueryKey
} from '@/hooks/useNotifications';
import { buildPackagePromoContext, promoContextSignature } from '@/utils/promo';
import {
  createCustomSystemSnapshot,
  createSelectedPackageSnapshot
} from '@/utils/surveyPackageSnapshot';
import { formatPkr } from '@/utils/formatters';
import { Screen } from '@/components/ui/Screen';
import { routes, type ElectricalServiceType } from '@/constants/routes';
import { cn } from '@/lib/cn';
import { SurveyDatePicker, formatDateKey, formatDisplayDate } from './SurveyDatePicker';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/survey/BookSurveyScreen.tsx.
 *
 * The submit payload — service type, snapshot, the whole `notes` JSON blob and
 * the promo pricing block — is reproduced field for field, because it is what
 * the backend and the admin dashboard read. Getting a key wrong here silently
 * degrades an internal tool rather than breaking the app, so it is copied
 * rather than restructured.
 *
 * Idempotency is preserved: the key is generated once per mount and reused on
 * retry, so a double submit cannot create two bookings.
 */
const TEAM_CONFIRMED_TIME_SLOT = 'To be confirmed by team';

const Field = ({
  label,
  Icon,
  error,
  children
}: {
  label: string;
  Icon: LucideIcon;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <span className="text-[12.5px] font-black text-kaam-navy">{label}</span>
    <div
      className={cn(
        'flex min-h-[46px] flex-row items-center gap-2 rounded-[13px] border bg-[#FFFEFB] px-3',
        'focus-within:border-kaam-amber',
        error ? 'border-kaam-red' : 'border-kaam-line'
      )}
    >
      <Icon size={17} className="shrink-0 text-[#8A6A16]" strokeWidth={2.1} aria-hidden />
      {children}
    </div>
    {error ? (
      <p className="text-[10.5px] font-bold text-kaam-red" role="alert">
        {error}
      </p>
    ) : null}
  </div>
);

export const BookSurveyForm = ({
  bookingContext: contextParam,
  packageId,
  selectedServiceType,
  selectedServiceTitle
}: {
  bookingContext?: BookingContext;
  packageId?: string;
  selectedServiceType?: ElectricalServiceType;
  selectedServiceTitle?: string;
}) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const session = useAuthStore((state) => state.session);
  const profile = useAuthStore((state) => state.profile);

  const storedBookingContext = useSystemStore((state) => state.bookingContext);
  const startBooking = useSystemStore((state) => state.startBooking);
  const getSummary = useSystemStore((state) => state.getSummary);
  const selectedRecommendedPackageId = useSystemStore(
    (state) => state.selectedRecommendedPackageId
  );
  const selectedRecommendedPackage = useSystemStore((state) => state.selectedRecommendedPackage);
  const customSystemBuilder = useSystemStore((state) => state.customSystemBuilder);
  const cleaningEstimate = useSystemStore((state) => state.cleaningEstimate);
  const installationDetails = useSystemStore((state) => state.installationDetails);
  const promo = useSystemStore((state) => state.promo);
  const applyPromo = useSystemStore((state) => state.applyPromo);
  const clearCleaningEstimate = useSystemStore((state) => state.clearCleaningEstimate);
  const clearInstallationDetails = useSystemStore((state) => state.clearInstallationDetails);
  const resetCustomSystemBuilder = useSystemStore((state) => state.resetCustomSystemBuilder);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateError, setDateError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const bookingIdempotencyKey = useRef<string | null>(null);

  const bookingContext: BookingContext = contextParam ?? storedBookingContext ?? 'general';
  const isCleaningBooking = bookingContext === 'cleaning';
  const isInstallationBooking = bookingContext === 'installation';
  const isPackageBooking = bookingContext === 'solar_package';
  const isCustomSystemBooking = bookingContext === 'custom_system';
  const isElectricalBooking = bookingContext === 'electrical';

  const mutation = useMutation({ mutationFn: systemApi.submitSurveyBooking });

  const form = useForm<SurveyBookingValues>({
    resolver: zodResolver(surveyBookingSchema),
    defaultValues: { name: '', phone: '', city: '', address: '' }
  });

  useEffect(() => {
    startBooking(bookingContext);
  }, [bookingContext, startBooking]);

  // Prefill from the customer profile, as mobile does once it loads.
  const { reset, getValues } = form;
  useEffect(() => {
    if (!profile) return;
    reset({
      name: profile.full_name ?? '',
      phone: profile.phone ?? '',
      city: profile.city ?? '',
      address: getValues('address')
    });
  }, [getValues, profile, reset]);

  const systemSummary = getSummary();
  const packageSummary = selectedRecommendedPackage;
  const promoContext = useMemo(
    () => buildPackagePromoContext(packageSummary),
    [packageSummary]
  );
  const hasAppliedPackagePromo = Boolean(
    promoContext &&
      promo.status === 'applied' &&
      promo.appliedPackageId === promoContext.packageId &&
      promo.appliedContextSignature === promoContextSignature(promoContext)
  );

  const customSystemSnapshot = useMemo(
    () => createCustomSystemSnapshot(customSystemBuilder),
    [customSystemBuilder]
  );

  const handleValidSubmit = async (values: SurveyBookingValues) => {
    setSubmitError('');

    if (!selectedDate) {
      setDateError('Please select a survey date.');
      return;
    }
    setDateError('');

    if (!session?.user.id) {
      router.replace(routes.login({ redirectTo: routes.bookSurvey({ bookingContext }) }));
      return;
    }
    if (isSubmitted || mutation.isPending) return;
    setIsSubmitted(true);

    bookingIdempotencyKey.current ??= `survey-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

    try {
      const serviceType = isInstallationBooking
        ? 'installation'
        : isCleaningBooking
          ? 'cleaning'
          : isElectricalBooking
            ? 'electrical'
            : isPackageBooking || isCustomSystemBooking
              ? 'solar_package'
              : 'solar_survey';

      const selectedPackageSnapshot = isCustomSystemBooking
        ? customSystemSnapshot
        : isPackageBooking && packageSummary
          ? createSelectedPackageSnapshot({
              selectedPackage: packageSummary,
              grossTotal: promoContext?.originalTotal ?? packageSummary.totalPrice ?? 0,
              discountAmount: hasAppliedPackagePromo ? promo.discountAmount : 0,
              finalTotal: hasAppliedPackagePromo
                ? promo.finalTotal
                : (promoContext?.originalTotal ?? packageSummary.totalPrice ?? 0),
              promoCode: hasAppliedPackagePromo ? promo.appliedCode : null
            })
          : null;

      if (isCustomSystemBooking && !selectedPackageSnapshot) {
        throw new Error(
          'Your custom system is incomplete. Please return and select all components.'
        );
      }

      const result = await mutation.mutateAsync({
        userId: session.user.id,
        idempotencyKey: bookingIdempotencyKey.current,
        fullName: values.name,
        phone: values.phone,
        city: values.city,
        address: values.address,
        preferredDate: formatDateKey(selectedDate),
        preferredTimeSlot: TEAM_CONFIRMED_TIME_SLOT,
        customerEmail: session.user.email ?? null,
        serviceType,
        selectedPackageSnapshot,
        notes: JSON.stringify({
          // Mobile sends 'mobile-app'; this distinguishes web bookings in the
          // admin dashboard without changing the shape of the payload.
          source: 'web-app',
          selectedRecommendedPackageId: selectedRecommendedPackageId ?? packageId ?? null,
          selectedRecommendedPackage,
          customSystem: isCustomSystemBooking
            ? {
                ...customSystemSnapshot,
                selectedComponentOrder: customSystemBuilder.selectedComponentOrder,
                sourceComponent: customSystemBuilder.sourceComponent
              }
            : null,
          bookingContext,
          systemSummary,
          serviceType,
          serviceSubType: isElectricalBooking ? (selectedServiceType ?? null) : null,
          selectedServiceTitle: isInstallationBooking
            ? 'Solar Panel Installation'
            : isCleaningBooking
              ? 'Solar Panel Cleaning'
              : isPackageBooking
                ? (packageSummary?.packageName ??
                  systemSummary.packageName ??
                  'Selected Solar Package')
                : isCustomSystemBooking
                  ? 'Custom Solar System'
                  : (selectedServiceTitle ?? null),
          cleaning: isCleaningBooking ? cleaningEstimate : null,
          installation: isInstallationBooking ? installationDetails : null,
          solarPackage:
            isPackageBooking && packageSummary
              ? {
                  ...packageSummary,
                  originalEstimatedAmount:
                    promoContext?.originalTotal ?? packageSummary.totalPrice,
                  promo: hasAppliedPackagePromo
                    ? {
                        promoId: promo.promoId,
                        code: promo.appliedCode,
                        discountType: promo.discountType,
                        appliesTo: promo.appliesTo,
                        eligibleAmount: promo.eligibleAmount,
                        discountAmount: promo.discountAmount
                      }
                    : null,
                  finalEstimatedAmount: hasAppliedPackagePromo
                    ? promo.finalTotal
                    : (promoContext?.originalTotal ?? packageSummary.totalPrice)
                }
              : null
        }),
        solarPackagePricing:
          hasAppliedPackagePromo && promoContext && promo.appliedCode
            ? { context: promoContext, promoCode: promo.appliedCode }
            : null
      });

      if (result.booking) {
        await saveLocalActiveSurveyBooking(result.booking);
        try {
          await notificationsApi.createSurveyWelcomeNotificationOnce(result.booking);
        } catch (notificationError) {
          console.error('Survey welcome notification creation failed:', notificationError);
        }
        queryClient.setQueryData(activeSurveyJourneyQueryKey(session.user.id), result.booking);
        queryClient.setQueryData(['survey-bookings', 'detail', result.booking.id], result.booking);
      }

      await queryClient.invalidateQueries({
        queryKey: activeSurveyJourneyQueryKey(session.user.id)
      });
      await queryClient.invalidateQueries({ queryKey: notificationsQueryKey(session.user.id) });
      await queryClient.invalidateQueries({
        queryKey: unreadNotificationsQueryKey(session.user.id)
      });
      await queryClient.invalidateQueries({
        queryKey: latestWelcomeNotificationQueryKey(session.user.id)
      });

      if (isCleaningBooking) clearCleaningEstimate();
      if (isInstallationBooking) clearInstallationDetails();
      if (isCustomSystemBooking) resetCustomSystemBuilder();

      router.replace(routes.surveyConfirmation(result.bookingId));
    } catch (reason) {
      // Re-apply the promo so the customer does not lose their discount on retry.
      if (hasAppliedPackagePromo && promoContext && promo.appliedCode) {
        await applyPromo(promoContext, promo.appliedCode);
      }
      setSubmitError(
        reason instanceof Error ? reason.message : 'Unable to submit your booking. Please try again.'
      );
      setIsSubmitted(false);
    }
  };

  /*
   * `form.handleSubmit(cb)` is invoked here, in the event, rather than during
   * render. Calling it in the component body trips react-hooks/refs: the
   * callback reads `bookingIdempotencyKey.current`, and handing a ref-reading
   * closure to another function at render time is exactly the pattern that
   * rule guards against.
   */
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void form.handleSubmit(handleValidSubmit)(event);
  };

  const contextLabel = isCleaningBooking
    ? 'Solar Panel Cleaning'
    : isInstallationBooking
      ? 'Solar Panel Installation'
      : isElectricalBooking
        ? (selectedServiceTitle ?? 'Electrical Work')
        : isCustomSystemBooking
          ? 'Custom Solar System'
          : isPackageBooking
            ? (packageSummary?.packageName ?? 'Selected Solar Package')
            : null;

  return (
    <Screen>
      <h1 className="text-2xl font-extrabold text-kaam-navy">Book Survey</h1>

      <form onSubmit={submit} noValidate className="mt-5 lg:grid lg:grid-cols-[1fr_340px] lg:items-start lg:gap-8">
        <div className="flex flex-col gap-5">
          <section className="flex items-start gap-4 rounded-xl2 border border-kaam-line bg-kaam-card p-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-kaam-yellow/20">
              <CalendarCheck2 size={26} className="text-[#F5A400]" strokeWidth={2} aria-hidden />
            </span>
            <div>
              <h2 className="text-base font-extrabold text-kaam-navy">
                Let&apos;s schedule your survey
              </h2>
              <p className="mt-1 text-sm text-kaam-muted">
                Choose a date and provide your contact details. Our team will call to confirm the
                visit time.
              </p>
            </div>
          </section>

          <div>
            <h2 className="mb-2 text-sm font-extrabold text-kaam-navy">Preferred date</h2>
            <SurveyDatePicker
              selectedDate={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setDateError('');
              }}
              error={dateError}
            />
            {selectedDate ? (
              <p className="mt-2 text-xs font-semibold text-kaam-navy">
                {formatDisplayDate(selectedDate)} · {TEAM_CONFIRMED_TIME_SLOT}
              </p>
            ) : null}
          </div>

          <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
            <h2 className="text-sm font-extrabold text-kaam-navy">Your details</h2>
            <div className="mt-4 flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-4">
              <Controller
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <Field label="Full name" Icon={User} error={fieldState.error?.message}>
                    <input
                      {...field}
                      autoComplete="name"
                      placeholder="Your full name"
                      className="min-w-0 flex-1 bg-transparent text-[13.5px] font-semibold text-kaam-navy outline-none placeholder:text-[#9CA3AF]"
                    />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="phone"
                render={({ field, fieldState }) => (
                  <Field label="Phone" Icon={Phone} error={fieldState.error?.message}>
                    <input
                      {...field}
                      type="tel"
                      autoComplete="tel"
                      placeholder="03XXXXXXXXX"
                      className="min-w-0 flex-1 bg-transparent text-[13.5px] font-semibold text-kaam-navy outline-none placeholder:text-[#9CA3AF]"
                    />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="city"
                render={({ field, fieldState }) => (
                  <Field label="City" Icon={Building2} error={fieldState.error?.message}>
                    <input
                      {...field}
                      autoComplete="address-level2"
                      placeholder="Lahore"
                      className="min-w-0 flex-1 bg-transparent text-[13.5px] font-semibold text-kaam-navy outline-none placeholder:text-[#9CA3AF]"
                    />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="address"
                render={({ field, fieldState }) => (
                  <Field label="Address" Icon={MapPin} error={fieldState.error?.message}>
                    <textarea
                      {...field}
                      rows={2}
                      autoComplete="street-address"
                      placeholder="House, street, area"
                      className="min-w-0 flex-1 resize-none bg-transparent py-3 text-[13.5px] font-semibold text-kaam-navy outline-none placeholder:text-[#9CA3AF]"
                    />
                  </Field>
                )}
              />
            </div>
          </section>
        </div>

        <aside className="mt-6 flex flex-col gap-4 lg:sticky lg:top-24 lg:mt-0">
          {contextLabel ? (
            <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-kaam-muted">
                Booking for
              </p>
              <p className="mt-1 text-sm font-extrabold text-kaam-navy">{contextLabel}</p>

              {isPackageBooking && packageSummary ? (
                <p className="mt-2 text-sm font-extrabold text-kaam-navy">
                  {formatPkr(
                    hasAppliedPackagePromo ? promo.finalTotal : packageSummary.totalPrice
                  )}
                  {hasAppliedPackagePromo ? (
                    <span className="ms-2 text-xs font-semibold text-kaam-green">
                      {promo.appliedCode} applied
                    </span>
                  ) : null}
                </p>
              ) : null}

              {isCleaningBooking && cleaningEstimate ? (
                <p className="mt-2 text-sm font-extrabold text-kaam-navy">
                  {formatPkr(cleaningEstimate.estimatedAmount)}
                </p>
              ) : null}
            </section>
          ) : null}

          <section className="flex items-start gap-3 rounded-xl2 border border-kaam-line bg-kaam-surface p-4">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-kaam-green" aria-hidden />
            <p className="text-xs text-kaam-muted">
              Free site survey. No payment is taken now — our team confirms everything with you
              first.
            </p>
          </section>

          {submitError ? (
            <p className="rounded-xl2 bg-[#FEF2F2] p-3 text-xs font-bold text-[#B42318]" role="alert">
              {submitError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={mutation.isPending || isSubmitted}
            className="h-12 rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber disabled:opacity-50"
          >
            {mutation.isPending || isSubmitted ? 'Submitting…' : 'Confirm Free Survey'}
          </button>
        </aside>
      </form>
    </Screen>
  );
};
