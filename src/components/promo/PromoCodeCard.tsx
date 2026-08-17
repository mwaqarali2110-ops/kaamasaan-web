'use client';

import { Tag, X } from 'lucide-react';
import type { PromoState } from '@/types/promo.types';
import { formatPkr } from '@/utils/formatters';
import { cn } from '@/lib/cn';

/**
 * Web port of kaamasaan-mobile/src/components/promo/PromoCodeCard.tsx.
 * Same prop API and the same four states: idle, loading, applied, invalid.
 */
export const PromoCodeCard = ({
  promo,
  onChangeCode,
  onApply,
  onRemove
}: {
  promo: PromoState;
  onChangeCode: (value: string) => void;
  onApply: () => void;
  onRemove: () => void;
}) => {
  const applied = promo.status === 'applied';
  const loading = promo.status === 'loading';
  const canApply = !loading && Boolean(promo.enteredCode?.trim());

  return (
    <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-4">
      <h2 className="flex items-center gap-2 text-sm font-extrabold text-kaam-navy">
        <Tag size={15} className="text-kaam-amber" aria-hidden />
        Promo code
      </h2>

      {applied ? (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-[#ECFDF3] px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold text-[#027A48]">{promo.appliedCode}</p>
            <p className="text-xs text-[#027A48]">−{formatPkr(promo.discountAmount)}</p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove promo code"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#027A48] hover:bg-white"
          >
            <X size={16} aria-hidden />
          </button>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={promo.enteredCode ?? ''}
            onChange={(event) => onChangeCode(event.target.value)}
            placeholder="Enter code"
            aria-label="Promo code"
            className="h-11 min-w-0 flex-1 rounded-xl border border-kaam-line bg-white px-3 text-sm font-semibold uppercase text-kaam-navy placeholder:normal-case placeholder:text-kaam-muted"
          />
          <button
            type="button"
            disabled={!canApply}
            onClick={onApply}
            className="h-11 rounded-xl bg-kaam-navy px-5 text-sm font-extrabold text-white disabled:opacity-40"
          >
            {loading ? '…' : 'Apply'}
          </button>
        </div>
      )}

      {promo.message ? (
        <p
          className={cn(
            'mt-2 text-xs font-semibold',
            applied ? 'text-kaam-green' : loading ? 'text-kaam-muted' : 'text-kaam-red'
          )}
          role={promo.status === 'invalid' ? 'alert' : 'status'}
        >
          {promo.message}
        </p>
      ) : null}
    </section>
  );
};
