'use client';

import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProductCard } from '@/components/cards/ProductCard';
import type { Product } from '@/types/product.types';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import { normalizeBrandKey } from '@/utils/brandLogo';
import { cn } from '@/lib/cn';

/**
 * Category browsing UI.
 *
 * Mobile splits this into two steps — a brand-selection screen, then a product
 * list for that brand (MarketplaceFlowScreen.tsx). BUILD_PROMPT §6 calls for a
 * product grid with a persistent filter rail on desktop, so the two steps are
 * merged: brands become a filter that starts at "All". Below `lg` the rail
 * collapses into the chip row mobile already uses, so the phone flow is intact.
 *
 * Products are passed in from the Server Component, already fetched and cached,
 * so filtering is instant and the first paint is fully rendered HTML.
 */
export const CategoryBrowser = ({
  products,
  variant
}: {
  products: Product[];
  variant: 'standard' | 'accessory';
}) => {
  const { t } = useTranslation();
  const [brand, setBrand] = useState('All');
  const compareIds = useMarketplaceStore((state) => state.compareIds);
  const toggleCompare = useMarketplaceStore((state) => state.toggleCompare);
  const addToCart = useMarketplaceStore((state) => state.addToCart);

  const brands = useMemo(() => {
    const seen = new Map<string, string>();
    for (const product of products) {
      const label = product.brandName ?? product.brand;
      if (!label) continue;
      const key = normalizeBrandKey(label);
      if (key && !seen.has(key)) seen.set(key, label);
    }
    return ['All', ...[...seen.values()].sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const filtered = useMemo(() => {
    if (brand === 'All') return products;
    const target = normalizeBrandKey(brand);
    return products.filter(
      (product) => normalizeBrandKey(product.brandName ?? product.brand) === target
    );
  }, [brand, products]);

  const brandButton = (label: string) => (
    <button
      key={label}
      type="button"
      onClick={() => setBrand(label)}
      aria-pressed={brand === label}
      className={cn(
        'shrink-0 rounded-full border px-4 py-2 text-xs font-extrabold transition-colors',
        brand === label
          ? 'border-kaam-amber bg-kaam-yellow/20 text-kaam-navy'
          : 'border-kaam-line bg-white text-kaam-muted hover:border-kaam-amber'
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="mt-6 lg:grid lg:grid-cols-[220px_1fr] lg:gap-8">
      {/* Desktop filter rail */}
      <aside className="hidden lg:block">
        <h2 className="mb-3 text-xs font-bold uppercase tracking-wide text-kaam-muted">
          {t('marketplace.selectBrand')}
        </h2>
        <div className="flex flex-col items-start gap-2">{brands.map(brandButton)}</div>
      </aside>

      {/* Mobile chip row */}
      <div className="flex gap-2 overflow-x-auto pb-3 lg:hidden">{brands.map(brandButton)}</div>

      <div>
        <p className="mb-3 text-xs font-semibold text-kaam-muted">
          {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
        </p>

        {filtered.length === 0 ? (
          <div className="rounded-xl2 border border-dashed border-kaam-line bg-kaam-card p-8 text-center">
            <p className="text-sm font-extrabold text-kaam-navy">No products available yet.</p>
            <p className="mt-1 text-xs text-kaam-muted">
              Try another brand, or check back soon.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant={variant}
                compared={compareIds.includes(product.id)}
                onCompare={() => toggleCompare(product.id)}
                onAdd={() => addToCart(product)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
