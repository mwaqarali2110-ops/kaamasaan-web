'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  Activity,
  CalendarClock,
  CheckCircle2,
  FileText,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  type LucideIcon
} from 'lucide-react';
import { Screen } from '@/components/ui/Screen';
import { useMaintenanceBookingStore } from '@/store/useMaintenanceBookingStore';
import { formatMaintenancePrice } from '@/data/maintenancePlans';
import { openSupportWhatsApp } from '@/services/notifications.api';
import { routes } from '@/constants/routes';

/**
 * The four presentational service screens, grouped because each is a short
 * static page in mobile too:
 *   MaintenanceBookingConfirmationScreen
 *   LiveTrackingScreen
 *   PostServiceHealthReportScreen
 *   SolarCareMembershipScreen
 *
 * Their mobile counterparts carry no data fetching beyond the maintenance
 * store, so they port directly.
 */

const InfoRow = ({ Icon, label, value }: { Icon: LucideIcon; label: string; value: string }) => (
  <div className="flex items-center gap-3 py-2">
    <Icon size={16} className="shrink-0 text-kaam-amber" aria-hidden />
    <span className="flex-1 text-xs text-kaam-muted">{label}</span>
    <span className="text-xs font-extrabold text-kaam-navy">{value}</span>
  </div>
);

/** Ported from MaintenanceBookingConfirmationScreen.tsx. */
export const MaintenanceBookingConfirmation = ({ requestId }: { requestId: string }) => {
  const bookings = useMaintenanceBookingStore((state) => state.bookings);
  const latestBooking = useMaintenanceBookingStore((state) => state.latestBooking);

  const booking = useMemo(
    () => bookings.find((entry) => entry.id === requestId) ?? latestBooking,
    [bookings, latestBooking, requestId]
  );

  return (
    <Screen width="narrow">
      <div className="rounded-xl2 border border-kaam-line bg-kaam-card p-8 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ECFDF3]">
          <CheckCircle2 size={32} className="text-kaam-green" strokeWidth={2.2} aria-hidden />
        </span>
        <h1 className="mt-4 text-xl font-extrabold text-kaam-navy">Maintenance Booked</h1>
        <p className="mt-2 text-sm text-kaam-muted">
          Our team will call you to confirm the visit window.
        </p>

        {booking ? (
          <div className="mt-6 divide-y divide-kaam-line text-start">
            <InfoRow Icon={FileText} label="Reference" value={booking.referenceNumber} />
            <InfoRow Icon={Sparkles} label="Plan" value={booking.plan.title} />
            <InfoRow
              Icon={ShieldCheck}
              label="Amount"
              value={formatMaintenancePrice(booking.plan.price)}
            />
            <InfoRow Icon={CalendarClock} label="Preferred date" value={booking.preferredDate} />
            <InfoRow Icon={MapPin} label="Address" value={booking.address} />
          </div>
        ) : null}

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={routes.premiumCareProgress(booking ? { requestId: booking.id } : undefined)}
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-kaam-yellow px-6 text-sm font-extrabold text-kaam-navy hover:bg-kaam-amber"
          >
            Track Progress
          </Link>
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
};

/** Ported from LiveTrackingScreen.tsx. */
export const LiveTracking = () => (
  <Screen width="narrow">
    <h1 className="text-2xl font-extrabold text-kaam-navy">Live Tracking</h1>
    <p className="mt-1 text-sm text-kaam-muted">
      Follow your technician on the day of your visit.
    </p>

    <section className="mt-6 rounded-xl2 border border-kaam-line bg-kaam-card p-6 text-center">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-kaam-yellow/20">
        <MapPin size={26} className="text-kaam-amber" aria-hidden />
      </span>
      <h2 className="mt-4 text-base font-extrabold text-kaam-navy">
        Tracking starts on your visit day
      </h2>
      <p className="mt-2 text-sm text-kaam-muted">
        Once your technician is dispatched you will see their live location and arrival window
        here.
      </p>
      <button
        type="button"
        onClick={() => void openSupportWhatsApp()}
        className="mt-6 inline-flex h-12 items-center gap-2 rounded-2xl border border-kaam-line bg-white px-6 text-sm font-extrabold text-kaam-navy hover:border-kaam-amber"
      >
        <Phone size={16} aria-hidden />
        Contact Support
      </button>
    </section>
  </Screen>
);

/** Ported from PostServiceHealthReportScreen.tsx. */
export const PostServiceHealthReport = () => {
  const checks = [
    { label: 'Panel condition', status: 'Healthy' },
    { label: 'Generation vs expected', status: 'Within range' },
    { label: 'DC wiring & connectors', status: 'Tightened' },
    { label: 'Inverter diagnostics', status: 'No faults' },
    { label: 'Earthing', status: 'Verified' }
  ];

  return (
    <Screen width="narrow">
      <h1 className="text-2xl font-extrabold text-kaam-navy">Post Service Health Report</h1>
      <p className="mt-1 text-sm text-kaam-muted">
        A summary of what our technician checked and found.
      </p>

      <section className="mt-6 overflow-hidden rounded-xl2 border border-kaam-line bg-kaam-card">
        {checks.map((check, index) => (
          <div
            key={check.label}
            className={`flex items-center gap-3 p-4 ${index < checks.length - 1 ? 'border-b border-kaam-line' : ''}`}
          >
            <Activity size={16} className="shrink-0 text-kaam-amber" aria-hidden />
            <span className="flex-1 text-sm font-extrabold text-kaam-navy">{check.label}</span>
            <span className="rounded-lg bg-[#ECFDF3] px-2.5 py-1 text-[11px] font-extrabold text-kaam-green">
              {check.status}
            </span>
          </div>
        ))}
      </section>

      <p className="mt-4 rounded-xl2 border border-kaam-line bg-kaam-surface p-4 text-xs text-kaam-muted">
        Your full report is emailed after each visit. Contact support if anything looks wrong.
      </p>
    </Screen>
  );
};

/** Ported from SolarCareMembershipScreen.tsx. */
export const SolarCareMembership = () => {
  const perks = [
    'Scheduled preventive visits all year',
    'Priority technician dispatch',
    'Detailed health report after every visit',
    'Discounted repairs and replacements'
  ];

  return (
    <Screen width="narrow">
      <h1 className="text-2xl font-extrabold text-kaam-navy">Solar Care Membership</h1>
      <p className="mt-1 text-sm text-kaam-muted">
        Year-round cover so your system keeps paying for itself.
      </p>

      <section className="mt-6 rounded-xl2 border border-kaam-line bg-kaam-card p-5">
        <ul className="flex flex-col gap-3">
          {perks.map((perk) => (
            <li key={perk} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-kaam-green/10">
                <CheckCircle2 size={12} className="text-kaam-green" strokeWidth={2.5} aria-hidden />
              </span>
              <span className="text-sm text-kaam-navy">{perk}</span>
            </li>
          ))}
        </ul>

        <Link
          href={routes.preventiveMaintenance()}
          className="mt-6 flex h-12 items-center justify-center rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy hover:bg-kaam-amber"
        >
          See Plans
        </Link>
      </section>
    </Screen>
  );
};
