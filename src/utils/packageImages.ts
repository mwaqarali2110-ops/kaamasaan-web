/**
 * Ported from kaamasaan-mobile/src/utils/packageImages.ts.
 *
 * Deviation: same as brandLogo.ts — bundled `require()` assets become public
 * path strings and `{ uri }` collapses to the URL string. Brand-detection logic
 * is unchanged.
 */

type PackageImageProduct = {
  brand?: string | null;
  brandName?: string | null;
  brands?: { name?: string | null } | null;
  manufacturer?: string | null;
  name?: string | null;
  model?: string | null;
  product?: PackageImageProduct | null;
};

export type PackageImageData = {
  brand?: string | null;
  packageBrand?: string | null;
  name?: string | null;
  packageName?: string | null;
  title?: string | null;
  image?: string | null;
  packageImageUrl?: string | null;
  inverter?: PackageImageProduct | null;
  inverterProduct?: PackageImageProduct | null;
  battery?: PackageImageProduct | null;
  batteryProduct?: PackageImageProduct | null;
};

export const PACKAGE_IMAGES = {
  fox: '/assets/packages/fox.png',
  goodwe: '/assets/packages/goodwe.png',
  solis: '/assets/packages/solis.png',
  itel: '/assets/packages/itel.png',
  kstar: '/assets/packages/kstar.png',
  inverex: '/assets/packages/inverex.png',
  default: '/assets/home/battery.webp'
} as const satisfies Record<string, string>;

export type PackageImageBrand = Exclude<keyof typeof PACKAGE_IMAGES, 'default'>;

const supportedPackageBrands: readonly PackageImageBrand[] = [
  'inverex',
  'itel',
  'kstar',
  'goodwe',
  'solis',
  'fox'
];

export const normalizePackageBrand = (value?: string | null) => (value ?? '')
  .toLowerCase()
  .replace(/[\s_-]+/g, '')
  .replace(/[^a-z0-9]/g, '')
  .trim();

const brandFromValues = (values: Array<string | null | undefined>) => {
  for (const value of values) {
    const normalized = normalizePackageBrand(value);
    if (!normalized) continue;
    const matches = supportedPackageBrands
      .map((candidate) => ({ candidate, index: normalized.indexOf(candidate) }))
      .filter((match) => match.index >= 0)
      .sort((left, right) => left.index - right.index);
    if (matches[0]) return matches[0].candidate;
  }
  return null;
};

const productEvidence = (product?: PackageImageProduct | null) => [
  product?.brand,
  product?.brandName,
  product?.brands?.name,
  product?.manufacturer,
  product?.name,
  product?.model,
  product?.product?.brand,
  product?.product?.brandName,
  product?.product?.brands?.name,
  product?.product?.manufacturer,
  product?.product?.name,
  product?.product?.model
];

export const getPackageImageBrand = (packageData?: PackageImageData | null): PackageImageBrand | null => {
  if (!packageData) return null;

  const packageBrand = brandFromValues([
    packageData.packageBrand,
    packageData.brand,
    packageData.packageName,
    packageData.name,
    packageData.title
  ]);
  if (packageBrand) return packageBrand;

  const inverterBrand = brandFromValues([
    ...productEvidence(packageData.inverter),
    ...productEvidence(packageData.inverterProduct)
  ]);
  if (inverterBrand) return inverterBrand;

  return brandFromValues([
    ...productEvidence(packageData.battery),
    ...productEvidence(packageData.batteryProduct)
  ]);
};

export const getPackageImage = (packageData?: PackageImageData | null): string => {
  // Supabase is the source of truth for every current and future brand. Bundled
  // images remain only as a rollout fallback for the five migrated brands.
  if (packageData?.packageImageUrl) return packageData.packageImageUrl;
  const brand = getPackageImageBrand(packageData);
  if (brand) return PACKAGE_IMAGES[brand];
  if (packageData?.image) return packageData.image;
  return PACKAGE_IMAGES.default;
};
