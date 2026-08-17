import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BatteryCharging, Cable, Cpu, Grid2X2 } from 'lucide-react';
import { Screen } from '@/components/ui/Screen';
import { routes } from '@/constants/routes';

/**
 * Ported from kaamasaan-mobile/src/mobile/screens/marketplace/ExploreMarketplaceScreen.tsx.
 * Same four categories, titles, subtitles, icons and images.
 *
 * A Server Component: no client state, so it streams as HTML and is fully
 * crawlable (BUILD_PROMPT §7).
 */
export const metadata: Metadata = {
  title: 'Explore Marketplace',
  description:
    'Browse inverters, solar panels, batteries and accessories from trusted brands across Pakistan.'
};

const categories = [
  {
    id: 'inverter' as const,
    title: 'Inverter',
    subtitle: 'Hybrid and on-grid options',
    Icon: Cpu,
    image: '/assets/home/inverter.jpg'
  },
  {
    id: 'panel' as const,
    title: 'Solar Panel',
    subtitle: 'Efficient panels for maximum output',
    Icon: Grid2X2,
    image: '/assets/home/solo-solar-panel.png'
  },
  {
    id: 'battery' as const,
    title: 'Batteries',
    subtitle: 'Reliable energy storage solutions',
    Icon: BatteryCharging,
    image: '/assets/home/battery.webp'
  },
  {
    id: 'accessory' as const,
    title: 'Solar Accessories',
    subtitle: 'Cables, connectors and more',
    Icon: Cable,
    image: '/assets/home/dc-wires.jpg'
  }
];

export default function MarketplacePage() {
  return (
    <Screen width="wide">
      <h1 className="text-2xl font-extrabold text-kaam-navy">Explore Marketplace</h1>
      <p className="mt-1 text-sm text-kaam-muted">
        Compare products from trusted brands and build your solar system.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {categories.map(({ id, title, subtitle, Icon, image }) => (
          <Link
            key={id}
            href={routes.marketplaceCategory(id)}
            className="group relative flex items-center gap-4 overflow-hidden rounded-xl2 border border-kaam-line bg-kaam-card p-5 transition-all hover:-translate-y-0.5 hover:border-kaam-amber hover:shadow-md"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-kaam-yellow/20">
              <Icon size={28} className="text-[#F59A00]" strokeWidth={2.6} aria-hidden />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-lg font-extrabold text-kaam-navy">{title}</span>
              <span className="block truncate text-xs text-kaam-muted">{subtitle}</span>
              <span className="mt-2 inline-flex items-center gap-1 text-sm font-extrabold text-[#F59A00]">
                Explore
                <ArrowRight size={18} strokeWidth={3} className="rtl:rotate-180" aria-hidden />
              </span>
            </span>

            <span className="relative hidden h-24 w-24 shrink-0 sm:block">
              <span className="absolute inset-0 rounded-full bg-kaam-surface" />
              <Image
                src={image}
                alt=""
                fill
                sizes="96px"
                className="relative object-contain p-2 transition-transform duration-300 group-hover:scale-110"
              />
            </span>
          </Link>
        ))}
      </div>
    </Screen>
  );
}
