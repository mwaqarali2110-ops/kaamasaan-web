import type { Metadata } from 'next';
import { SystemSummaryView } from '@/features/my-system/SystemSummaryView';
import { CustomSystemSummaryView } from '@/features/my-system/CustomSystemSummaryView';

export const metadata: Metadata = { title: 'System Summary' };

/**
 * Ported from kaamasaan-mobile/.../SystemSummaryScreen.tsx, which dispatches on
 * `route.params.mode === 'custom'` to the custom-system variant. Same contract
 * here, via the `mode` search param.
 */
export default async function SystemSummaryPage({ searchParams }: PageProps<'/my-system/summary'>) {
  const params = await searchParams;
  const mode = typeof params.mode === 'string' ? params.mode : undefined;
  const packageId = typeof params.packageId === 'string' ? params.packageId : undefined;

  if (mode === 'custom') return <CustomSystemSummaryView />;
  return <SystemSummaryView packageId={packageId} />;
}
