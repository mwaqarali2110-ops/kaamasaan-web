import type { Metadata } from 'next';
import { BatteryRecommendedSize } from '@/features/tools/BatteryRecommendedSize';

export const metadata: Metadata = { title: 'Recommended Battery Size' };

export default function Page() {
  return <BatteryRecommendedSize />;
}
