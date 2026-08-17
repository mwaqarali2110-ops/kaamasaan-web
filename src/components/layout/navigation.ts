import { ClipboardList, Home, PanelsTopLeft, ShoppingBag, User, type LucideIcon } from 'lucide-react';
import { routes } from '@/constants/routes';

/**
 * The five primary destinations. Identical to the mobile bottom tab bar in
 * kaamasaan-mobile/src/mobile/navigation/RootNavigator.tsx — same order, same
 * icons, same i18n keys. Rendered as a sidebar on desktop, a tab bar on mobile.
 */
export type PrimaryDestination = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
};

export const primaryDestinations: PrimaryDestination[] = [
  { href: routes.home(), labelKey: 'tabs.home', icon: Home },
  { href: routes.marketplace(), labelKey: 'tabs.marketplace', icon: ShoppingBag },
  { href: routes.mySystem(), labelKey: 'tabs.mySystem', icon: PanelsTopLeft },
  { href: routes.myProject(), labelKey: 'tabs.myProject', icon: ClipboardList },
  { href: routes.profile(), labelKey: 'tabs.profile', icon: User }
];

/**
 * Matches the mobile tab highlight: exact match, or a sub-route prefix match.
 * None of the five destinations is "/" anymore (that's the public marketing
 * homepage now) so the old root special-case is gone.
 */
export const isDestinationActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);
