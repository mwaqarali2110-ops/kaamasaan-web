import type { Metadata } from 'next';
import { SolarSizeTool } from '@/features/tools/SolarSizeTool';

export const metadata: Metadata = { title: 'Solar Size Tool' };

export default function Page() {
  return <SolarSizeTool />;
}
