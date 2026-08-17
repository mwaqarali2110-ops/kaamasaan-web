import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Screen } from '@/components/ui/Screen';
import { CategoryBrowser } from '@/features/marketplace/CategoryBrowser';
import { getCachedProductsByCategory } from '@/features/marketplace/catalog';
import { marketplaceCategories } from '@/constants/products';
import type { ProductCategory } from '@/types/product.types';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/marketplace/MarketplaceFlowScreen.tsx.
 *
 * Server Component: products are fetched through the cached catalog so the page
 * renders complete HTML for crawlers, then `CategoryBrowser` takes over for
 * client-side brand filtering.
 */
const validCategories = marketplaceCategories.map((category) => category.id);

const isValidCategory = (value: string): value is ProductCategory =>
  (validCategories as string[]).includes(value);

export async function generateMetadata({
  params
}: PageProps<'/marketplace/[category]'>): Promise<Metadata> {
  const { category } = await params;
  const meta = marketplaceCategories.find((entry) => entry.id === category);
  if (!meta) return { title: 'Marketplace' };

  return {
    title: meta.title,
    description: `Compare ${meta.title.toLowerCase()} prices and specifications from trusted solar brands in Pakistan.`
  };
}

export default async function MarketplaceCategoryPage({
  params
}: PageProps<'/marketplace/[category]'>) {
  const { category } = await params;
  if (!isValidCategory(category)) notFound();

  const meta = marketplaceCategories.find((entry) => entry.id === category);
  const products = await getCachedProductsByCategory(category);

  return (
    <Screen width="wide">
      <h1 className="text-2xl font-extrabold text-kaam-navy">{meta?.title}</h1>
      <p className="mt-1 text-sm text-kaam-muted">{meta?.subtitle}</p>

      <CategoryBrowser
        products={products}
        variant={category === 'accessory' ? 'accessory' : 'standard'}
      />
    </Screen>
  );
}
