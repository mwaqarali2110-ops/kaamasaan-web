import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * The ported calculation engines in src/utils are the parity guarantee between
 * mobile and web (docs/BUILD_PROMPT.md §11). Their tests come from
 * kaamasaan-mobile/src/utils/*.test.ts, which never had a runner configured —
 * this is where they finally execute.
 *
 * .mts so Vite loads it as ESM natively.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Native replacement for vite-tsconfig-paths; resolves the "@/*" alias.
    tsconfigPaths: true
  },
  test: {
    // The engine tests are pure TypeScript and need no DOM. Booting jsdom for
    // each of them costs seconds per worker on Windows and was timing the pool
    // out. Component tests opt in per file with:  // @vitest-environment jsdom
    environment: 'node',
    pool: 'threads',
    globals: true,
    // Vitest does not read .env.local (that is Next.js behaviour), and
    // src/lib/env.ts resolves these at import. Pin fake values so tests are
    // deterministic and never point at the real Supabase project.
    env: {
      NEXT_PUBLIC_SUPABASE_URL: 'https://test-project.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key'
    },
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts']
  }
});
