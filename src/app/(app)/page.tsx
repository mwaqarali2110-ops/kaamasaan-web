import { MarketingHome } from '@/features/marketing/MarketingHome';

/**
 * "/" — the public marketing homepage, ported from kaamasaan-marketing-site.
 * The authenticated dashboard mobile calls "Home" lives at /home now; see the
 * note in src/proxy.ts and src/constants/routes.ts.
 */
export default function Home() {
  return <MarketingHome />;
}
