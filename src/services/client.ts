import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * The Supabase client every service factory receives.
 *
 * Mobile's services import a single module-scope client. Web has two — a
 * browser client and a per-request server client — so each service is exported
 * as a `createXApi(supabase)` factory and the caller injects the right one:
 *
 *   Client component / hook:  createMarketplaceApi(getBrowserClient())
 *   Server component / route: createMarketplaceApi(await createServerClient())
 *
 * Because the exported API objects close over the `supabase` parameter, every
 * method body is unchanged from mobile.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Deliberately NOT `SupabaseClient<Database>`.
 *
 * `src/types/supabase.generated.ts` is stale: it has no
 * `survey_booking_status_history` table (added by migration
 * 202608060001_survey_booking_management.sql) and its `survey_bookings.status`
 * enum is the pre-migration-002 set of pending|confirmed|completed|cancelled,
 * while the app legitimately reads and writes values such as
 * `survey_requested`.
 *
 * Mobile calls `createClient(...)` with no generic, so its queries are `any`
 * and the drift is invisible. Applying the generic here produced 15+ errors in
 * otherwise byte-identical code — and "fixing" them would mean narrowing real
 * runtime values to an outdated enum, i.e. introducing bugs to satisfy a stale
 * artefact.
 *
 * Follow-up (tracked in docs/PORTING_LOG.md): regenerate the types from the
 * live database, then re-apply the generic here to get genuine query safety.
 * Until then this matches mobile exactly.
 */
export type Client = SupabaseClient;
