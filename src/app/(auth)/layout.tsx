/**
 * Auth chrome: no sidebar or tab bar, just centred content on the warm
 * #FFFBF2 background the mobile auth screens use.
 *
 * Each page owns its own card — mobile's login hero sits *outside* the card
 * while signup/forgot use the shared AuthShell.
 */
export default function AuthLayout({ children }: LayoutProps<'/'>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FFFBF2] px-5 py-8">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
