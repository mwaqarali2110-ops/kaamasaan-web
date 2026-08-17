import { Calculator, Ruler, Settings, TrendingUp, type LucideIcon } from 'lucide-react';
import { routes } from '@/constants/routes';

/**
 * Home page content, ported verbatim from the constant blocks at the top of
 * kaamasaan-mobile/src/mobile/screens/home/HomeScreen.tsx — same items, same
 * order, same i18n keys. Only the destinations change: mobile's
 * `navigation.navigate(...)` targets become web routes.
 *
 * The `require()`d assets are now public paths under /assets (copied in Phase 2).
 */

export const BRAND_LOGOS: Array<{ label: string; image?: string }> = [
  { label: 'FOX ESS', image: '/assets/home/brand-fox-ess.png' },
  { label: 'Solis', image: '/assets/home/brand-solis.png' },
  { label: 'Dyness', image: '/assets/home/brand-dyness.png' },
  { label: 'Jinko', image: '/assets/home/brand-jinko.png' },
  { label: 'Longi', image: '/assets/home/brand-longi.png' },
  { label: 'GoodWe' },
  { label: 'PylonTech' },
  { label: 'Sungrow' },
  { label: 'JA Solar' },
  { label: 'Canadian Solar' }
];

export const QUICK_ACTIONS: Array<{ id: string; labelKey: string; Icon: LucideIcon; href: string }> = [
  { id: 'roof-space', labelKey: 'tools.roofSpace', Icon: Ruler, href: routes.roofSpaceTool() },
  { id: 'roi', labelKey: 'tools.roi', Icon: TrendingUp, href: routes.roiCalculator() },
  { id: 'solar-size', labelKey: 'tools.solarSize', Icon: Calculator, href: routes.solarSizeTool() },
  // Mobile maps 'inverter-size' to the design flow rather than a dedicated tool.
  { id: 'inverter-size', labelKey: 'tools.loadCalculator', Icon: Settings, href: routes.design() },
  { id: 'battery-size', labelKey: 'tools.batterySize', Icon: Calculator, href: routes.batterySizeTool() }
];

export const MARKETPLACE_CATEGORIES = [
  {
    id: 'inverters',
    labelKey: 'products.inverter',
    subtitleKey: 'products.inverterSubtitle',
    image: '/assets/home/inverter.jpg',
    href: routes.marketplaceCategory('inverter')
  },
  {
    id: 'panels',
    labelKey: 'products.panel',
    subtitleKey: 'products.panelSubtitle',
    image: '/assets/home/solar-panels.jpg',
    href: routes.marketplaceCategory('panel')
  },
  {
    id: 'batteries',
    labelKey: 'products.batteries',
    subtitleKey: 'products.batterySubtitle',
    image: '/assets/home/pylontech.jpg',
    href: routes.marketplaceCategory('battery')
  },
  {
    id: 'accessories',
    labelKey: 'products.accessories',
    subtitleKey: 'products.accessoriesSubtitle',
    image: '/assets/home/mughal-steel.jpg',
    href: routes.marketplaceCategory('accessory')
  }
];

export const SERVICES = [
  {
    id: 'aftersale',
    labelKey: 'services.electricalWork',
    subtitleKey: 'services.electricalWorkSubtitle',
    image: '/assets/home/electrical-work-card.png',
    href: routes.electricalServices()
  },
  {
    id: 'care',
    labelKey: 'services.cleaning',
    subtitleKey: 'services.cleaningSubtitle',
    image: '/assets/home/solar-panel-cleaning.png',
    href: routes.cleaningEstimator()
  },
  {
    id: 'install',
    labelKey: 'services.installation',
    subtitleKey: 'services.installationSubtitle',
    image: '/assets/home/installation.png',
    href: routes.installationService()
  },
  {
    id: 'billing',
    labelKey: 'services.netBilling',
    subtitleKey: 'services.netBillingSubtitle',
    image: '/assets/home/green-meter.jpg',
    href: routes.bookSurvey()
  }
];

export const WHY_ITEMS = ['home.whyAccurate', 'home.whyPricing', 'home.whySupport'];

export const CONTINUE_PLAN_DISMISS_KEY = 'kaamasaan.home.continue-plan.dismissed';

export const EXPERT_WHATSAPP_MESSAGE =
  'Assalam-o-Alaikum, I need expert guidance to choose the right solar system for my home through the KaamAsaan app.';
