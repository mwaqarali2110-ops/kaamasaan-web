import { supabaseUrl } from '@/lib/env';

/**
 * Ported from kaamasaan-mobile/src/utils/storage.ts.
 *
 * Deviation: mobile calls `supabase.storage.from(bucket).getPublicUrl(path)`,
 * which requires a Supabase client instance. This app renders the catalog on
 * both the server (SSG marketplace pages) and the client, and the two use
 * different client factories — so the URL is composed directly instead.
 *
 * `getPublicUrl` performs no network call; it only concatenates
 * `<projectUrl>/storage/v1/object/public/<bucket>/<path>`. Composing it here is
 * byte-identical and isomorphic. Locked in by storage.test.ts.
 */
export const normalizePublicStorageUrl = (bucket: string, value?: string | null) => {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  let path = trimmed.replace(/^\/+/, '');
  path = path.replace(/^storage\/v1\/object\/public\//, '');
  if (path.startsWith(`${bucket}/`)) path = path.slice(bucket.length + 1);

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
};
