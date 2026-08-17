import type { Metadata } from 'next';
import { CustomSystemSummaryView } from '@/features/my-system/CustomSystemSummaryView';

export const metadata: Metadata = { title: 'Custom System' };

export default function CustomSystemSummaryPage() {
  return <CustomSystemSummaryView />;
}
