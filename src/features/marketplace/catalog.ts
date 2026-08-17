import { unstable_cache } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/public';
import { createMarketplaceApi } from '@/services/marketplace.api';
import type { Product, ProductCategory } from '@/types/product.types';

/**
 * Server-side catalog reads, cached across requests.
 *
 * This is the "option 1" strategy from docs/PORTING_LOG.md Phase 4: the root
 * layout reads the language cookie, so every route renders dynamically, but the
 * expensive part — the Supabase catalog query — is cached for an hour. Pages
 * stay fully server-rendered and crawlable without hitting the database on
 * every request.
 *
 * Uses the cookie-less public client because `unstable_cache` cannot contain
 * `cookies()`, and the catalog is the same for everyone anyway.
 */
const CATALOG_REVALIDATE_SECONDS = 60 * 60;

export const getCachedProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const marketplaceApi = createMarketplaceApi(createPublicClient());
    return marketplaceApi.getProducts();
  },
  ['catalog-products'],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ['catalog'] }
);

export const getCachedBrands = unstable_cache(
  async (category: ProductCategory) => {
    const marketplaceApi = createMarketplaceApi(createPublicClient());
    return marketplaceApi.getBrands(category);
  },
  ['catalog-brands'],
  { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ['catalog'] }
);

/** Single product lookup, served from the cached catalog to avoid a second query. */
export const getCachedProduct = async (productId: string): Promise<Product | null> => {
  const products = await getCachedProducts();
  return products.find((product) => product.id === productId) ?? null;
};

export const getCachedProductsByCategory = async (category: ProductCategory) => {
  const products = await getCachedProducts();
  return products.filter((product) => product.category === category);
};
