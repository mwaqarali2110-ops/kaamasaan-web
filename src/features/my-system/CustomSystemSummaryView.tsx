'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BatteryCharging, CheckCircle2, PenLine, Sun, Zap } from 'lucide-react';
import { SafeImage } from '@/components/ui/SafeImage';
import { useSystemStore } from '@/store/useSystemStore';
import { useSystemStoreHydrated } from '@/hooks/useStoreHydrated';
import { formatKw, formatPkr } from '@/utils/formatters';
import { getPanelUnitPrice } from '@/utils/packageBuilder';
import { getMissingCustomSystemComponents } from '@/utils/customSystemBuilder';
import { routes } from '@/constants/routes';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/my-system/CustomSystemSummaryScreen.tsx.
 *
 * Pricing, the missing-component check and the voltage-class mismatch warning
 * are all ported line for line — including the rule that the total is only
 * "complete" when all three component prices are known.
 */
export const CustomSystemSummaryView = () => {
  const router = useRouter();
  const hydrated = useSystemStoreHydrated();
  const builder = useSystemStore((state) => state.customSystemBuilder);
  const startBooking = useSystemStore((state) => state.startBooking);

  const totals = useMemo(() => {
    const panelUnitPrice = builder.selectedPanel ? getPanelUnitPrice(builder.selectedPanel) : null;
    const panelsPrice =
      panelUnitPrice == null ? null : panelUnitPrice * builder.selectedPanelQuantity;
    const inverterPrice = builder.selectedInverter?.price ?? null;
    const batteryPrice =
      builder.selectedBattery?.price == null
        ? null
        : builder.selectedBattery.price * builder.selectedBatteryQuantity;
    const knownPrices = [panelsPrice, inverterPrice, batteryPrice].filter(
      (value): value is number => value != null
    );
    return {
      panelsPrice,
      inverterPrice,
      batteryPrice,
      total: knownPrices.reduce((sum, value) => sum + value, 0),
      completePricing: knownPrices.length === 3
    };
  }, [builder]);

  if (!hydrated) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-16">
        <div className="h-64 animate-pulse rounded-xl2 border border-kaam-line bg-kaam-card" />
      </div>
    );
  }

  const missing = getMissingCustomSystemComponents(builder);
  const systemSizeKw = (builder.selectedPanelQuantity * builder.selectedPanelWattage) / 1000;

  const voltageMismatch = Boolean(
    builder.selectedInverter?.voltageClass &&
      builder.selectedBattery?.voltageClass &&
      builder.selectedInverter.voltageClass !== 'NONE' &&
      builder.selectedBattery.voltageClass !== 'NONE' &&
      builder.selectedInverter.voltageClass !== builder.selectedBattery.voltageClass
  );

  const rows = [
    {
      key: 'panel' as const,
      label: 'Solar Panels',
      Icon: Sun,
      product: builder.selectedPanel,
      name: builder.selectedPanel
        ? `${builder.selectedPanelQuantity} x ${builder.selectedPanel.name}`
        : 'Not selected',
      detail: builder.selectedPanel ? `${builder.selectedPanelWattage} W each` : 'Add a panel',
      price: totals.panelsPrice,
      fallback: '/assets/home/solar-panels.jpg'
    },
    {
      key: 'inverter' as const,
      label: 'Inverter',
      Icon: Zap,
      product: builder.selectedInverter,
      name: builder.selectedInverter?.name ?? 'Not selected',
      detail: builder.selectedInverter ? (builder.selectedInverter.capacity ?? '') : 'Add an inverter',
      price: totals.inverterPrice,
      fallback: '/assets/home/inverter.jpg'
    },
    {
      key: 'battery' as const,
      label: 'Battery',
      Icon: BatteryCharging,
      product: builder.selectedBattery,
      name: builder.selectedBattery
        ? `${builder.selectedBatteryQuantity} x ${builder.selectedBattery.name}`
        : 'Not selected',
      detail: builder.selectedBattery ? (builder.selectedBattery.capacity ?? '') : 'Add a battery',
      price: totals.batteryPrice,
      fallback: '/assets/home/battery.webp'
    }
  ];

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-8 md:px-6 lg:px-8">
      <div className="flex items-center gap-3 py-4">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-kaam-line bg-white text-kaam-navy hover:border-kaam-amber"
        >
          <ArrowLeft size={20} strokeWidth={2.4} className="rtl:rotate-180" aria-hidden />
        </button>
        <h1 className="text-lg font-extrabold text-kaam-navy">Your Custom System</h1>
      </div>

      <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
        <p className="text-xs text-kaam-muted">System Size</p>
        <p className="text-3xl font-extrabold text-kaam-navy">{formatKw(systemSizeKw)}</p>
      </section>

      {voltageMismatch ? (
        <p className="mt-4 rounded-xl2 border border-kaam-red/30 bg-kaam-red/5 p-4 text-xs font-semibold text-kaam-red">
          Your inverter and battery use different voltage classes
          ({builder.selectedInverter?.voltageClass} vs {builder.selectedBattery?.voltageClass}).
          Our team will confirm compatibility during the survey.
        </p>
      ) : null}

      <div className="mt-5 overflow-hidden rounded-xl2 border border-kaam-line bg-kaam-card">
        {rows.map((row, index) => (
          <div
            key={row.key}
            className={`flex items-center gap-4 p-4 ${index < rows.length - 1 ? 'border-b border-kaam-line' : ''}`}
          >
            <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-kaam-surface">
              {row.product?.image ? (
                <SafeImage src={row.product.image} alt="" sizes="56px" />
              ) : (
                <row.Icon size={20} className="text-kaam-amber" aria-hidden />
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold uppercase tracking-wide text-kaam-muted">
                {row.label}
              </span>
              <span className="block truncate text-sm font-extrabold text-kaam-navy">
                {row.name}
              </span>
              <span className="block truncate text-xs text-kaam-muted">{row.detail}</span>
            </span>
            <span className="shrink-0 text-sm font-extrabold text-kaam-navy">
              {row.price == null ? '—' : formatPkr(row.price)}
            </span>
            {row.product ? (
              <Link
                href={routes.productDetail(row.product.id, {
                  customBuilderEdit: row.key,
                  returnToCustomSummary: true
                })}
                aria-label={`Edit ${row.label}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-kaam-line text-kaam-navy hover:border-kaam-amber"
              >
                <PenLine size={15} aria-hidden />
              </Link>
            ) : null}
          </div>
        ))}
      </div>

      {missing.length > 0 ? (
        <p className="mt-4 rounded-xl2 border border-kaam-line bg-kaam-surface p-4 text-xs font-semibold text-kaam-muted">
          Still to choose: {missing.join(', ')}. You can book a survey now and our team will
          complete the system with you.
        </p>
      ) : null}

      <section className="mt-5 rounded-xl2 border border-kaam-line bg-kaam-card p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-xs text-kaam-muted">Total Estimated Cost</p>
          <p className="text-2xl font-extrabold text-kaam-navy">{formatPkr(totals.total)}</p>
        </div>
        {totals.completePricing ? (
          <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-kaam-green">
            <CheckCircle2 size={13} aria-hidden />
            All component prices included
          </p>
        ) : (
          <p className="mt-1 text-xs text-kaam-muted">
            Partial estimate — some component prices are on request.
          </p>
        )}

        <Link
          href={routes.bookSurvey({ bookingContext: 'custom_system', source: 'custom_system' })}
          onClick={() => startBooking('custom_system')}
          className="mt-5 flex h-12 items-center justify-center rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber"
        >
          Book Free Survey
        </Link>
      </section>
    </div>
  );
};
