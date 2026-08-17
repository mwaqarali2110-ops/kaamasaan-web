'use client';

import Link from 'next/link';
import { Check, CheckCircle2, ShoppingCart, Sparkles, Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SafeImage } from '@/components/ui/SafeImage';
import type { Product } from '@/types/product.types';
import { formatPkr } from '@/utils/formatters';
import { routes } from '@/constants/routes';
import { cn } from '@/lib/cn';

/**
 * Web port of kaamasaan-mobile/src/components/cards/ProductCard.tsx.
 *
 * Both variants are preserved: `standard` (spec chips + compare checkbox) and
 * `accessory` (short/secondary spec rows, stock pill, add-to-cart).
 *
 * Layout differs by necessity — mobile is a fixed horizontal row; on web the
 * card is vertical inside a responsive grid, which is what lets 3–4 fit per row
 * on desktop (BUILD_PROMPT §6). Every field, badge and rule is the same.
 */
const stockInfo = (status?: string | null) => {
  const value = (status ?? '').toLowerCase().replace(/[\s-]+/g, '_').trim();
  if (value === 'out_of_stock') return { label: 'Out of Stock', kind: 'out' as const };
  if (value === 'on_request' || value === 'booking_open' || value === 'eta' || value === 'preorder') {
    return { label: 'On Request', kind: 'request' as const };
  }
  return { label: 'In Stock', kind: 'in' as const };
};

const stockClasses = {
  in: 'bg-[#E8F7E9] text-[#15803D]',
  out: 'bg-[#FEECEB] text-[#B42318]',
  request: 'bg-[#FFF4D6] text-[#9A6700]'
} as const;

export const ProductCard = ({
  product,
  compared,
  onCompare,
  onAdd,
  variant = 'standard'
}: {
  product: Product;
  compared?: boolean;
  onCompare?: () => void;
  onAdd?: () => void;
  variant?: 'standard' | 'accessory';
}) => {
  const { t } = useTranslation();
  const isAccessory = variant === 'accessory';
  const stock = stockInfo(product.stockStatus);

  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl2 border bg-white transition-all hover:-translate-y-0.5 hover:shadow-md',
        compared ? 'border-kaam-yellow' : 'border-kaam-line hover:border-kaam-amber'
      )}
    >
      <Link
        href={routes.productDetail(product.id)}
        className="relative flex h-40 items-center justify-center bg-kaam-surface p-4"
      >
        <SafeImage
          src={product.image}
          alt={product.name}
          sizes="(max-width: 768px) 50vw, 280px"
          fallback={
            <span className="text-center text-xs font-extrabold text-kaam-navy">
              {product.brand}
            </span>
          }
        />
        {!isAccessory && product.tag ? (
          <span className="absolute start-3 top-3 rounded-md bg-kaam-yellow px-2 py-1 text-[9px] font-bold text-kaam-navy">
            {product.tag}
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {isAccessory ? (
          <p className="text-xs font-semibold text-kaam-muted">{product.brand || 'KaamAsaan'}</p>
        ) : null}

        <Link href={routes.productDetail(product.id)}>
          <h3 className="line-clamp-2 text-sm font-extrabold text-kaam-navy group-hover:text-kaam-amber">
            {product.name}
          </h3>
        </Link>

        {isAccessory ? (
          <div className="mt-2 flex flex-col gap-1">
            <p className="flex items-center gap-1.5 text-[10px] font-semibold text-kaam-muted">
              <Wrench size={13} aria-hidden />
              <span className="line-clamp-1">
                {product.shortSpec || product.specs[0] || 'Solar installation accessory'}
              </span>
            </p>
            {product.secondarySpec ? (
              <p className="flex items-center gap-1.5 text-[10px] font-semibold text-kaam-muted">
                <Sparkles size={13} aria-hidden />
                <span className="line-clamp-1">{product.secondarySpec}</span>
              </p>
            ) : null}
            <span
              className={cn(
                'mt-1 inline-flex w-fit items-center gap-1 rounded-xl px-2 py-1 text-[10px] font-extrabold',
                stockClasses[stock.kind]
              )}
            >
              <CheckCircle2 size={13} aria-hidden />
              {stock.label}
            </span>
          </div>
        ) : (
          <div className="mt-2 flex flex-wrap gap-1">
            {product.specs.slice(0, 3).map((spec) => (
              <span
                key={spec}
                className="rounded-lg bg-kaam-surface px-2 py-1 text-[10px] font-semibold text-kaam-muted"
              >
                {spec}
              </span>
            ))}
          </div>
        )}

        <p className="mt-3 text-sm font-extrabold text-kaam-navy">
          {isAccessory && product.price == null ? 'Price on request' : formatPkr(product.price)}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          {isAccessory ? (
            <>
              <Link
                href={routes.productDetail(product.id)}
                className="text-xs font-extrabold text-[#173A86] hover:underline"
              >
                {t('marketplace.viewDetails')}
              </Link>
              <button
                type="button"
                disabled={stock.kind === 'out'}
                onClick={onAdd}
                className={cn(
                  'flex h-10 items-center gap-1.5 rounded-xl px-3 text-[10px] font-extrabold text-kaam-navy',
                  stock.kind === 'out'
                    ? 'cursor-not-allowed opacity-40'
                    : 'bg-kaam-yellow hover:bg-kaam-amber'
                )}
              >
                <ShoppingCart size={16} aria-hidden />
                {stock.kind === 'request' ? 'Request' : 'Add to Cart'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onCompare}
                aria-pressed={compared}
                className="flex items-center gap-1.5 text-xs font-bold text-kaam-muted hover:text-kaam-navy"
              >
                <span
                  className={cn(
                    'flex h-4 w-4 items-center justify-center rounded border',
                    compared ? 'border-kaam-yellow bg-kaam-yellow' : 'border-kaam-line'
                  )}
                >
                  {compared ? <Check size={10} className="text-kaam-navy" aria-hidden /> : null}
                </span>
                {t('marketplace.compare')}
              </button>
              <Link
                href={routes.productDetail(product.id)}
                className="rounded-xl bg-kaam-navy px-3 py-2 text-xs font-extrabold text-white hover:bg-kaam-navy/90"
              >
                {t('marketplace.viewDetails')}
              </Link>
            </>
          )}
        </div>
      </div>
    </article>
  );
};
