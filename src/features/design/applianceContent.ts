import { createElement } from 'react';
import {
  AirVent,
  Cctv,
  Droplets,
  Fan,
  Laptop,
  Lightbulb,
  Microwave,
  PlugZap,
  Plus,
  Refrigerator,
  Router,
  Tv,
  WashingMachine,
  type LucideIcon,
  type LucideProps
} from 'lucide-react';

/**
 * Appliance groupings, extra options and icon map — ported verbatim from the
 * constant block in
 * kaamasaan-mobile/src/mobile/screens/design-system/DesignSystemFlowScreen.tsx.
 *
 * The wattages here feed the sizing engines, so they must not drift.
 *
 * Icons: every appliance now gets its own purpose-built glyph instead of the
 * placeholder `Grid3X3`/`Zap` a handful of them were sharing (TV, laptop and
 * microwave all rendered the same generic grid before this pass). Lucide
 * doesn't ship a clothes-iron glyph, so `IronIcon` below is a small
 * hand-drawn one kept in the same stroke style (24x24, round caps, 2px
 * stroke) so it sits invisibly among the rest.
 */

/**
 * Lucide has no built-in "clothes iron" icon — this one matches its style
 * (24x24 viewBox, round caps, 2px stroke). Written with `createElement`
 * rather than JSX since this module is `.ts`, not `.tsx`.
 */
const IronIcon = ({ size = 24, strokeWidth = 2, className, ...rest }: LucideProps) =>
  createElement(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      className,
      ...rest
    },
    createElement('path', {
      d: 'M4 10.5c0-2 1.6-3.5 4-3.5h7a5 5 0 0 1 5 5c0 3.6-3.2 6-7.5 6H8c-2.2 0-4-1.3-4-3.5Z'
    }),
    createElement('path', { d: 'M9 7V4.5' }),
    createElement('circle', { cx: 15.5, cy: 14.5, r: 0.6, fill: 'currentColor', stroke: 'none' })
  );

export const applianceGroups = [
  { title: 'ESSENTIALS', ids: ['lights', 'fans', 'fridge', 'washingMachine'] },
  { title: 'AIR CONDITIONERS', ids: ['ac1TonInverter', 'ac15TonInverter', 'ac2TonInverter'] }
];

export const extraApplianceOptions = [
  { id: 'tv', name: 'TV', watts: 100 },
  { id: 'router', name: 'WiFi Router', watts: 20 },
  { id: 'laptop', name: 'Laptop', watts: 65 },
  { id: 'pump', name: 'Water Pump', watts: 750 },
  { id: 'iron', name: 'Iron', watts: 1000 },
  { id: 'microwave', name: 'Microwave', watts: 1200 },
  { id: 'cctv', name: 'CCTV Camera', watts: 15 },
  { id: 'charger', name: 'Mobile Charger', watts: 10 }
];

export const applianceIconMap: Record<string, LucideIcon> = {
  fans: Fan,
  fridge: Refrigerator,
  lights: Lightbulb,
  washingMachine: WashingMachine,
  ac1TonInverter: AirVent,
  ac15TonInverter: AirVent,
  ac2TonInverter: AirVent,
  tv: Tv,
  router: Router,
  laptop: Laptop,
  pump: Droplets,
  iron: IronIcon,
  microwave: Microwave,
  cctv: Cctv,
  charger: PlugZap
};

export const applianceIcon = (id: string): LucideIcon => applianceIconMap[id] ?? Plus;
