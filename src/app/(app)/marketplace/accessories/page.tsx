import { redirect } from 'next/navigation';
import { routes } from '@/constants/routes';

/**
 * Mobile has a dedicated SolarAccessoriesScreen; on web it is the `accessory`
 * category with the accessory card variant, so this is a permanent alias that
 * keeps the documented route working.
 */
export default function SolarAccessoriesPage() {
  redirect(routes.marketplaceCategory('accessory'));
}
