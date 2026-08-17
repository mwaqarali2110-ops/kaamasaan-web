'use client';

import { createClient } from '@/lib/supabase/client';
import { createComplaintsApi } from './complaints.api';
import { createJourneyApi } from './journey.api';
import { createMaintenanceApi } from './maintenance.api';
import { createMarketplaceApi } from './marketplace.api';
import { createNotificationsApi } from './notifications.api';
import { createPromoApi } from './promo.api';
import { createRecommendationApi } from './recommendation.api';
import { createSystemApi } from './system.api';

/**
 * Browser-bound service instances.
 *
 * Client components, hooks and Zustand stores import from here and get the same
 * flat API objects mobile had (`marketplaceApi.getProducts()`), so ported call
 * sites only change their import path.
 *
 * Server Components, Route Handlers and Server Actions must NOT import this
 * module. They call the factories directly with the per-request server client:
 *
 *   import { createServerClient } from '@/lib/supabase/server';
 *   const marketplaceApi = createMarketplaceApi(await createServerClient());
 *
 * The 'use client' directive above makes an accidental server import a build
 * error rather than a leaked browser session.
 */
const supabase = createClient();

export const complaintsApi = createComplaintsApi(supabase);
export const journeyApi = createJourneyApi(supabase);
export const maintenanceApi = createMaintenanceApi(supabase);
export const marketplaceApi = createMarketplaceApi(supabase);
export const notificationsApi = createNotificationsApi(supabase);
export const promoApi = createPromoApi(supabase);
export const recommendationApi = createRecommendationApi(supabase);
export const systemApi = createSystemApi(supabase);
