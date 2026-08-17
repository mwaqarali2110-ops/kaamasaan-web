import type { Metadata } from 'next';
import { BatterySizeTool } from '@/features/tools/BatterySizeTool';

export const metadata: Metadata = { title: 'Battery Size Tool' };

export default function Page() {
  return <BatterySizeTool />;
}
