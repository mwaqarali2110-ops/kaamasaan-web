'use client';

import Link from 'next/link';
import { CalendarClock, CheckCircle2, Circle, FileText } from 'lucide-react';
import { Screen } from '@/components/ui/Screen';
import { useMaintenanceLifecycle } from '@/hooks/useMaintenanceLifecycle';
import { formatMaintenancePrice } from '@/data/maintenancePlans';
import { routes } from '@/constants/routes';
import { cn } from '@/lib/cn';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/services/PremiumCareProgressScreen.tsx.
 *
 * Data comes from the ported `useMaintenanceLifecycle`, which also subscribes to
 * Supabase realtime on `maintenance_plans` and `maintenance_visits` — so a visit
 * scheduled by an admin appears here without a refresh, exactly as on mobile.
 *
 * The feedback modal is deliberately not ported yet: it writes through
 * `submit_maintenance_feedback` and there is no way to exercise it without
 * production data. Tracked in docs/PORTING_LOG.md.
 */
const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('en-PK', { dateStyle: 'medium' }) : '—';

export const PremiumCareProgress = ({
  planId,
  requestId,
  visitId
}: {
  planId?: string;
  requestId?: string;
  visitId?: string;
}) => {
  const lifecycle = useMaintenanceLifecycle({ planId, requestId, visitId });
  const data = lifecycle.data;

  if (lifecycle.isLoading) {
    return (
      <Screen>
        <div className="h-64 animate-pulse rounded-xl2 border border-kaam-line bg-kaam-card" />
      </Screen>
    );
  }

  if (!data?.plan) {
    return (
      <Screen width="narrow">
        <div className="rounded-xl2 border border-kaam-line bg-kaam-card p-8 text-center">
          <h1 className="text-lg font-extrabold text-kaam-navy">No active care plan</h1>
          <p className="mt-2 text-sm text-kaam-muted">
            Book preventive maintenance and your visit schedule will appear here.
          </p>
          <Link
            href={routes.preventiveMaintenance()}
            className="mt-6 inline-flex h-12 items-center rounded-2xl bg-kaam-yellow px-6 text-sm font-extrabold text-kaam-navy hover:bg-kaam-amber"
          >
            See Plans
          </Link>
        </div>
      </Screen>
    );
  }

  const { plan, visits } = data;
  const completed = visits.filter((visit) => visit.status === 'completed').length;
  const progress = visits.length > 0 ? Math.round((completed / visits.length) * 100) : 0;

  return (
    <Screen>
      <h1 className="text-2xl font-extrabold text-kaam-navy">{plan.planType ?? 'Premium Care'}</h1>
      <p className="mt-1 text-sm text-kaam-muted">
        {plan.reference} · {formatMaintenancePrice(Number(plan.price) || 0)}
      </p>

      <section className="mt-5 rounded-xl2 border border-kaam-line bg-kaam-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-kaam-navy">Visit progress</h2>
          <span className="text-sm font-extrabold text-kaam-amber">
            {completed} / {visits.length || plan.totalVisits}
          </span>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-kaam-line">
          <div
            className="h-full rounded-full bg-kaam-amber transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </section>

      <h2 className="mt-8 mb-3 text-sm font-extrabold text-kaam-navy">Scheduled visits</h2>
      {visits.length === 0 ? (
        <p className="rounded-xl2 border border-dashed border-kaam-line bg-kaam-card p-6 text-center text-sm text-kaam-muted">
          Your visit schedule is being prepared.
        </p>
      ) : (
        <ol className="overflow-hidden rounded-xl2 border border-kaam-line bg-kaam-card">
          {visits.map((visit, index) => {
            const isComplete = visit.status === 'completed';
            return (
              <li
                key={visit.id}
                className={cn(
                  'flex items-center gap-4 p-4',
                  index < visits.length - 1 && 'border-b border-kaam-line'
                )}
              >
                <span className="shrink-0">
                  {isComplete ? (
                    <CheckCircle2 size={20} className="text-kaam-green" aria-hidden />
                  ) : (
                    <Circle size={20} className="text-kaam-muted" aria-hidden />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-extrabold text-kaam-navy">
                    Visit {visit.visitNumber}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-kaam-muted">
                    <CalendarClock size={12} aria-hidden />
                    {formatDate(visit.scheduledDate ?? visit.targetDate)}
                    {visit.scheduledTimeSlot ? ` · ${visit.scheduledTimeSlot}` : ''}
                  </span>
                  {visit.assignedTeamName ? (
                    <span className="block text-xs text-kaam-muted">
                      Team: {visit.assignedTeamName}
                    </span>
                  ) : null}
                </span>

                {visit.reportUrl ? (
                  <a
                    href={visit.reportUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex shrink-0 items-center gap-1 text-xs font-extrabold text-kaam-amber hover:underline"
                  >
                    <FileText size={13} aria-hidden />
                    Report
                  </a>
                ) : (
                  <span className="shrink-0 rounded-lg bg-kaam-surface px-2.5 py-1 text-[11px] font-extrabold text-kaam-muted">
                    {visit.status.replace(/_/g, ' ')}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </Screen>
  );
};
