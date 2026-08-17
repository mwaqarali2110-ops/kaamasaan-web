import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailView } from '@/features/marketplace/ProductDetailView';
import { getCachedProduct } from '@/features/marketplace/catalog';
import { detailSubtitle } from '@/features/marketplace/productDetail';
import { formatPkr } from '@/utils/formatters';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/marketplace/ProductDetailScreen.tsx.
 *
 * Server Component so each product gets real per-product metadata and an OG
 * image (BUILD_PROMPT §7) — the main SEO win of the web port.
 */
export async function generateMetadata({
  params
}: PageProps<'/marketplace/product/[productId]'>): Promise<Metadata> {
  const { productId } = await params;
  const product = await getCachedProduct(productId);
  if (!product) return { title: 'Product not found' };

  const description = `${detailSubtitle(product)} — ${formatPkr(product.price)}. ${
    product.description ?? 'Compare specifications and book installation with KaamAsaan.'
  }`.slice(0, 300);

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      type: 'website',
      images: product.image ? [{ url: product.image }] : undefined
    }
  };
}

export default async function ProductDetailPage({
  params
}: PageProps<'/marketplace/product/[productId]'>) {
  const { productId } = await params;
  const product = await getCachedProduct(productId);
  if (!product) notFound();

  return <ProductDetailView product={product} />;
}
