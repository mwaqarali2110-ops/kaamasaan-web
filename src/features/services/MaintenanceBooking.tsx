'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Building2, MapPin, Phone, User, type LucideIcon } from 'lucide-react';
import { Screen } from '@/components/ui/Screen';
import { useMaintenanceBookingStore } from '@/store/useMaintenanceBookingStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getMaintenancePlan, formatMaintenancePrice } from '@/data/maintenancePlans';
import type { MaintenancePlanId } from '@/types/maintenance.types';
import { routes } from '@/constants/routes';
import { SurveyDatePicker, formatDateKey, formatDisplayDate } from '@/features/survey/SurveyDatePicker';
import { cn } from '@/lib/cn';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/services/MaintenanceBookingScreen.tsx.
 *
 * Mobile validates by trimming each field and checking it is non-empty; the
 * same rule applies here. Submission goes through
 * `useMaintenanceBookingStore.createBooking`, which wraps the
 * `create_premium_care_plan` RPC.
 *
 * Deviation: mobile asks for the preferred date as free text. This reuses the
 * survey date picker, so the value is always a valid `YYYY-MM-DD` — the backend
 * expects a date, and a typo previously became one silently.
 */
const Field = ({
  label,
  Icon,
  value,
  onChange,
  placeholder,
  type,
  error
}: {
  label: string;
  Icon: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  error?: boolean;
}) => (
  <label className="flex flex-col gap-1.5">
    <span className="text-[12.5px] font-black text-kaam-navy">{label}</span>
    <span
      className={cn(
        'flex h-[46px] items-center gap-2 rounded-[13px] border bg-[#FFFEFB] px-3 focus-within:border-kaam-amber',
        error ? 'border-kaam-red' : 'border-kaam-line'
      )}
    >
      <Icon size={17} className="shrink-0 text-[#8A6A16]" strokeWidth={2.1} aria-hidden />
      <input
        type={type ?? 'text'}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[13.5px] font-semibold text-kaam-navy outline-none placeholder:text-[#9CA3AF]"
      />
    </span>
  </label>
);

export const MaintenanceBooking = ({ planId }: { planId: string }) => {
  const router = useRouter();
  const profile = useAuthStore((state) => state.profile);
  const createBooking = useMaintenanceBookingStore((state) => state.createBooking);

  const plan =
    planId === 'essential' || planId === 'standard' || planId === 'premium'
      ? getMaintenancePlan(planId as MaintenancePlanId)
      : null;
  if (!plan) notFound();

  const [name, setName] = useState(profile?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [address, setAddress] = useState('');
  const [preferredDate, setPreferredDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const idempotencyKey = useRef<string | null>(null);

  const missing =
    !name.trim() || !phone.trim() || !address.trim() || !city.trim() || !preferredDate;

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (missing) {
      setError('Please complete every field and pick a preferred date.');
      return;
    }
    if (submitting) return;

    setError('');
    setSubmitting(true);
    idempotencyKey.current ??= `maintenance-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

    try {
      const booking = await createBooking(
        {
          customerName: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          preferredDate: formatDateKey(preferredDate!),
          preferredTimeSlot: 'To be confirmed by team',
          notes: notes.trim() || undefined
        },
        idempotencyKey.current
      );
      router.replace(routes.maintenanceBookingConfirmation(booking.id));
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Unable to book maintenance. Please try again.'
      );
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <h1 className="text-2xl font-extrabold text-kaam-navy">Book {plan.title}</h1>
      <p className="mt-1 text-sm text-kaam-muted">
        {formatMaintenancePrice(plan.price)} · {plan.frequency}
      </p>

      <form
        onSubmit={submit}
        noValidate
        className="mt-6 lg:grid lg:grid-cols-[1fr_340px] lg:items-start lg:gap-8"
      >
        <div className="flex flex-col gap-5">
          <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
            <h2 className="text-sm font-extrabold text-kaam-navy">Your details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" Icon={User} value={name} onChange={setName} />
              <Field label="Phone" Icon={Phone} value={phone} onChange={setPhone} type="tel" />
              <Field label="City" Icon={Building2} value={city} onChange={setCity} />
              <Field label="Address" Icon={MapPin} value={address} onChange={setAddress} />
            </div>

            <label className="mt-4 flex flex-col gap-1.5">
              <span className="text-[12.5px] font-black text-kaam-navy">Notes (optional)</span>
              <textarea
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Anything our technician should know"
                className="rounded-[13px] border border-kaam-line bg-[#FFFEFB] p-3 text-[13.5px] font-semibold text-kaam-navy outline-none placeholder:text-[#9CA3AF] focus:border-kaam-amber"
              />
            </label>
          </section>

          <div>
            <h2 className="mb-2 text-sm font-extrabold text-kaam-navy">Preferred date</h2>
            <SurveyDatePicker selectedDate={preferredDate} onSelect={setPreferredDate} />
            {preferredDate ? (
              <p className="mt-2 text-xs font-semibold text-kaam-navy">
                {formatDisplayDate(preferredDate)}
              </p>
            ) : null}
          </div>
        </div>

        <aside className="mt-6 flex flex-col gap-4 lg:sticky lg:top-24 lg:mt-0">
          <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
            <p className="text-xs font-bold uppercase tracking-wide text-kaam-muted">Plan</p>
            <p className="mt-1 text-sm font-extrabold text-kaam-navy">{plan.title}</p>
            <p className="mt-2 text-2xl font-extrabold text-kaam-navy">
              {formatMaintenancePrice(plan.price)}
            </p>
            <p className="text-xs text-kaam-muted">{plan.frequency}</p>
          </section>

          {error ? (
            <p
              className="rounded-xl2 bg-[#FEF2F2] p-3 text-xs font-bold text-[#B42318]"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="h-12 rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber disabled:opacity-50"
          >
            {submitting ? 'Booking…' : 'Confirm Booking'}
          </button>
        </aside>
      </form>
    </Screen>
  );
};
