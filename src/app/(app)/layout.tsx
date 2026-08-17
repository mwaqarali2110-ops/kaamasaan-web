import { AppShell } from '@/components/layout/AppShell';
import { AuthBootstrap } from '@/components/auth/AuthBootstrap';

/**
 * The main app shell.
 *
 * Most routes here are guarded server-side by src/proxy.ts, but `/marketplace`
 * is deliberately public for SEO — so this layout must render correctly with or
 * without a session. `AuthBootstrap` handles the signed-out case (no session,
 * no profile) and the chrome degrades gracefully.
 */
export default function AppLayout({ children }: LayoutProps<'/'>) {
  return (
    <>
      <AuthBootstrap />
      <AppShell>{children}</AppShell>
    </>
  );
}
