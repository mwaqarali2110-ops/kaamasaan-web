import path from 'node:path';
import type { NextConfig } from 'next';

/**
 * Supabase Storage host, derived from the configured project URL so the image
 * allowlist cannot drift from the env var.
 */
const supabaseHost = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').hostname;
  } catch {
    return undefined;
  }
})();

const nextConfig: NextConfig = {
  // The parent KaamAsaan folder has its own package-lock.json (the legacy web
  // SPA), so Turbopack would otherwise infer the wrong workspace root.
  turbopack: {
    root: path.resolve(__dirname)
  },
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: 'https',
            hostname: supabaseHost,
            pathname: '/storage/v1/object/public/**'
            // `search` is deliberately omitted (= allow any query string).
            // Product and brand images are cache-busted with ?v=<updated_at>
            // by utils/brandLogo.ts and services/marketplace.api.ts, so the
            // value differs per row and cannot be pinned to a literal.
            // Scope is still limited to our own public storage bucket.
          }
        ]
      : []
  }
};

export default nextConfig;
