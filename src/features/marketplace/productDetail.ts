import type { Product } from '@/types/product.types';

/**
 * Detail-page copy builders, ported verbatim from the helpers at the top of
 * kaamasaan-mobile/src/mobile/screens/marketplace/ProductDetailScreen.tsx.
 *
 * These encode the fallback values customers actually see when the catalog is
 * missing a field, so they are copied rather than rewritten.
 */

export const detailSubtitle = (product: Product) => {
  if (product.category === 'panel')
    return `${product.specs[0] ?? '550W'} | ${product.specs[1] ?? 'Monocrystalline PERC'}`;
  if (product.category === 'inverter')
    return `${product.specs[0] ?? 'Hybrid'} | ${product.specs[1] ?? 'Smart inverter'}`;
  if (product.category === 'battery')
    return `${product.specs[0] ?? 'Lithium'} | ${product.specs[1] ?? 'Backup storage'}`;
  return product.specs.join(' | ') || 'Installation accessory';
};

export const detailSpecRows = (product: Product): Array<[string, string]> => {
  if (product.category === 'panel') {
    return [
      ['Category', 'Solar Panel'],
      ['Capacity', product.specs[0] ?? '550W'],
      ['Technology', product.specs[1] ?? 'Monocrystalline PERC'],
      ['Efficiency', '21.3%'],
      [
        'Warranty',
        product.specs[2]
          ? `${product.specs[2]} Product / 25 Yr Linear Output`
          : '12 Yr Product / 25 Yr Linear Output'
      ],
      ['Best For', 'Residential Rooftops']
    ];
  }

  if (product.category === 'inverter') {
    return [
      ['Category', 'Inverter'],
      ['Capacity', product.specs[0] ?? 'Hybrid'],
      ['Technology', product.specs[1] ?? 'Hybrid'],
      ['Efficiency', 'High efficiency'],
      ['Warranty', product.specs[2] ?? '5 Years'],
      ['Best For', 'Home Solar Systems']
    ];
  }

  if (product.category === 'battery') {
    return [
      ['Category', 'Battery'],
      ['Capacity', product.specs[0] ?? '5 kWh'],
      ['Technology', product.specs[1] ?? 'Lithium'],
      ['Efficiency', 'Deep cycle backup'],
      ['Warranty', product.specs[2] ?? '10 Years'],
      ['Best For', 'Backup Power']
    ];
  }

  return [
    ['Category', 'Solar Accessory'],
    ['Type', product.accessorySubcategory?.replace(/_/g, ' ') ?? 'Accessory'],
    ...Object.entries(product.specifications ?? {})
      .slice(0, 4)
      .map(([key, value]) => [key, String(value)] as [string, string]),
    ['Warranty', product.warranty ?? 'On request'],
    ['Best For', product.secondarySpec ?? 'Solar installations']
  ];
};

export const detailBenefits = (product: Product) => {
  if (product.category === 'panel') {
    return [
      'Solid efficiency for standard residential systems',
      'Ideal wattage for Pakistani residential rooftops',
      'Tier-1 global manufacturer - bankable quality and proven reliability',
      '25-year linear output warranty for exceptional long-term ROI'
    ];
  }

  return [
    'Verified specs for reliable solar installations',
    'Suitable for Pakistani residential energy systems',
    'Compatible with KaamAsaan approved product flows',
    'Supported by expert survey and installation guidance'
  ];
};
