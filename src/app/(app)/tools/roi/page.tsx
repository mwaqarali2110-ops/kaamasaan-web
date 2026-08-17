import type { Metadata } from 'next';
import { ROICalculator } from '@/features/tools/ROICalculator';

export const metadata: Metadata = { title: 'ROI Calculator' };

export default function Page() {
  return <ROICalculator />;
}
