'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ChevronLeft, ShoppingCart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SafeImage } from '@/components/ui/SafeImage';
import type { Product } from '@/types/product.types';
import { formatPkr } from '@/utils/formatters';
import { useMarketplaceStore } from '@/store/useMarketplaceStore';
import { useSystemStore } from '@/store/useSystemStore';
import { routes } from '@/constants/routes';
import { cn } from '@/lib/cn';
import { detailBenefits, detailSpecRows, detailSubtitle } from './productDetail';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/marketplace/ProductDetailScreen.tsx
 * (2,142 lines — the copy builders live in ./productDetail.ts).
 *
 * Desktop layout follows BUILD_PROMPT §6: gallery on the left, a sticky
 * buy/spec panel on the right, supporting sections below. Under `lg` it becomes
 * the single column mobile uses.
 *
 * Sections kept from mobile: gallery + thumbnails, title/subtitle, price with
 * compare-at, stock, "Add to My System", technical specifications, accessory
 * description / usage / package contents, benefits, compatibility chips, and
 * the installation prompt.
 */
export const ProductDetailView = ({ product }: { product: Product }) => {
  const { t } = useTranslation();
  const [activeImage, setActiveImage] = useState(product.image ?? null);

  const addToCart = useMarketplaceStore((state) => state.addToCart);
  const setSelectedProduct = useSystemStore((state) => state.setSelectedProduct);
  const startCustomSystemBuilder = useSystemStore((state) => state.startCustomSystemBuilder);

  const specRows = detailSpecRows(product);
  const benefits = detailBenefits(product);
  const isAccessory = product.category === 'accessory';
  const gallery = [product.image, ...(product.galleryImages ?? [])].filter(
    (image): image is string => Boolean(image)
  );

  const addToSystem = () => {
    setSelectedProduct(product);
    startCustomSystemBuilder(product);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-8 md:px-6 lg:px-8">
      <Link
        href={routes.marketplaceCategory(product.category)}
        className="inline-flex items-center gap-1 py-4 text-xs font-extrabold text-kaam-muted hover:text-kaam-navy"
      >
        <ChevronLeft size={16} className="rtl:rotate-180" aria-hidden />
        {t('marketplace.exploreProducts')}
      </Link>

      <div className="lg:grid lg:grid-cols-[1.1fr_1fr] lg:items-start lg:gap-10">
        {/* Gallery */}
        <div>
          <div className="relative flex h-72 items-center justify-center rounded-xl2 border border-kaam-line bg-white p-6 md:h-96">
            <SafeImage
              src={activeImage}
              alt={product.name}
              priority
              sizes="(max-width: 1024px) 100vw, 600px"
              fallback={
                <span className="text-lg font-extrabold text-kaam-muted">{product.brand}</span>
              }
            />
          </div>

          {gallery.length > 1 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {gallery.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveImage(image)}
                  aria-label={`View image ${index + 1}`}
                  className={cn(
                    'relative h-18 w-18 shrink-0 overflow-hidden rounded-[13px] border bg-white p-1',
                    activeImage === image ? 'border-kaam-amber' : 'border-[#E8D9BE]'
                  )}
                  style={{ height: 72, width: 72 }}
                >
                  <SafeImage src={image} alt="" sizes="72px" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Buy panel — sticky on desktop */}
        <div className="mt-6 lg:sticky lg:top-24 lg:mt-0">
          {product.brand ? (
            <p className="text-xs font-extrabold uppercase tracking-wide text-kaam-amber">
              {product.brandName ?? product.brand}
            </p>
          ) : null}
          <h1 className="mt-1 text-2xl font-extrabold text-kaam-navy">{product.name}</h1>
          <p className="mt-1 text-sm text-kaam-muted">{detailSubtitle(product)}</p>

          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-extrabold text-kaam-navy">
              {formatPkr(product.price)}
            </span>
            {product.compareAtPrice && product.price && product.compareAtPrice > product.price ? (
              <span className="text-sm font-semibold text-kaam-muted line-through">
                {formatPkr(product.compareAtPrice)}
              </span>
            ) : null}
            {product.tag ? (
              <span className="rounded-md bg-kaam-yellow px-2 py-1 text-[10px] font-bold text-kaam-navy">
                {product.tag}
              </span>
            ) : null}
          </div>

          {product.specs.length ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {product.specs.map((spec) => (
                <span
                  key={spec}
                  className="rounded-lg bg-kaam-surface px-2.5 py-1.5 text-[11px] font-semibold text-kaam-muted"
                >
                  {spec}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={addToSystem}
              className="h-12 flex-1 rounded-2xl bg-kaam-yellow text-sm font-extrabold text-kaam-navy transition-colors hover:bg-kaam-amber"
            >
              {t('marketplace.addToSystem')}
            </button>
            <button
              type="button"
              onClick={() => addToCart(product)}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-kaam-line bg-white px-5 text-sm font-extrabold text-kaam-navy transition-colors hover:border-kaam-amber"
            >
              <ShoppingCart size={17} aria-hidden />
              {t('marketplace.orderProduct')}
            </button>
          </div>

          <div className="mt-6 rounded-xl2 border border-kaam-line bg-kaam-card p-4">
            <h2 className="text-sm font-extrabold text-kaam-navy">Technical Specifications</h2>
            <dl className="mt-3 divide-y divide-kaam-line">
              {specRows.map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 py-2">
                  <dt className="text-xs font-semibold text-kaam-muted">{label}</dt>
                  <dd className="text-xs font-extrabold text-kaam-navy">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Supporting sections */}
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {isAccessory && product.description ? (
          <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
            <h2 className="text-base font-extrabold text-kaam-navy">Description</h2>
            <p className="mt-2 text-sm leading-relaxed text-kaam-muted">{product.description}</p>
          </section>
        ) : null}

        {isAccessory && product.usageInstructions ? (
          <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
            <h2 className="text-base font-extrabold text-kaam-navy">Usage Instructions</h2>
            <p className="mt-2 text-sm leading-relaxed text-kaam-muted">
              {product.usageInstructions}
            </p>
          </section>
        ) : null}

        {isAccessory && product.packageContents ? (
          <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
            <h2 className="text-base font-extrabold text-kaam-navy">Package Contents</h2>
            <p className="mt-2 text-sm leading-relaxed text-kaam-muted">
              {product.packageContents}
            </p>
          </section>
        ) : null}

        <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
          <h2 className="text-base font-extrabold text-kaam-navy">Benefits</h2>
          <ul className="mt-3 flex flex-col gap-2.5">
            {benefits.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ECFDF3]">
                  <Check size={12} className="text-[#047857]" strokeWidth={2.5} aria-hidden />
                </span>
                <span className="text-sm text-kaam-navy">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {!isAccessory ? (
          <section className="rounded-xl2 border border-kaam-line bg-kaam-card p-5">
            <h2 className="text-base font-extrabold text-kaam-navy">Compatible with</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-xl bg-kaam-surface px-3 py-2 text-xs font-semibold text-kaam-muted">
                Works with 10kW system using about 19 panels
              </span>
              <span className="rounded-xl bg-kaam-surface px-3 py-2 text-xs font-semibold text-kaam-muted">
                Hybrid ready for residential systems
              </span>
            </div>
          </section>
        ) : null}
      </div>

      <section className="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl2 border border-kaam-line bg-kaam-surface p-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-extrabold text-kaam-navy">Need installation?</h2>
          <p className="mt-1 text-sm text-kaam-muted">
            Get matched with KaamAsaan-vetted installers for survey.
          </p>
        </div>
        <Link
          href={routes.bookSurvey()}
          className="inline-flex h-11 items-center rounded-2xl bg-kaam-navy px-5 text-sm font-extrabold text-white hover:bg-kaam-navy/90"
        >
          Get Quote
        </Link>
      </section>
    </div>
  );
};
