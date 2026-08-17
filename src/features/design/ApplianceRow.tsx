'use client';

import { createElement } from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { applianceIcon } from './applianceContent';

/**
 * Web port of `ApplianceCard` from
 * kaamasaan-mobile/src/mobile/screens/design-system/DesignSystemFlowScreen.tsx.
 *
 * Same clamps: 0 floor, 20 ceiling — but applied by the caller against fresh
 * store state rather than the rendered prop. Mobile computes `quantity + 1` from
 * props, which silently drops increments when several clicks land in one React
 * batch. Taps are far enough apart for that never to bite on a phone; mouse
 * clicks are not, so the row reports a delta instead.
 * An optional `hours` control serves the backup-appliances step, which mobile
 * renders with the same card plus an hours stepper.
 */
export const ApplianceRow = ({
  id,
  name,
  watts,
  quantity,
  hours,
  showDivider = false,
  onQuantityStep,
  onHoursChange
}: {
  id: string;
  name: string;
  watts: number;
  quantity: number;
  hours?: number;
  showDivider?: boolean;
  /** Called with -1 or +1; the caller resolves it against current store state. */
  onQuantityStep: (delta: -1 | 1) => void;
  onHoursChange?: (hours: number) => void;
}) => {
  const selected = quantity > 0;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 px-4 py-3',
        showDivider && 'border-b border-kaam-line',
        selected && 'bg-kaam-yellow/8'
      )}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-kaam-yellow/30 bg-kaam-yellow/15">
        {createElement(applianceIcon(id), {
          size: 18,
          className: "text-[#B98900]",
          strokeWidth: 1.8,
          "aria-hidden": true
        })}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-extrabold text-kaam-navy">{name}</span>
        <span className="block text-[11px] text-kaam-muted">{watts} W each</span>
      </span>

      <div className="flex items-center gap-1.5" role="group" aria-label={`${name} quantity`}>
        <button
          type="button"
          onClick={() => onQuantityStep(-1)}
          disabled={quantity <= 0}
          aria-label={`Decrease ${name}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-kaam-line text-kaam-navy disabled:opacity-40"
        >
          <Minus size={14} strokeWidth={2.5} aria-hidden />
        </button>
        <span className="w-6 text-center text-sm font-extrabold text-kaam-navy" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => onQuantityStep(1)}
          aria-label={`Increase ${name}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-kaam-yellow text-kaam-navy hover:bg-kaam-amber"
        >
          <Plus size={14} strokeWidth={2.5} aria-hidden />
        </button>
      </div>

      {onHoursChange && selected ? (
        <label className="flex w-full items-center gap-2 sm:w-auto">
          <span className="text-[11px] font-bold text-kaam-muted">Backup hours</span>
          <input
            type="number"
            min={1}
            max={24}
            value={hours ?? 1}
            onChange={(event) => {
              const next = Number(event.target.value);
              if (Number.isFinite(next)) onHoursChange(Math.min(24, Math.max(1, next)));
            }}
            className="h-8 w-16 rounded-lg border border-kaam-line bg-white px-2 text-center text-sm font-extrabold text-kaam-navy"
          />
        </label>
      ) : null}
    </div>
  );
};
